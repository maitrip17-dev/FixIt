import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  getComplaintsPool,
  getComplaints,
  claimComplaint,
  updateComplaintStatus,
} from '../../api/complaints.js';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pool'); // 'pool' | 'active' | 'completed'
  const [poolComplaints, setPoolComplaints] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('Same City');

  const cityOptions = user?.city
    ? ['Same City', ...['New York', 'Chicago', 'Houston', 'Los Angeles', 'San Francisco', 'Other'].filter((city) => city !== user.city)]
    : ['Same City', 'New York', 'Chicago', 'Houston', 'Los Angeles', 'San Francisco', 'Other'];

  const matchesWorkerCity = (item) => {
    if (!user?.city || !item?.location) return false;
    return item.location.toLowerCase().includes(user.city.toLowerCase());
  };

  const fetchPool = async () => {
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      const data = await getComplaintsPool(params);
      setPoolComplaints(data.complaints || []);
    } catch (err) {
      console.error('Error fetching pool:', err);
      setError('Unable to load available requests pool.');
    }
  };

  const fetchMyComplaints = async () => {
    try {
      const data = await getComplaints();
      setMyComplaints(data.complaints || []);
    } catch (err) {
      console.error('Error fetching my complaints:', err);
      setError('Unable to load your assigned complaints.');
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    await Promise.all([fetchPool(), fetchMyComplaints()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const handleClaim = async (id, ticketId) => {
    setProcessingId(id);
    setError('');
    setActionSuccess('');
    try {
      await claimComplaint(id);
      setActionSuccess(`Successfully claimed ticket ${ticketId}! It is now In Progress.`);
      await loadData();
      setActiveTab('active');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to claim ticket. It may have already been taken.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolve = async (id, ticketId) => {
    setProcessingId(id);
    setError('');
    setActionSuccess('');
    try {
      await updateComplaintStatus(id, 'Resolved');
      setActionSuccess(`Ticket ${ticketId} marked as Resolved!`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setProcessingId(null);
    }
  };

  const activeJobs = myComplaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned');
  const completedJobs = myComplaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Closed'
  );

  const visiblePoolComplaints = [...poolComplaints]
    .filter((item) => {
      if (cityFilter === 'Same City') {
        return matchesWorkerCity(item) || !user?.city;
      }

      if (!cityFilter || cityFilter === 'All Cities') {
        return true;
      }

      return item.location?.toLowerCase().includes(cityFilter.toLowerCase());
    })
    .sort((a, b) => {
      const aSameCity = matchesWorkerCity(a) ? 0 : 1;
      const bSameCity = matchesWorkerCity(b) ? 0 : 1;
      return aSameCity - bSameCity;
    });

  const categories = ['Electrical', 'Plumbing', 'Cleaning', 'Internet', 'Furniture', 'Other'];

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Critical':
        return { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' };
      case 'High':
        return { backgroundColor: '#ffedd5', color: '#9a3412', border: '1px solid #fb923c' };
      case 'Medium':
        return { backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #facc15' };
      case 'Low':
        return { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #4ade80' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#334155' };
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.header}>
        <div>
          <div style={styles.titleRow}>
            <h1 style={styles.title}>Technician Dispatch Hub</h1>
            <span style={styles.skillPill}>
              Trade: <strong>{user?.skillCategory || 'General Maintenance'}</strong>
            </span>
          </div>
          <p style={styles.subtitle}>
            Browse incoming service requests, claim work orders matching your trade, and manage
            active tickets.
          </p>
        </div>
        <button onClick={loadData} style={styles.refreshBtn} title="Refresh Dashboard">
          🔄 Refresh
        </button>
      </div>

      {/* Action Alerts */}
      {actionSuccess && <div style={styles.successAlert}>✅ {actionSuccess}</div>}
      {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button
          onClick={() => setActiveTab('pool')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'pool' ? styles.activeTabBtn : {}),
          }}
        >
          📥 Open Work Orders (Pool)
          <span style={styles.tabBadge}>{visiblePoolComplaints.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'active' ? styles.activeTabBtn : {}),
          }}
        >
          ⚡ My Active Jobs (In Progress)
          <span style={styles.tabBadge}>{activeJobs.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'completed' ? styles.activeTabBtn : {}),
          }}
        >
          ✅ Completed History
          <span style={styles.tabBadge}>{completedJobs.length}</span>
        </button>
      </div>

      {/* TAB 1: AVAILABLE POOL */}
      {activeTab === 'pool' && (
        <div>
          {/* Category Filter Bar */}
          <div style={styles.filterBar}>
            <span style={styles.filterTitle}>Filter City:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={styles.citySelect}
            >
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city === 'Same City' ? `Same City (${user?.city || 'Your City'})` : city}
                </option>
              ))}
            </select>

            <span style={styles.filterTitle}>Filter Category:</span>
            <div style={styles.filterChips}>
              <button
                onClick={() => setCategoryFilter('')}
                style={{
                  ...styles.chip,
                  ...(categoryFilter === '' ? styles.activeChip : {}),
                }}
              >
                All Trades ({visiblePoolComplaints.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    ...styles.chip,
                    ...(categoryFilter === cat ? styles.activeChip : {}),
                    ...(user?.skillCategory === cat ? styles.matchedSkillChip : {}),
                  }}
                >
                  {cat} {user?.skillCategory === cat ? '★' : ''}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingBox}>Scanning for available tickets...</div>
          ) : visiblePoolComplaints.length === 0 ? (
            <div style={styles.emptyCard}>
              <span style={styles.emptyIcon}>🎉</span>
              <h3 style={styles.emptyTitle}>Pool is all clear!</h3>
              <p style={styles.emptyDesc}>
                There are currently no open unassigned complaints in this category. New submissions
                will appear here immediately.
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {visiblePoolComplaints.map((item) => {
                const isSkillMatch = user?.skillCategory && item.category === user.skillCategory;
                const sameCityMatch = matchesWorkerCity(item);
                return (
                  <div
                    key={item._id}
                    style={{
                      ...styles.card,
                      ...(isSkillMatch ? styles.skillMatchedCard : {}),
                      ...(sameCityMatch ? styles.sameCityCard : {}),
                    }}
                  >
                    <div style={styles.cardHeader}>
                      <span style={styles.ticketId}>{item.ticketId}</span>
                      <div style={styles.pillGroup}>
                        {sameCityMatch && (
                          <span style={styles.matchPill}>📍 Same City</span>
                        )}
                        {isSkillMatch && (
                          <span style={styles.matchPill}>★ Matches Your Trade</span>
                        )}
                        <span style={{ ...styles.priorityPill, ...getPriorityStyle(item.priority) }}>
                          {item.priority}
                        </span>
                      </div>
                    </div>

                    <h3 style={styles.cardTitle}>{item.title}</h3>
                    <p style={styles.cardDesc}>{item.description}</p>

                    <div style={styles.cardMeta}>
                      <div>📍 <strong>Location:</strong> {item.location}</div>
                      <div>🏷️ <strong>Category:</strong> {item.category}</div>
                      <div>👤 <strong>Requester:</strong> {item.createdBy?.name || 'User'}</div>
                    </div>

                    <div style={styles.cardFooter}>
                      <Link to={`/complaints/${item._id}`} style={styles.detailsLink}>
                        Inspect Details →
                      </Link>

                      <button
                        onClick={() => handleClaim(item._id, item.ticketId)}
                        disabled={processingId === item._id}
                        style={styles.claimBtn}
                      >
                        {processingId === item._id ? 'Claiming...' : 'Claim & Start Job'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY ACTIVE JOBS */}
      {activeTab === 'active' && (
        <div>
          {loading ? (
            <div style={styles.loadingBox}>Loading your active assignments...</div>
          ) : activeJobs.length === 0 ? (
            <div style={styles.emptyCard}>
              <span style={styles.emptyIcon}>🛠️</span>
              <h3 style={styles.emptyTitle}>No active jobs</h3>
              <p style={styles.emptyDesc}>
                You don't have any jobs currently in progress. Switch to the <strong>Available Requests Pool</strong> tab to claim a task.
              </p>
              <button onClick={() => setActiveTab('pool')} style={styles.primaryActionBtn}>
                Browse Open Requests
              </button>
            </div>
          ) : (
            <div style={styles.grid}>
              {activeJobs.map((item) => (
                <div key={item._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.ticketId}>{item.ticketId}</span>
                    <span style={styles.inProgressBadge}>⚡ In Progress</span>
                  </div>

                  <h3 style={styles.cardTitle}>{item.title}</h3>
                  <p style={styles.cardDesc}>{item.description}</p>

                  <div style={styles.cardMeta}>
                    <div>📍 <strong>Location:</strong> {item.location}</div>
                    <div>🏷️ <strong>Category:</strong> {item.category}</div>
                    <div>
                      🕒 <strong>Started:</strong>{' '}
                      {new Date(item.updatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <Link to={`/complaints/${item._id}`} style={styles.detailsLink}>
                      View Audit Trail →
                    </Link>

                    <button
                      onClick={() => handleResolve(item._id, item.ticketId)}
                      disabled={processingId === item._id}
                      style={styles.resolveBtn}
                    >
                      {processingId === item._id ? 'Updating...' : '✅ Mark as Resolved'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED HISTORY */}
      {activeTab === 'completed' && (
        <div>
          {completedJobs.length === 0 ? (
            <div style={styles.emptyCard}>
              <span style={styles.emptyIcon}>📜</span>
              <h3 style={styles.emptyTitle}>No completed jobs yet</h3>
              <p style={styles.emptyDesc}>
                Jobs you mark as resolved will be documented here in your performance history.
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {completedJobs.map((item) => (
                <div key={item._id} style={{ ...styles.card, opacity: 0.9 }}>
                  <div style={styles.cardHeader}>
                    <span style={styles.ticketId}>{item.ticketId}</span>
                    <span style={styles.resolvedBadge}>✔ {item.status}</span>
                  </div>

                  <h3 style={styles.cardTitle}>{item.title}</h3>
                  <p style={styles.cardDesc}>{item.description}</p>

                  <div style={styles.cardMeta}>
                    <div>📍 <strong>Location:</strong> {item.location}</div>
                    <div>🏷️ <strong>Category:</strong> {item.category}</div>
                  </div>

                  <div style={styles.cardFooter}>
                    <Link to={`/complaints/${item._id}`} style={styles.detailsLink}>
                      Review Record →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '6px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  skillPill: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1d4ed8',
    padding: '3px 10px',
    borderRadius: '16px',
    fontSize: '12px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  refreshBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
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
  tabBar: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '20px',
    overflowX: 'auto',
  },
  tabBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '12px 18px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    whiteSpace: 'nowrap',
  },
  activeTabBtn: {
    color: '#2563eb',
    borderBottom: '2px solid #2563eb',
  },
  tabBadge: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '700',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#475569',
  },
  filterChips: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '20px',
    padding: '5px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  activeChip: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderColor: '#2563eb',
  },
  matchedSkillChip: {
    border: '1px solid #3b82f6',
    fontWeight: '700',
  },
  citySelect: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '7px 12px',
    fontSize: '12px',
    color: '#334155',
    fontWeight: '600',
    minWidth: '170px',
    outline: 'none',
  },
  sameCityCard: {
    borderColor: '#34d399',
    boxShadow: '0 0 0 1px rgba(52,211,153,0.2)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  skillMatchedCard: {
    borderColor: '#60a5fa',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  ticketId: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#2563eb',
    fontFamily: 'monospace',
  },
  pillGroup: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  matchPill: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  priorityPill: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '9999px',
  },
  inProgressBadge: {
    backgroundColor: '#fff7ed',
    color: '#c2410c',
    border: '1px solid #fed7aa',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '9999px',
  },
  resolvedBadge: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '9999px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.4',
    margin: '0 0 14px 0',
    flex: '1',
  },
  cardMeta: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '12px',
    color: '#475569',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
  },
  detailsLink: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    textDecoration: 'none',
  },
  claimBtn: {
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  resolveBtn: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
    fontSize: '14px',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    border: '1px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '36px',
    display: 'block',
    marginBottom: '10px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 6px 0',
  },
  emptyDesc: {
    fontSize: '14px',
    color: '#64748b',
    maxWidth: '400px',
    margin: '0 auto 16px auto',
  },
  primaryActionBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};

export default WorkerDashboard;
