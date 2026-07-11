import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { routes } from './routes';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConnectWalletPage from './pages/ConnectWalletPage';
import KYCVerificationPage from './pages/KYCVerificationPage';
import DashboardPage from './pages/DashboardPage';
import MapExplorerPage from './pages/MapExplorerPage';
import PaymentConfirmationPage from './pages/PaymentConfirmationPage';
import OwnershipTransferSuccessPage from './pages/OwnershipTransferSuccessPage';
import LandRegistrationPage from './pages/LandRegistrationPage';
import AuthorityDashboardPage from './pages/AuthorityDashboardPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}

        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/connect-wallet" element={<ConnectWalletPage />} />
        <Route path="/kyc" element={<KYCVerificationPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/map-explorer" element={<MapExplorerPage />} />
        <Route path="/payment" element={<PaymentConfirmationPage />} />
        <Route path="/transfer-success" element={<OwnershipTransferSuccessPage />} />
        <Route path="/land-registration" element={<LandRegistrationPage />} />
        <Route path="/authority-dashboard" element={<AuthorityDashboardPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
