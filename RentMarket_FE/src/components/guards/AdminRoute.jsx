import { Navigate, Outlet } from 'react-router-dom';
import { parseToken } from '../../services/authService';

/**
 * Route guard cho admin — chỉ cho phép user có role ADMIN.
 * Nếu không phải admin → redirect về trang chủ.
 */
const AdminRoute = () => {
  const tokenInfo = parseToken();

  if (!tokenInfo) {
    return <Navigate to="/login" replace />;
  }

  if (!tokenInfo.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
