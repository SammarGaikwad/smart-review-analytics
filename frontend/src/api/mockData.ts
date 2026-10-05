import { Domain, Product, Review, User, AuditLog } from '../types';

export const MOCK_DOMAINS: Domain[] = [
  {
    id: 'd1000000-0000-0000-0000-000000000001',
    name: 'E-commerce',
    code: 'ecommerce',
    description: 'Retail products, online stores, apparel, and consumer goods.',
    createdAt: '2026-01-10T10:00:00.000Z',
    _count: { products: 4, reviews: 15 }
  },
  {
    id: 'd2000000-0000-0000-0000-000000000002',
    name: 'Electronics',
    code: 'electronics',
    description: 'Gadgets, smartphones, laptops, audio equipment, and smart devices.',
    createdAt: '2026-01-10T10:00:00.000Z',
    _count: { products: 3, reviews: 12 }
  },
  {
    id: 'd3000000-0000-0000-0000-000000000003',
    name: 'Hotels',
    code: 'hotels',
    description: 'Hospitality, luxury resorts, room service, and travel accommodations.',
    createdAt: '2026-01-10T10:00:00.000Z',
    _count: { products: 2, reviews: 18 }
  },
  {
    id: 'd4000000-0000-0000-0000-000000000004',
    name: 'Movies',
    code: 'movies',
    description: 'Cinema, streaming releases, films, and entertainment media.',
    createdAt: '2026-01-10T10:00:00.000Z',
    _count: { products: 3, reviews: 24 }
  },
  {
    id: 'd5000000-0000-0000-0000-000000000005',
    name: 'Restaurants',
    code: 'restaurants',
    description: 'Dining, cafes, food quality, ambience, and culinary experiences.',
    createdAt: '2026-01-10T10:00:00.000Z',
    _count: { products: 3, reviews: 10 }
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1000000-0000-0000-0000-000000000001',
    domainId: 'd1000000-0000-0000-0000-000000000001',
    name: 'Ergonomic Office Chair',
    category: 'Furniture',
    description: 'Adjustable lumbar support ergonomic mesh chair.',
    domain: MOCK_DOMAINS[0],
    _count: { reviews: 5 }
  },
  {
    id: 'p2000000-0000-0000-0000-000000000002',
    domainId: 'd2000000-0000-0000-0000-000000000002',
    name: 'SoundMax Pro Wireless Headphones',
    category: 'Audio',
    description: 'Active noise-cancelling over-ear wireless headphones.',
    domain: MOCK_DOMAINS[1],
    _count: { reviews: 4 }
  },
  {
    id: 'p3000000-0000-0000-0000-000000000003',
    domainId: 'd3000000-0000-0000-0000-000000000003',
    name: 'Grand Horizon Resort & Spa',
    category: 'Luxury Hotel',
    description: 'Five-star beachside luxury hotel and wellness spa.',
    domain: MOCK_DOMAINS[2],
    _count: { reviews: 8 }
  },
  {
    id: 'p4000000-0000-0000-0000-000000000004',
    domainId: 'd4000000-0000-0000-0000-000000000004',
    name: 'Interstellar Odyssey 3D',
    category: 'Sci-Fi Film',
    description: 'Blockbuster space exploration sci-fi film.',
    domain: MOCK_DOMAINS[3],
    _count: { reviews: 10 }
  },
  {
    id: 'p5000000-0000-0000-0000-000000000005',
    domainId: 'd5000000-0000-0000-0000-000000000005',
    name: 'Bistro De Paris Gourmet',
    category: 'Fine Dining',
    description: 'Authentic French cuisine in downtown district.',
    domain: MOCK_DOMAINS[4],
    _count: { reviews: 4 }
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: '8a0e72dc-ca26-4cab-8285-df8d34355750',
    domainId: 'd1000000-0000-0000-0000-000000000001',
    productId: 'p1000000-0000-0000-0000-000000000001',
    reviewText: 'Great ergonomic chair! Provides excellent back support for long working hours and the mesh keeps it cool all day.',
    rating: 4.5,
    source: 'E-Commerce Store',
    reviewDate: '2026-10-02T14:30:00.000Z',
    domain: MOCK_DOMAINS[0],
    product: MOCK_PRODUCTS[0],
    customer: { id: 'c1', fullName: 'Alex Mercer', email: 'alex@example.com' },
    sentimentResult: {
      id: 'sr-1',
      reviewId: '8a0e72dc-ca26-4cab-8285-df8d34355750',
      sentimentLabel: 'Positive',
      sentimentScore: 0.9022,
      positiveProb: 0.548,
      neutralProb: 0.452,
      negativeProb: 0.0,
      analyzedAt: '2026-10-02T14:31:00.000Z'
    },
    reviewKeywords: [
      { id: 'rk1', reviewId: '8a0e72dc-ca26-4cab-8285-df8d34355750', keywordId: 'k1', score: 0.95, keyword: { id: 'k1', word: 'ergonomic', category: 'feature' } },
      { id: 'rk2', reviewId: '8a0e72dc-ca26-4cab-8285-df8d34355750', keywordId: 'k2', score: 0.88, keyword: { id: 'k2', word: 'support', category: 'comfort' } },
      { id: 'rk3', reviewId: '8a0e72dc-ca26-4cab-8285-df8d34355750', keywordId: 'k3', score: 0.76, keyword: { id: 'k3', word: 'quality', category: 'build' } }
    ],
    reviewTopics: [
      { id: 'rt1', reviewId: '8a0e72dc-ca26-4cab-8285-df8d34355750', topicId: 't1', probability: 0.82, topic: { id: 't1', name: 'Ergonomics & Comfort', description: 'Lumbar support & seating comfort' } }
    ]
  },
  {
    id: '9b1f83ed-db37-5dbc-9396-eg9e45466861',
    domainId: 'd2000000-0000-0000-0000-000000000002',
    productId: 'p2000000-0000-0000-0000-000000000002',
    reviewText: 'Excellent audio quality but battery life is extremely poor and bluetooth keeps disconnecting randomly.',
    rating: 2.0,
    source: 'Electronics Web',
    reviewDate: '2026-10-02T16:15:00.000Z',
    domain: MOCK_DOMAINS[1],
    product: MOCK_PRODUCTS[1],
    customer: { id: 'c2', fullName: 'Elena Rostova', email: 'elena@example.com' },
    sentimentResult: {
      id: 'sr-2',
      reviewId: '9b1f83ed-db37-5dbc-9396-eg9e45466861',
      sentimentLabel: 'Negative',
      sentimentScore: -0.4215,
      positiveProb: 0.150,
      neutralProb: 0.250,
      negativeProb: 0.600,
      analyzedAt: '2026-10-02T16:16:00.000Z'
    },
    reviewKeywords: [
      { id: 'rk4', reviewId: '9b1f83ed-db37-5dbc-9396-eg9e45466861', keywordId: 'k4', score: 0.92, keyword: { id: 'k4', word: 'battery', category: 'hardware' } },
      { id: 'rk5', reviewId: '9b1f83ed-db37-5dbc-9396-eg9e45466861', keywordId: 'k5', score: 0.85, keyword: { id: 'k5', word: 'disconnect', category: 'connectivity' } }
    ],
    reviewTopics: [
      { id: 'rt2', reviewId: '9b1f83ed-db37-5dbc-9396-eg9e45466861', topicId: 't2', probability: 0.90, topic: { id: 't2', name: 'Battery & Connectivity', description: 'Power duration and Bluetooth reliability' } }
    ]
  },
  {
    id: '0c2a94fe-ec48-6ecd-0407-fh0f56577972',
    domainId: 'd3000000-0000-0000-0000-000000000003',
    productId: 'p3000000-0000-0000-0000-000000000003',
    reviewText: 'Outstanding room cleanliness, courteous staff, and wonderful ocean view. Breakfast spread was top notch!',
    rating: 5.0,
    source: 'Hotel Booking API',
    reviewDate: '2026-10-02T18:40:00.000Z',
    domain: MOCK_DOMAINS[2],
    product: MOCK_PRODUCTS[2],
    customer: { id: 'c3', fullName: 'David Chen', email: 'david@example.com' },
    sentimentResult: {
      id: 'sr-3',
      reviewId: '0c2a94fe-ec48-6ecd-0407-fh0f56577972',
      sentimentLabel: 'Positive',
      sentimentScore: 0.9480,
      positiveProb: 0.720,
      neutralProb: 0.280,
      negativeProb: 0.0,
      analyzedAt: '2026-10-02T18:41:00.000Z'
    },
    reviewKeywords: [
      { id: 'rk6', reviewId: '0c2a94fe-ec48-6ecd-0407-fh0f56577972', keywordId: 'k6', score: 0.98, keyword: { id: 'k6', word: 'cleanliness', category: 'hygiene' } },
      { id: 'rk7', reviewId: '0c2a94fe-ec48-6ecd-0407-fh0f56577972', keywordId: 'k7', score: 0.91, keyword: { id: 'k7', word: 'staff', category: 'service' } }
    ],
    reviewTopics: [
      { id: 'rt3', reviewId: '0c2a94fe-ec48-6ecd-0407-fh0f56577972', topicId: 't3', probability: 0.95, topic: { id: 't3', name: 'Hospitality & Staff', description: 'Customer service, room cleanliness, and dining' } }
    ]
  }
];

export const MOCK_USERS: User[] = [
  { id: 'u1', fullName: 'Sammar Gaikwad', email: 'sammar.g@smartreview.io', role: 'Admin', isActive: true, lastActivity: '2 minutes ago' },
  { id: 'u2', fullName: 'Dr. Anita Sharma', email: 'anita.s@academic.edu', role: 'Manager', isActive: true, lastActivity: '15 minutes ago' },
  { id: 'u3', fullName: 'Rahul Verma', email: 'rahul.v@analytics.io', role: 'Analyst', isActive: true, lastActivity: '1 hour ago' },
  { id: 'u4', fullName: 'Priya Nair', email: 'priya.n@enterprise.com', role: 'Viewer', isActive: true, lastActivity: '3 hours ago' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: '2026-10-04T13:10:00Z', userEmail: 'sammar.g@smartreview.io', action: 'REVIEW_ANALYZED', module: 'ASTMA Engine', resource: 'Review #8a0e72dc', status: 'SUCCESS', ipAddress: '127.0.0.1' },
  { id: 'log-2', timestamp: '2026-10-04T12:45:00Z', userEmail: 'anita.s@academic.edu', action: 'DOMAIN_UPDATED', module: 'ES Admin', resource: 'Domain: E-commerce', status: 'SUCCESS', ipAddress: '192.168.1.10' },
  { id: 'log-3', timestamp: '2026-10-04T11:20:00Z', userEmail: 'rahul.v@analytics.io', action: 'PRODUCT_CREATED', module: 'Inventory', resource: 'Product: SoundMax Pro', status: 'SUCCESS', ipAddress: '127.0.0.1' },
  { id: 'log-4', timestamp: '2026-10-04T09:00:00Z', userEmail: 'sammar.g@smartreview.io', action: 'USER_LOGIN', module: 'Auth Service', resource: 'Session #9941', status: 'SUCCESS', ipAddress: '127.0.0.1' },
];
