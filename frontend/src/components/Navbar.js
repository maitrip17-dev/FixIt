import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import NotificationBell from './NotificationBell.js';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return { backgroundColor: '#ef4444', color: '#ffffff' };
      case 'worker':
        return { backgroundColor: '#f59e0b', color: '#ffffff' };
      default:
        return { backgroundColor: '#3b82f6', color: '#ffffff' };
    }
  };

  const getPortalLabel = () => {
    switch (user?.role) {
      case 'worker':
        return '🛠️ Task Hub';
      case 'admin':
        return '🛡️ Operations Center';
      default:
        return '📋 My Tickets';
    }
  };

  const canCreate = user?.role === 'user' || user?.role === 'admin';

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Left: Brand / Logo */}
        <div style={styles.left}>
          <Link to="/dashboard" style={styles.brand}>
            <span style={styles.logoBadge}>FixIt</span>
            <span style={styles.brandTitle}>Maintenance Portal</span>
          </Link>
        </div>

        {/* Center / Nav Links */}
        <div style={styles.links}>
          <Link
            to="/dashboard"
            style={{
              ...styles.navLink,
              ...(location.pathname === '/dashboard' || location.pathname === '/complaints'
                ? styles.activeNavLink
                : {}),
            }}
          >
            {getPortalLabel()}
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/analytics"
              style={{
                ...styles.navLink,
                ...(location.pathname === '/analytics' || location.pathname === '/maintenance-intelligence'
                  ? styles.activeNavLink
                  : {}),
              }}
            >
              🧠 Intelligence
            </Link>
          )}

          {canCreate && (
            <Link
              to="/complaints/new"
              style={{
                ...styles.navLink,
                ...styles.createButton,
                ...(location.pathname === '/complaints/new' ? styles.activeCreateButton : {}),
              }}
            >
              + File New Complaint
            </Link>
          )}
        </div>

        {/* Right: Notifications, User Profile & Logout */}
        <div style={styles.right}>
          <NotificationBell />

          <div style={styles.userInfo}>
            <div style={styles.userNameBlock}>
              <span style={styles.userName}>{user?.name || 'User'}</span>
              {user?.role === 'worker' && user?.skillCategory && (
                <span style={styles.skillSubtitle}>Trade: {user.skillCategory}</span>
              )}
            </div>
            <span
              style={{
                ...styles.roleBadge,
                ...getRoleBadgeStyle(user?.role),
              }}
            >
              {user?.role?.toUpperCase()}
            </span>
          </div>

          <button onClick={handleLogout} style={styles.logoutBtn} title="Sign Out">
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#1e293b',
    borderBottom: '1px solid #334155',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: '#ffffff',
  },
  logoBadge: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '14px',
    letterSpacing: '1px',
    padding: '4px 10px',
    borderRadius: '8px',
    textTransform: 'uppercase',
  },
  brandTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f8fafc',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    padding: '8px 14px',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  activeNavLink: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
  },
  createButton: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
  },
  activeCreateButton: {
    backgroundColor: '#1d4ed8',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userNameBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f8fafc',
    lineHeight: '1.2',
  },
  skillSubtitle: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  roleBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '9999px',
    letterSpacing: '0.05em',
  },
  logoutBtn: {
    backgroundColor: '#334155',
    color: '#e2e8f0',
    border: '1px solid #475569',
    borderRadius: '8px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default Navbar;
