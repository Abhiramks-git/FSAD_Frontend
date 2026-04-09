import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PublicOnlyRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    // If user has a single role property
    if (user.role) {
      if (user.role === 'investor') return <Navigate to="/investor" />;
      if (user.role === 'advisor') return <Navigate to="/advisor" />;
      if (user.role === 'analyst') return <Navigate to="/analyst" />;
      if (user.role === 'admin') return <Navigate to="/admin" />;
    }
    // If user has multiple roles (super user), redirect to a default dashboard (e.g., admin)
    if (user.roles && user.roles.length > 0) {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/" />;
  }
  return children;
};