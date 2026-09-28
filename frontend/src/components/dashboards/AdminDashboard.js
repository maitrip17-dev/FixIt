import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getComplaints, resetComplaint } from '../../api/complaints.js';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [resettingId, setResettingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const data = await getComplaints(params);
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Error loading complaints for admin:', err);
      setError('Unable to retrieve maintenance complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [statusFilter, categoryFilter]);

  const handleResetToPool = async (id, ticketId) => {
    if (!window.confirm(`Are you sure you want to release ticket ${ticketId} and return it to the open pool?`)) {
      return;
    }

    setResettingId(id);
    setError('');
    setActionSuccess('');
    try {
      await resetComplaint(id);
      setActionSuccess(`Ticket ${ticketId} was successfully returned to the open requests pool.`);
      await loadComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset ticket.');
    } finally {
      setResettingId(null);
    }
  };

  // Metrics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;

  const categories = ['Electrical', 'Plumbing', 'Cleaning', 'Internet', 'Furniture', 'Other'];
  const statuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Pending':
        return { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' };
      case 'Assigned':
      case 'In Progress':
        return { backgroundColor: '#ffedd5', color: '#9a3412', border: '1px solid #fdba74' };
      case 'Resolved':
        return { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
      case 'Closed':
        return { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
      default:
        return { backgroundColor: '#f8fafc', color: '#334155' };
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>System Operations & Supervision</h1>
          <p style={styles.subtitle}>
            Monitor decentralized worker claims, ticket resolution velocity, and moderate stalled jobs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link to="/analytics" style={styles.analyticsBtn}>
            🧠 Maintenance Intelligence
          </Link>
          <Link to="/complaints/new" style={styles.newBtn}>
            + File Admin Ticket
          </Link>
        </div>
      </div>

      {actionSuccess && <div style={styles.successAlert}>✅ {actionSuccess}</div>}
      {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

      {/* KPI Metrics Strip */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Total Tickets</span>
          <span style={styles.metricValue}>{totalCount}</span>
          <span style={styles.metricDesc}>All-time submissions</span>
        </div>

        <div style={{ ...styles.metricCard, borderLeft: '4px solid #f59e0b' }}>
          <span style={styles.metricLabel}>Open in Pool</span>
          <span style={{ ...styles.metricValue, color: '#d97706' }}>{pendingCount}</span>
          <span style={styles.metricDesc}>Awaiting technician claim</span>
        </div>

        <div style={{ ...styles.metricCard, borderLeft: '4px solid #f97316' }}>
          <span style={styles.metricLabel}>In Progress</span>
          <span style={{ ...styles.metricValue, color: '#ea580c' }}>{inProgressCount}</span>
          <span style={styles.metricDesc}>Currently being serviced</span>
        </div>

        <div style={{ ...styles.metricCard, borderLeft: '4px solid #10b981' }}>
          <span style={styles.metricLabel}>Resolved / Closed</span>
          <span style={{ ...styles.metricValue, color: '#059669' }}>{resolvedCount}</span>
          <span style={styles.metricDesc}>Successfully completed</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={styles.select}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Supervision Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Complaint Supervision Roster</h2>
          <span style={styles.tableSubtitle}>Showing {complaints.length} tickets</span>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>Loading supervisory data...</div>
        ) : complaints.length === 0 ? (
          <div style={styles.emptyBox}>No complaints match the selected filter criteria.</div>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={styles.th}>Ticket ID</th>
                  <th style={styles.th}>Title & Category</th>
                  <th style={styles.th}>Requester</th>
                  <th style={styles.th}>Technician</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Submitted</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((item) => {
                  const isClaimedOrActive = item.status === 'In Progress' || item.status === 'Assigned';
                  return (
                    <tr key={item._id} style={styles.tr}>
                      <td style={styles.td}>
                        <Link to={`/complaints/${item._id}`} style={styles.ticketLink}>
                          {item.ticketId}
                        </Link>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.complaintTitle}>{item.title}</div>
                        <div style={styles.complaintSub}>
                          {item.category} • 📍 {item.location}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.requesterName}>{item.createdBy?.name || 'User'}</div>
                        <div style={styles.requesterEmail}>{item.createdBy?.email}</div>
                      </td>
                      <td style={styles.td}>
                        {item.assignedTo ? (
                          <div style={styles.workerBadge}>
                            🛠️ {item.assignedTo.name}
                          </div>
                        ) : (
                          <span style={styles.unassignedBadge}>Unassigned Pool</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusBadge, ...getStatusBadgeStyle(item.status) }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionRow}>
                          <Link to={`/complaints/${item._id}`} style={styles.viewBtn}>
                            Inspect
                          </Link>

                          {isClaimedOrActive && (
                            <button
                              onClick={() => handleResetToPool(item._id, item.ticketId)}
                              disabled={resettingId === item._id}
                              style={styles.resetBtn}
                              title="Return stalled ticket back to pool"
                            >
                              {resettingId === item._id ? 'Releasing...' : 'Return to Pool'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  newBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '9px 16px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
  },
  analyticsBtn: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '9px 16px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  successAlert: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #86efac',
    borderRadius: '8px',
    padding: '10px 16px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '600',
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    padding: '10px 16px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '600',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  metricCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  metricLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1',
    marginBottom: '6px',
  },
  metricDesc: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  filterBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '18px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
  },
  select: {
    padding: '7px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    color: '#1e293b',
    outline: 'none',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  tableTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  tableSubtitle: {
    fontSize: '13px',
    color: '#64748b',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  trHead: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s',
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  ticketLink: {
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#2563eb',
    textDecoration: 'none',
  },
  complaintTitle: {
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '2px',
  },
  complaintSub: {
    fontSize: '12px',
    color: '#64748b',
  },
  requesterName: {
    fontWeight: '600',
    color: '#1e293b',
  },
  requesterEmail: {
    fontSize: '11px',
    color: '#64748b',
  },
  workerBadge: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  unassignedBadge: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-block',
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  viewBtn: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '12px',
    padding: '4px 8px',
  },
  resetBtn: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loadingBox: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
  },
  emptyBox: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
  },
};

export default AdminDashboard;
