import axios from 'axios';
import prisma from '../config/database';

const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://localhost:8000';

export interface NetworkNode {
  id: string;
  type: 'customer' | 'product' | 'domain' | string;
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

export interface NetworkCommunity {
  id: string;
  size: number;
  nodes: string[];
}

export interface NetworkMetrics {
  nodeCount: number;
  edgeCount: number;
  averageDegree: number;
  density: number;
  connectedComponentsCount: number;
}

export interface NetworkAnalyticsResult {
  network: NetworkMetrics;
  topNodes: NetworkTopNode[];
  communities: NetworkCommunity[];
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export const getNetworkAnalytics = async (): Promise<NetworkAnalyticsResult> => {
  // 1. Fetch real PostgreSQL entity relationships
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
    },
  });

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      domainId: true,
    },
  });

  const domains = await prisma.domain.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  const reviews = await prisma.review.findMany({
    select: {
      id: true,
      customerId: true,
      productId: true,
      domainId: true,
    },
  });

  const nodes: NetworkNode[] = [];
  const edges: NetworkEdge[] = [];
  const addedNodes = new Set<string>();

  // 2. Build Customer Nodes (Users) - Privacy preserved (no email/passwordHash)
  users.forEach((u) => {
    if (!addedNodes.has(u.id)) {
      addedNodes.add(u.id);
      nodes.push({
        id: u.id,
        type: 'customer',
        label: u.fullName || 'Customer',
      });
    }
  });

  // 3. Build Product Nodes
  products.forEach((p) => {
    if (!addedNodes.has(p.id)) {
      addedNodes.add(p.id);
      nodes.push({
        id: p.id,
        type: 'product',
        label: p.name,
        metadata: { category: p.category },
      });
    }

    // Edge: Product BELONGS_TO Domain
    if (p.domainId) {
      edges.push({
        source: p.id,
        target: p.domainId,
        type: 'belongs_to',
        weight: 1.0,
      });
    }
  });

  // 4. Build Domain Nodes
  domains.forEach((d) => {
    if (!addedNodes.has(d.id)) {
      addedNodes.add(d.id);
      nodes.push({
        id: d.id,
        type: 'domain',
        label: d.name,
        metadata: { code: d.code },
      });
    }
  });

  // 5. Build Review Edges (Customer REVIEWED Product & Customer REVIEWED_IN Domain)
  reviews.forEach((r) => {
    if (r.customerId) {
      // Ensure customer node exists if not fetched in users list
      if (!addedNodes.has(r.customerId)) {
        addedNodes.add(r.customerId);
        nodes.push({
          id: r.customerId,
          type: 'customer',
          label: `Customer ${r.customerId.substring(0, 6)}`,
        });
      }

      // Edge: Customer REVIEWED Product
      if (r.productId && addedNodes.has(r.productId)) {
        edges.push({
          source: r.customerId,
          target: r.productId,
          type: 'reviewed',
          weight: 1.0,
        });
      }
    }
  });

  // 6. If no nodes exist in DB, return empty result without failing
  if (nodes.length === 0) {
    return {
      network: {
        nodeCount: 0,
        edgeCount: 0,
        averageDegree: 0.0,
        density: 0.0,
        connectedComponentsCount: 0,
      },
      topNodes: [],
      communities: [],
      nodes: [],
      edges: [],
    };
  }

  // 7. Send graph data to Python FastAPI Analytics Engine
  const response = await axios.post(`${ANALYTICS_URL}/api/analytics/network`, {
    nodes,
    edges,
  });

  const resultData = response.data?.data;
  if (!resultData) {
    throw new Error('Invalid response structure from Python Network Analytics Engine');
  }

  return resultData;
};
