import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletContextProvider } from './components/wallet/WalletContextProvider';
import { AuthProvider } from './contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Dynamically import pages for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(module => ({ default: module.AuthPage })));
const AnalyticsDashboard = lazy(() => import('./pages/dashboard/Dashboard').then(module => ({ default: module.AnalyticsDashboard })));

export default function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'missing_client_id_restart_vite';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <WalletContextProvider>
          <AuthProvider>
            <Suspense fallback={
              <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner" />
              </div>
            }>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </WalletContextProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
