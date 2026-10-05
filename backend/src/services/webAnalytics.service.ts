import prisma from '../config/database';

export interface WebAnalyticsParams {
  period?: 'day' | 'week' | 'month';
  domainId?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
}

export const getWebAnalytics = async (params: WebAnalyticsParams) => {
  const period = params.period || 'day';

  // Build date filter clause if startDate or endDate provided
  const dateFilter: any = {};
  if (params.startDate) {
    const start = new Date(params.startDate);
    if (!isNaN(start.getTime())) {
      dateFilter.gte = start;
    }
  }
  if (params.endDate) {
    const end = new Date(params.endDate);
    if (!isNaN(end.getTime())) {
      dateFilter.lte = end;
    }
  }

  // Build review query filter
  const reviewWhere: any = {};
  if (Object.keys(dateFilter).length > 0) {
    reviewWhere.reviewDate = dateFilter;
  }
  if (params.domainId) {
    reviewWhere.domainId = params.domainId;
  }
  if (params.source) {
    reviewWhere.source = params.source;
  }

  // 1. Fetch filtered reviews with relations
  const reviews = await prisma.review.findMany({
    where: reviewWhere,
    include: {
      domain: {
        select: { id: true, name: true, code: true },
      },
      product: {
        select: { id: true, name: true, category: true },
      },
      sentimentResult: true,
      reviewTopics: {
        include: {
          topic: true,
        },
      },
    },
    orderBy: { reviewDate: 'asc' },
  });

  // 2. Fetch all domains and products count
  const totalDomains = await prisma.domain.count();
  const totalProducts = await prisma.product.count();

  // 3. Fetch Activity Events
  const activityWhere: any = {};
  if (Object.keys(dateFilter).length > 0) {
    activityWhere.timestamp = dateFilter;
  }
  const activityEvents = await prisma.activityEvent.findMany({
    where: activityWhere,
    orderBy: { timestamp: 'desc' },
    take: 100,
  });

  // 4. Fetch Cluster Summary
  const clusters = await prisma.cluster.findMany({
    orderBy: { clusterNumber: 'asc' },
  });

  // --- COMPUTE METRICS ---

  // Overview KPIs
  const totalReviews = reviews.length;
  const ratingSum = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  const averageRating = totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(2)) : 0.0;
  const totalActivityEvents = activityEvents.length;

  // Reviews by Domain
  const domainMap: { [id: string]: { name: string; code: string; count: number; ratingSum: number } } = {};
  for (const r of reviews) {
    const dId = r.domainId;
    const dName = r.domain?.name || 'Unknown';
    const dCode = r.domain?.code || 'unknown';
    if (!domainMap[dId]) {
      domainMap[dId] = { name: dName, code: dCode, count: 0, ratingSum: 0 };
    }
    domainMap[dId].count += 1;
    domainMap[dId].ratingSum += r.rating;
  }

  const reviewsByDomain = Object.values(domainMap).map((d) => ({
    domainName: d.name,
    code: d.code,
    reviewCount: d.count,
    averageRating: Number((d.ratingSum / d.count).toFixed(2)),
  }));

  // Reviews by Source
  const sourceMap: { [source: string]: number } = {};
  for (const r of reviews) {
    const src = r.source || 'manual';
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  }
  const reviewsBySource = Object.entries(sourceMap).map(([source, count]) => ({
    source,
    count,
  }));

  // Rating Distribution (1 to 5 stars)
  const ratingDist: { [stars: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.floor(r.rating)));
    ratingDist[star] = (ratingDist[star] || 0) + 1;
  }
  const ratingDistribution = [1, 2, 3, 4, 5].map((stars) => ({
    stars: `${stars} Star${stars > 1 ? 's' : ''}`,
    count: ratingDist[stars] || 0,
  }));

  // Sentiment Distribution
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  for (const r of reviews) {
    const label = (r.sentimentResult?.sentimentLabel || '').toLowerCase();
    if (label.includes('pos')) positiveCount++;
    else if (label.includes('neg')) negativeCount++;
    else if (label.includes('neu')) neutralCount++;
  }

  const sentimentDistribution = [
    { label: 'Positive', count: positiveCount, percentage: totalReviews > 0 ? Number(((positiveCount / totalReviews) * 100).toFixed(1)) : 0 },
    { label: 'Neutral', count: neutralCount, percentage: totalReviews > 0 ? Number(((neutralCount / totalReviews) * 100).toFixed(1)) : 0 },
    { label: 'Negative', count: negativeCount, percentage: totalReviews > 0 ? Number(((negativeCount / totalReviews) * 100).toFixed(1)) : 0 },
  ];

  // Time-Series: Reviews Over Time
  const timeSeriesMap: { [dateStr: string]: { date: string; count: number; avgRating: number; ratingSum: number } } = {};
  for (const r of reviews) {
    const dateObj = new Date(r.reviewDate);
    let key = dateObj.toISOString().split('T')[0]; // Default YYYY-MM-DD for day

    if (period === 'month') {
      key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    } else if (period === 'week') {
      // Calculate start of week (Sunday)
      const dayOfWeek = dateObj.getDay();
      const weekStart = new Date(dateObj);
      weekStart.setDate(dateObj.getDate() - dayOfWeek);
      key = weekStart.toISOString().split('T')[0];
    }

    if (!timeSeriesMap[key]) {
      timeSeriesMap[key] = { date: key, count: 0, avgRating: 0, ratingSum: 0 };
    }
    timeSeriesMap[key].count += 1;
    timeSeriesMap[key].ratingSum += r.rating;
  }

  const reviewsOverTime = Object.values(timeSeriesMap).map((ts) => ({
    date: ts.date,
    count: ts.count,
    averageRating: Number((ts.ratingSum / ts.count).toFixed(2)),
  }));

  // Top Topics Summary
  const topicMap: { [name: string]: { name: string; count: number; probSum: number } } = {};
  for (const r of reviews) {
    for (const rt of r.reviewTopics) {
      const tName = rt.topic.name;
      if (!topicMap[tName]) {
        topicMap[tName] = { name: tName, count: 0, probSum: 0 };
      }
      topicMap[tName].count += 1;
      topicMap[tName].probSum += rt.probability;
    }
  }

  const topTopics = Object.values(topicMap)
    .map((t) => ({
      topicName: t.name,
      mentionCount: t.count,
      averageProbability: Number((t.probSum / t.count).toFixed(2)),
    }))
    .sort((a, b) => b.mentionCount - a.mentionCount);

  // Cluster Summary
  const clusterSummary = clusters.map((c) => ({
    clusterNumber: c.clusterNumber,
    name: c.name,
    description: c.description,
    reviewCount: c.reviewCount,
  }));

  // Activity Events Breakdown
  const eventTypeMap: { [type: string]: number } = {};
  for (const ev of activityEvents) {
    eventTypeMap[ev.eventType] = (eventTypeMap[ev.eventType] || 0) + 1;
  }
  const activityByEventType = Object.entries(eventTypeMap).map(([eventType, count]) => ({
    eventType,
    count,
  }));

  return {
    period,
    filters: {
      domainId: params.domainId || null,
      source: params.source || null,
      startDate: params.startDate || null,
      endDate: params.endDate || null,
    },
    overview: {
      totalReviews,
      averageRating,
      totalDomains,
      totalProducts,
      totalActivityEvents,
    },
    reviewsByDomain,
    reviewsBySource,
    ratingDistribution,
    sentimentDistribution,
    reviewsOverTime,
    topTopics,
    clusterSummary,
    activitySummary: {
      totalEvents: activityEvents.length,
      eventsByType: activityByEventType,
      recentEvents: activityEvents.slice(0, 10).map((ev) => ({
        id: ev.id,
        eventType: ev.eventType,
        path: ev.path,
        timestamp: ev.timestamp,
      })),
    },
  };
};
