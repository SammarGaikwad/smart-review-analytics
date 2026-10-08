import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.routes';
import domainRoutes from './routes/domain.routes';
import productRoutes from './routes/product.routes';
import reviewRoutes from './routes/review.routes';
import sentimentRoutes from "./routes/sentiment.routes";
import keywordRoutes from "./routes/keyword.routes";
import topicRoutes from "./routes/topic.routes";
import clusteringRoutes from "./routes/clustering.routes";
import webAnalyticsRoutes from "./routes/webAnalytics.routes";
import activityRoutes from "./routes/activity.routes";
import networkRoutes from "./routes/network.routes";
import authRoutes from "./routes/auth.routes";
import auditRoutes from "./routes/audit.routes";
import userRoutes from "./routes/userManagement.routes";
import customerRoutes from "./routes/customer.routes";

dotenv.config();

const app: Application = express();

// Middleware
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && !process.env.CORS_ORIGIN) {
  console.error("FATAL: CORS_ORIGIN environment variable is missing in production.");
  process.exit(1);
}
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth, User Management & Enterprise Audit Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit-logs", auditRoutes);

// Analytics & NLP Service Routes
app.use("/api/sentiment", sentimentRoutes);
app.use("/api/keywords", keywordRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/clustering", clusteringRoutes);
app.use("/api/analytics/network", networkRoutes);
app.use("/api/analytics", webAnalyticsRoutes);
app.use("/api/analytics", activityRoutes);
app.use("/api/customers", customerRoutes);

// Health Check API
app.use('/api/health', healthRoutes);

// Domain API
app.use('/api/domains', domainRoutes);

// Product API
app.use('/api/products', productRoutes);

// Review API
app.use('/api/reviews', reviewRoutes);

// Base Route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Smart Review Analytics Platform API',
    documentation: '/api/health',
    status: 'online'
  });
});

// Global 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[System Error]:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
