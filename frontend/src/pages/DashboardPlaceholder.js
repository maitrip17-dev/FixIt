import { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import api from '../api/axios.js';

const DashboardPlaceholder = () => {
  const { user, logout } = useAuth();
  const [apiResponse, setApiResponse] = useState(null);
  const [testingEndpoint, setTestingEndpoint] = useState(false);

  // Test the protected GET /api/auth/me endpoint using Axios interceptor
  const testProtectedEndpoint = async () => {
    setTestingEndpoint(true);
    try {
      const res = await api.get('/auth/me');
      setApiResponse({
        success: true,
        data: res.data,
      });
    } catch (err) {
      setApiResponse({
        success: false,
        data: err.response?.data || { message: 'Request failed' },
      });
    } finally {
      setTestingEndpoint(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return '#ef4444';
      case 'worker':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.topRow}>
            <span style={styles.logoBadge}>FixIt Dashboard</span>
            <button onClick={logout} style={styles.logoutBtn}>
              Log Out
            </button>
          </div>
          <h1 style={styles.title}>Welcome, {user?.name || 'User'}!</h1>
          <p style={styles.subtitle}>Phase 2: Authentication & Protected Routes</p>
        </div>

        <div style={styles.profileSection}>
          <h3 style={styles.sectionTitle}>User Profile</h3>
          <div style={styles.grid}>
            <div style={styles.infoRow}>
              <span style={styles.label}>Name:</span>
              <span style={styles.value}>{user?.name}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Email:</span>
              <span style={styles.value}>{user?.email}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Role:</span>
              <span
                style={{
                  ...styles.roleBadge,
                  backgroundColor: getRoleBadgeColor(user?.role),
                }}
              >
                {user?.role}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>User ID:</span>
              <span style={styles.valueMono}>{user?.id || user?._id}</span>
            </div>
          </div>
        </div>

        <div style={styles.testSection}>
          <h3 style={styles.sectionTitle}>Test Protected Route</h3>
          <p style={styles.testDesc}>
            Verify that the Axios interceptor sends your Bearer JWT token to <code>GET /api/auth/me</code>:
          </p>
          <button
            onClick={testProtectedEndpoint}
            disabled={testingEndpoint}
            style={styles.testBtn}
          >
            {testingEndpoint ? 'Testing...' : 'Test GET /api/auth/me'}
          </button>

          {apiResponse && (
            <div
              style={{
                ...styles.responseBox,
                borderColor: apiResponse.success ? '#10b981' : '#ef4444',
              }}
            >
              <span
                style={{
                  ...styles.statusTag,
                  backgroundColor: apiResponse.success ? '#10b981' : '#ef4444',
                }}
              >
                {apiResponse.success ? '200 OK — Token Verified' : 'Error'}
              </span>
              <pre style={styles.codeBlock}>
                {JSON.stringify(apiResponse.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    padding: '24px',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '36px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
    border: '1px solid #334155',
  },
  header: {
    marginBottom: '24px',
    borderBottom: '1px solid #334155',
    paddingBottom: '20px',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  logoBadge: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '12px',
    letterSpacing: '1px',
    padding: '4px 10px',
    borderRadius: '9999px',
    textTransform: 'uppercase',
  },
  logoutBtn: {
    backgroundColor: '#334155',
    color: '#f8fafc',
    border: '1px solid #475569',
    borderRadius: '8px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0,
  },
  profileSection: {
    backgroundColor: '#0f172a',
    borderRadius: '10px',
    padding: '18px 20px',
    border: '1px solid #334155',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#94a3b8',
    margin: '0 0 14px 0',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
  },
  label: {
    color: '#94a3b8',
  },
  value: {
    color: '#f8fafc',
    fontWeight: '500',
  },
  valueMono: {
    color: '#94a3b8',
    fontFamily: 'monospace',
    fontSize: '12px',
  },
  roleBadge: {
    padding: '2px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  testSection: {
    backgroundColor: '#0f172a',
    borderRadius: '10px',
    padding: '18px 20px',
    border: '1px solid #334155',
  },
  testDesc: {
    fontSize: '13px',
    color: '#cbd5e1',
    marginTop: 0,
    marginBottom: '14px',
  },
  testBtn: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '14px',
  },
  responseBox: {
    backgroundColor: '#1e293b',
    border: '1px solid',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '10px',
  },
  statusTag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px',
  },
  codeBlock: {
    margin: 0,
    fontSize: '12px',
    color: '#a5f3fc',
    fontFamily: 'monospace',
    overflowX: 'auto',
  },
};

export default DashboardPlaceholder;
