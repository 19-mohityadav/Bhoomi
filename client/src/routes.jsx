import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConnectWalletPage from './pages/ConnectWalletPage';
import KYCVerificationPage from './pages/KYCVerificationPage';
import DashboardPage from './pages/DashboardPage';
import MarketPage from './pages/MarketPage';
import NFT_miningPage from './pages/NFT_miningPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import AuthorityDashboardPage from './pages/AuthorityDashboardPage';
import LandRegistrationPage from './pages/LandRegistrationPage';
import MapExplorerPage from './pages/MapExplorerPage';
import OwnershipTransferSuccessPage from './pages/OwnershipTransferSuccessPage';
import PaymentConfirmationPage from './pages/PaymentConfirmationPage';

export const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/connect-wallet', element: <ConnectWalletPage /> },
  { path: '/kyc', element: <KYCVerificationPage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/marketplace', element: <MarketPage /> },
  { path: '/mint', element: <NFT_miningPage /> },
  { path: '/property/:id', element: <PropertyDetailsPage /> },
  { path: '/authority-dashboard', element: <AuthorityDashboardPage /> },
  { path: '/land-registration', element: <LandRegistrationPage /> },
  { path: '/map-explorer', element: <MapExplorerPage /> },
  { path: '/ownership-transfer-success', element: <OwnershipTransferSuccessPage /> },
  { path: '/payment-confirmation', element: <PaymentConfirmationPage /> },
];
