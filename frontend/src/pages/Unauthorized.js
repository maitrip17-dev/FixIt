import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>⚠️</div>
        <h1 style={styles.title}>403 - Access Denied</h1>
        <p style={styles.subtitle}>
          You do not have the required permissions or role to view this page.
        </p>
        <Link to="/dashboard" style={styles.button}>
          Return to Dashboard
        </Link>
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
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: '24px',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '440px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    border: '1px solid #334155',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ef4444',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
  },
};

export default Unauthorized;
