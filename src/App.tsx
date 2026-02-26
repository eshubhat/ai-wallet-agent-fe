import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletContextProvider } from './components/wallet/WalletContextProvider';
import { AuthProvider } from './contexts/AuthContext';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AnalyticsDashboard } from './pages/dashboard/Dashboard';

export default function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'missing_client_id_restart_vite';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <WalletContextProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </AuthProvider>
        </WalletContextProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
