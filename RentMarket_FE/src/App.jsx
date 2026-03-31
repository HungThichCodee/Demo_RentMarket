import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

// Guards
import ProtectedRoute from './components/guards/ProtectedRoute';
import AdminRoute from './components/guards/AdminRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OAuth2RedirectHandler from './pages/auth/OAuth2RedirectHandler';

// Product pages
import Index from './pages/product/Index';
import ProductDetail from './pages/product/ProductDetail';
import MyItems from './pages/product/MyItems';
import MyFavorites from './pages/product/MyFavorites';

// Rental pages
import MyRentals from './pages/rental/MyRentals';
import MyRequests from './pages/rental/MyRequests';
import BookingDetail from './pages/rental/BookingDetail';
import Dashboard from './pages/rental/Dashboard';
import PaymentResult from './pages/rental/PaymentResult';
import WalletDeposit from './pages/rental/WalletDeposit';

// Profile
import Profile from './pages/profile/Profile';

// Chat
import ChatPage from './pages/chat/ChatPage';

// Admin pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* Protected Routes — User (MainLayout + Header) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/my-items" element={<MyItems />} />
            <Route path="/my-favorites" element={<MyFavorites />} />
            <Route path="/my-rentals" element={<MyRentals />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rental/bookings/:id" element={<BookingDetail />} />
            <Route path="/payment/result" element={<PaymentResult />} />
            <Route path="/wallet" element={<WalletDeposit />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>
        </Route>

        {/* Protected Routes — Admin (AdminLayout + Sidebar) */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
