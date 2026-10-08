import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { DomainFilter } from '../components/dashboard/DomainFilter';
import { SentimentOverviewChart } from '../components/dashboard/SentimentOverviewChart';
import { DomainPerformanceChart } from '../components/dashboard/DomainPerformanceChart';
import { RecentReviewsTable } from '../components/dashboard/RecentReviewsTable';
import { AcademicMappingCard } from '../components/dashboard/AcademicMappingCard';
import { SystemHealthSummaryCard } from '../components/dashboard/SystemHealthSummaryCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';

import { getDomains } from '../api/domains';
import { getReviews } from '../api/reviews';
import { checkBackendHealth } from '../api/health';
import { Domain, Review, ServiceHealthStatus, KPIStats, DomainPerformanceData } from '../types';
import { MessageSquare, ThumbsUp, ThumbsDown, Minus, Star } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [domains, setDomains] = useState<Domain[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [backendStatus, setBackendStatus] = useState<ServiceHealthStatus>({ online: false, message: 'Checking...' });
  const [analyticsStatus, setAnalyticsStatus] = useState<ServiceHealthStatus>({ online: false, message: 'Checking...' });
  const [healthLoading, setHealthLoading] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedDomains, fetchedReviews] = await Promise.all([
        getDomains(),
        getReviews(),
      ]);
      setDomains(fetchedDomains);
      setReviews(fetchedReviews);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  const loadHealth = async () => {
    setHealthLoading(true);
    const bHealth = await checkBackendHealth();
    setBackendStatus(bHealth);
    
    const isAnalyticsHealthy = bHealth.details?.services?.analytics?.status === 'healthy';
    setAnalyticsStatus({
      online: isAnalyticsHealthy,
      message: isAnalyticsHealthy ? 'Python FastAPI Engine Online' : 'Analytics offline',
      details: bHealth.details?.services?.analytics
    });
    
    setHealthLoading(false);
  };

  useEffect(() => {
    loadData();
    loadHealth();
  }, []);

  // Filter reviews by selected domain
  const filteredReviews = selectedDomain === 'ALL'
    ? reviews
    : reviews.filter((r) => r.domain?.code === selectedDomain || r.domainId === selectedDomain);

  // Compute KPI Statistics
  const totalReviews = filteredReviews.length;
  const positiveReviews = filteredReviews.filter((r) => r.sentimentResult?.sentimentLabel?.toLowerCase() === 'positive').length;
  const negativeReviews = filteredReviews.filter((r) => r.sentimentResult?.sentimentLabel?.toLowerCase() === 'negative').length;
  const neutralReviews = filteredReviews.filter((r) => r.sentimentResult?.sentimentLabel?.toLowerCase() === 'neutral').length;

  const totalRatingSum = filteredReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  const averageRating = totalReviews > 0 ? (totalRatingSum / totalReviews).toFixed(1) : '0.0';

  const positivePercent = totalReviews > 0 ? ((positiveReviews / totalReviews) * 100).toFixed(1) : '0.0';
  const negativePercent = totalReviews > 0 ? ((negativeReviews / totalReviews) * 100).toFixed(1) : '0.0';
  const neutralPercent = totalReviews > 0 ? ((neutralReviews / totalReviews) * 100).toFixed(1) : '0.0';

  // Compute Domain Performance data for charts
  const domainPerformance: DomainPerformanceData[] = domains.map((domain) => {
    const domainReviews = reviews.filter((r) => r.domainId === domain.id || r.domain?.code === domain.code);
    const count = domainReviews.length;
    const avgRating = count > 0 ? domainReviews.reduce((acc, r) => acc + r.rating, 0) / count : 0;
    const posCount = domainReviews.filter((r) => r.sentimentResult?.sentimentLabel?.toLowerCase() === 'positive').length;
    const posPercent = count > 0 ? (posCount / count) * 100 : 0;

    return {
      domainName: domain.name,
      code: domain.code,
      reviewCount: count || domain._count?.reviews || 0,
      averageRating: avgRating || 0,
      positivePercent: posPercent || 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Monitor reviews, customer sentiment, and analytics across multiple domains."
      >
        <DomainFilter
          selectedDomain={selectedDomain}
          onDomainChange={setSelectedDomain}
          domains={domains}
        />
      </PageHeader>

      {loading ? (
        <LoadingSpinner message="Fetching dashboard analytics & domain metrics..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <>
          {/* 5 KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Reviews"
              value={totalReviews}
              icon={MessageSquare}
              colorTheme="indigo"
            />
            <StatCard
              title="Positive Reviews"
              value={positiveReviews}
              subtitle={`${positivePercent}% of total`}
              icon={ThumbsUp}
              colorTheme="emerald"
            />
            <StatCard
              title="Negative Reviews"
              value={negativeReviews}
              subtitle={`${negativePercent}% of total`}
              icon={ThumbsDown}
              colorTheme="rose"
            />
            <StatCard
              title="Neutral Reviews"
              value={neutralReviews}
              subtitle={`${neutralPercent}% of total`}
              icon={Minus}
              colorTheme="slate"
            />
            <StatCard
              title="Average Rating"
              value={`${averageRating} / 5`}
              subtitle="Across selected domain"
              icon={Star}
              colorTheme="amber"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SentimentOverviewChart
                positiveCount={positiveReviews}
                neutralCount={neutralReviews}
                negativeCount={negativeReviews}
              />
            </div>

            <div className="lg:col-span-2">
              <DomainPerformanceChart data={domainPerformance} />
            </div>
          </div>

          {/* Recent Reviews Table */}
          <RecentReviewsTable reviews={filteredReviews.slice(0, 5)} />

          {/* Academic Mapping */}
          <AcademicMappingCard />

          {/* System Health */}
          <SystemHealthSummaryCard
            backendStatus={backendStatus}
            analyticsStatus={analyticsStatus}
            loading={healthLoading}
            onRefresh={loadHealth}
          />
        </>
      )}
    </div>
  );
};
