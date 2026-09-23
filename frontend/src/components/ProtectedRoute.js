import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

/**
 * Route guard component protecting private views
 * @param {React.ReactNode} children - Nested components
 * @param {Array<string>} allowedRoles - Optional list of authorized roles
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Display a minimal spinner/placeholder while reading authentication state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Authenticating session...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login, preserving intended destination
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and current user's role is not allowed, redirect to /unauthorized
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const styles = {
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #334155',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  loadingText: {
    fontSize: '14px',
    letterSpacing: '0.025em',
  },
};

export default ProtectedRoute;
