import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    // Show loading spinner while checking auth status
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // Render children if authenticated
  return children;
};

export default ProtectedRoute;