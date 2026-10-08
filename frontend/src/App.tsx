import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute } from './components/routes/ProtectedRoutes';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ReviewDetailsPage } from './pages/ReviewDetailsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DomainsPage } from './pages/DomainsPage';
import { ProductsPage } from './pages/ProductsPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { CustomerInsightsPage } from './pages/CustomerInsightsPage';
import { SystemStatusPage } from './pages/SystemStatusPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Enterprise Layout Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="reviews/:id" element={<ReviewDetailsPage />} />
            <Route
              path="analytics"
              element={
                <RoleRoute requiredRoles={['Admin', 'Analyst']}>
                  <AnalyticsPage />
                </RoleRoute>
              }
            />
            <Route path="domains" element={<DomainsPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="customers" element={
              <RoleRoute requiredRoles={['Admin', 'Analyst']}>
                <CustomerInsightsPage />
              </RoleRoute>
            } />
            <Route path="reports" element={<ReportsPage />} />
            <Route
              path="users"
              element={
                <RoleRoute requiredRoles={['Admin']}>
                  <UsersPage />
                </RoleRoute>
              }
            />
            <Route
              path="audit-logs"
              element={
                <RoleRoute requiredRoles={['Admin']}>
                  <AuditLogsPage />
                </RoleRoute>
              }
            />
            <Route path="system" element={<SystemStatusPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
