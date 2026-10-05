// Types definition for Smart Review Analytics Platform Frontend

export interface Domain {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  products?: Product[];
  _count?: {
    products?: number;
    reviews?: number;
  };
}

export interface Product {
  id: string;
  domainId: string;
  name: string;
  category?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  domain?: Domain;
  reviews?: Review[];
  _count?: {
    reviews?: number;
  };
}

export interface SentimentResult {
  id: string;
  reviewId: string;
  sentimentLabel: 'Positive' | 'Neutral' | 'Negative' | string;
  sentimentScore: number;
  positiveProb: number;
  neutralProb: number;
  negativeProb: number;
  analyzedAt: string;
}

export interface ReviewKeyword {
  id: string;
  reviewId: string;
  keywordId: string;
  score: number;
  keyword?: {
    id: string;
    word: string;
    category?: string;
  };
}

export interface ReviewTopic {
  id: string;
  reviewId: string;
  topicId: string;
  probability: number;
  topic?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface Review {
  id: string;
  customerId?: string | null;
  domainId: string;
  productId: string;
  reviewText: string;
  rating: number;
  source: string;
  reviewDate: string;
  createdAt?: string;
  updatedAt?: string;
  domain?: Domain;
  product?: Product;
  customer?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  sentimentResult?: SentimentResult | null;
  reviewKeywords?: ReviewKeyword[];
  reviewTopics?: ReviewTopic[];
}

export interface ServiceHealthStatus {
  online: boolean;
  message: string;
  details?: any;
}

export interface SystemHealthOverview {
  frontend: ServiceHealthStatus;
  backend: ServiceHealthStatus;
  analytics: ServiceHealthStatus;
  database: ServiceHealthStatus;
}

export interface KPIStats {
  totalReviews: number;
  positiveReviews: number;
  neutralReviews: number;
  negativeReviews: number;
  averageRating: number;
  reviewTrendPercent?: number;
  positivePercent?: number;
  negativePercent?: number;
  neutralPercent?: number;
}

export interface DomainPerformanceData {
  domainName: string;
  code: string;
  reviewCount: number;
  averageRating: number;
  positivePercent: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Analyst' | 'Viewer' | string;
  isActive: boolean;
  lastActivity?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail?: string;
  action: string;
  module?: string;
  resource: string;
  status: 'SUCCESS' | 'FAILURE' | string;
  ipAddress?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  isActive?: boolean;
  createdAt?: string;
}

export interface RoleItem {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
}

export interface UserManagementUser {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: string[];
  userRoles?: Array<{
    id: string;
    roleId: string;
    roleName: string;
    description?: string;
  }>;
}

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  resource: string;
  ipAddress?: string | null;
  status: string;
  timestamp: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  } | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface WebAnalyticsResult {
  overview: {
    totalReviews: number;
    averageRating: number;
    totalDomains: number;
    totalProducts: number;
    sentimentBreakdown: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  reviewsByDomain: Array<{
    domainId: string;
    name: string;
    code: string;
    reviewCount: number;
    averageRating: number;
  }>;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
  reviewsOverTime: Array<{
    date: string;
    count: number;
    avgRating: number;
  }>;
  topTopics: Array<{
    topicId: string;
    name: string;
    count: number;
    avgProbability: number;
  }>;
  clusterSummary: Array<{
    clusterNumber: number;
    name: string;
    reviewCount: number;
  }>;
  recentActivity: Array<{
    id: string;
    eventType: string;
    path: string | null;
    timestamp: string;
    userEmail: string | null;
  }>;
}

export interface NetworkNode {
  id: string;
  type: string;
  label: string;
  metadata?: Record<string, any>;
  degree?: number;
  degreeCentrality?: number;
  closenessCentrality?: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
}

export interface NetworkTopNode {
  nodeId: string;
  label: string;
  type: string;
  degree: number;
  degreeCentrality: number;
}

export interface NetworkAnalyticsResult {
  network: {
    nodeCount: number;
    edgeCount: number;
    averageDegree: number;
    density: number;
    connectedComponentsCount: number;
  };
  topNodes: NetworkTopNode[];
  communities: Array<{
    id: string;
    size: number;
    nodes: string[];
  }>;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}
