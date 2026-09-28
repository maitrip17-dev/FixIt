import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  getComplaintById,
  assignComplaint,
  updateComplaintStatus,
  claimComplaint,
  resetComplaint,
  getWorkers,
} from '../api/complaints.js';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Worker Claim State
  const [claiming, setClaiming] = useState(false);

  // Admin Reset State
  const [resetting, setResetting] = useState(false);

  // Admin Assignment State
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Status Update State
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchComplaintDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getComplaintById(id);
      setComplaint(data.complaint);
      if (data.complaint?.assignedTo?._id) {
        setSelectedWorker(data.complaint.assignedTo._id);
      }
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setError(
        err.response?.data?.message || 'Failed to load ticket details. Please verify your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkersList = async () => {
    if (user?.role === 'admin') {
      try {
        const data = await getWorkers();
        setWorkers(data.workers || []);
      } catch (err) {
        console.error('Error loading workers:', err);
      }
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
    fetchWorkersList();
  }, [id]);

  const handleAssignWorker = async (e) => {
    e.preventDefault();
    if (!selectedWorker) return;

    setAssigning(true);
    setError('');
    setActionSuccess('');
    try {
      const res = await assignComplaint(id, selectedWorker);
      setComplaint(res.complaint);
      setActionSuccess('Worker successfully assigned to this ticket!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign worker.');
    } finally {
      setAssigning(false);
    }
  };

  const handleClaimTicket = async () => {
    setClaiming(true);
    setError('');
    setActionSuccess('');
    try {
      const res = await claimComplaint(id);
      setComplaint(res.complaint);
      setActionSuccess('You have successfully accepted and claimed this ticket! Work is now In Progress.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim this ticket.');
    } finally {
      setClaiming(false);
    }
  };

  const handleResetToPool = async () => {
    if (!window.confirm('Return this complaint to the open requests pool? The current technician assignment will be cleared.')) {
      return;
    }
    setResetting(true);
    setError('');
    setActionSuccess('');
    try {
      const res = await resetComplaint(id);
      setComplaint(res.complaint);
      setActionSuccess('Ticket released and returned to the open requests pool.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset ticket.');
    } finally {
      setResetting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    setError('');
    setActionSuccess('');
    try {
      const res = await updateComplaintStatus(id, newStatus);
      setComplaint(res.complaint);
      setActionSuccess(`Ticket status updated to "${newStatus}"!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Pending':
        return { backgroundColor: '#eab308', color: '#000000' };
      case 'Assigned':
        return { backgroundColor: '#3b82f6', color: '#ffffff' };
      case 'In Progress':
        return { backgroundColor: '#f97316', color: '#ffffff' };
      case 'Resolved':
        return { backgroundColor: '#10b981', color: '#ffffff' };
      case 'Closed':
        return { backgroundColor: '#64748b', color: '#ffffff' };
      default:
        return { backgroundColor: '#94a3b8', color: '#ffffff' };
    }
  };

  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'Critical':
        return { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #ef4444' };
      case 'High':
        return { backgroundColor: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', border: '1px solid #f97316' };
      case 'Medium':
        return { backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid #eab308' };
      case 'Low':
        return { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981' };
      default:
        return { backgroundColor: '#334155', color: '#cbd5e1' };
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading ticket details...</p>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h3>Unable to view ticket</h3>
          <p>{error}</p>
          <Link to="/complaints" style={styles.backButton}>
            ← Back to All Tickets
          </Link>
        </div>
      </div>
    );
  }

  const isAssignedWorker =
    user?.role === 'worker' &&
    complaint.assignedTo &&
    complaint.assignedTo._id?.toString() === user.id?.toString();

  const canUpdateStatus = user?.role === 'admin' || isAssignedWorker;

  return (
    <div style={styles.container}>
      {/* Navigation Top */}
      <div style={styles.topNav}>
        <Link to="/complaints" style={styles.backLink}>
          ← Back to All Tickets
        </Link>
        <span style={styles.ticketIdBadge}>{complaint.ticketId}</span>
      </div>

      {actionSuccess && <div style={styles.successBox}>{actionSuccess}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.layoutGrid}>
        {/* Left Column: Complaint Details & Description */}
        <div style={styles.mainCol}>
          <div style={styles.card}>
            <div style={styles.ticketHeader}>
              <div style={styles.badgeRow}>
                <span style={{ ...styles.badge, ...getPriorityBadgeStyle(complaint.priority) }}>
                  {complaint.priority} Priority
                </span>
                <span style={{ ...styles.badge, ...getStatusBadgeStyle(complaint.status) }}>
                  {complaint.status}
                </span>
                <span style={styles.categoryBadge}>{complaint.category}</span>
              </div>
              <h1 style={styles.title}>{complaint.title}</h1>
              <span style={styles.dateLabel}>
                Submitted on{' '}
                {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>Description</h3>
              <p style={styles.descriptionText}>{complaint.description}</p>
            </div>

            <div style={styles.metaRow}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>📍 Location:</span>
                <span style={styles.metaVal}>{complaint.location}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>👤 Filed By:</span>
                <span style={styles.metaVal}>
                  {complaint.createdBy?.name} ({complaint.createdBy?.email})
                </span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>🛠️ Assigned Worker:</span>
                <span style={styles.metaVal}>
                  {complaint.assignedTo ? (
                    <span style={styles.assignedWorkerBlock}>
                      <strong>{complaint.assignedTo.name}</strong> ({complaint.assignedTo.email})
                      {complaint.assignedTo.skillCategory && (
                        <span style={styles.workerSkillPill}>
                          Trade: {complaint.assignedTo.skillCategory}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span style={styles.unassigned}>Unassigned (Open in Pool)</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Status History Timeline */}
          <div style={styles.card}>
            <h3 style={styles.timelineHeading}>📋 Ticket Lifecycle Audit Trail</h3>
            <div style={styles.timeline}>
              {complaint.statusHistory?.map((step, idx) => (
                <div key={idx} style={styles.timelineItem}>
                  <div style={styles.timelineDot}></div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineHeader}>
                      <span
                        style={{
                          ...styles.timelineStatus,
                          ...getStatusBadgeStyle(step.status),
                        }}
                      >
                        {step.status}
                      </span>
                      <span style={styles.timelineDate}>
                        {new Date(step.changedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <span style={styles.timelineActor}>
                      Changed by: <strong>{step.changedBy?.name || 'System / User'}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Role Actions Panel */}
        <div style={styles.sideCol}>
          {/* Worker Action: Claim Open Ticket */}
          {user?.role === 'worker' && complaint.status === 'Pending' && !complaint.assignedTo && (
            <div style={styles.claimCard}>
              <h3 style={styles.claimHeading}>⚡ Available Work Order</h3>
              <p style={styles.claimDesc}>
                This ticket is currently unassigned in the requests pool. Accept it now to begin
                maintenance work immediately.
              </p>
              <button
                type="button"
                onClick={handleClaimTicket}
                disabled={claiming}
                style={styles.claimActionBtn}
              >
                {claiming ? 'Accepting Ticket...' : '⚡ Accept & Start Work'}
              </button>
            </div>
          )}

          {/* Worker Action: Ticket assigned to someone else */}
          {user?.role === 'worker' && complaint.assignedTo && !isAssignedWorker && (
            <div style={styles.infoCard}>
              <h4 style={styles.infoTitle}>Assigned Technician</h4>
              <p style={styles.infoText}>
                This ticket is assigned to <strong>{complaint.assignedTo.name}</strong>.
              </p>
            </div>
          )}

          {/* Admin Supervision Control */}
          {user?.role === 'admin' && (
            <div style={styles.actionCard}>
              <h3 style={styles.actionHeading}>Admin Supervision & Moderation</h3>
              <p style={styles.actionDesc}>
                FixIt uses a decentralized self-claiming model. Available technicians claim tickets
                directly from the Open Work Orders Pool.
              </p>

              {/* Emergency Return to Pool */}
              {(complaint.status === 'In Progress' || complaint.status === 'Assigned') && (
                <div style={styles.resetContainer}>
                  <button
                    type="button"
                    onClick={handleResetToPool}
                    disabled={resetting}
                    style={styles.resetActionBtn}
                  >
                    {resetting ? 'Releasing...' : '🔄 Return Ticket to Pool (Reset)'}
                  </button>
                  <span style={styles.resetHint}>
                    Clears technician assignment and returns ticket to open pool for another worker to claim.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Worker / Admin Status Transition Controls */}
          {canUpdateStatus && (
            <div style={styles.actionCard}>
              <h3 style={styles.actionHeading}>Update Status</h3>
              <p style={styles.actionDesc}>
                Transition the complaint through its maintenance lifecycle:
              </p>
              <div style={styles.statusButtonGroup}>
                {user?.role === 'admin' && (
                  <button
                    type="button"
                    disabled={updatingStatus || complaint.status === 'In Progress'}
                    onClick={() => handleStatusChange('In Progress')}
                    style={{
                      ...styles.statusBtn,
                      backgroundColor: '#f97316',
                      opacity: complaint.status === 'In Progress' ? 0.5 : 1,
                    }}
                  >
                    Mark In Progress
                  </button>
                )}

                <button
                  type="button"
                  disabled={updatingStatus || complaint.status === 'Resolved'}
                  onClick={() => handleStatusChange('Resolved')}
                  style={{
                    ...styles.statusBtn,
                    backgroundColor: '#10b981',
                    opacity: complaint.status === 'Resolved' ? 0.5 : 1,
                  }}
                >
                  Mark Resolved
                </button>

                <button
                  type="button"
                  disabled={updatingStatus || complaint.status === 'Closed'}
                  onClick={() => handleStatusChange('Closed')}
                  style={{
                    ...styles.statusBtn,
                    backgroundColor: '#64748b',
                    opacity: complaint.status === 'Closed' ? 0.5 : 1,
                  }}
                >
                  Mark Closed
                </button>
              </div>
            </div>
          )}

          {/* User Information Note */}
          {user?.role === 'user' && (
            <div style={styles.infoCard}>
              <h4 style={styles.infoTitle}>Live Ticket Status</h4>
              <p style={styles.infoText}>
                {complaint.assignedTo ? (
                  <>
                    Technician <strong>{complaint.assignedTo.name}</strong> has claimed this job and
                    is working to resolve it.
                  </>
                ) : (
                  <>
                    Your request is in the open pool. Available technicians are reviewing incoming
                    tickets. You will receive an in-app alert when work begins.
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px 60px 20px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    color: '#f8fafc',
  },
  topNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  backLink: {
    color: '#60a5fa',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
  },
  ticketIdBadge: {
    backgroundColor: '#0f172a',
    color: '#60a5fa',
    border: '1px solid #3b82f6',
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: '14px',
    padding: '4px 12px',
    borderRadius: '8px',
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid #10b981',
    color: '#6ee7b7',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
  },
  backButton: {
    display: 'inline-block',
    marginTop: '12px',
    color: '#60a5fa',
    fontWeight: '600',
    textDecoration: 'none',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  mainCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sideCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
  },
  ticketHeader: {
    borderBottom: '1px solid #334155',
    paddingBottom: '20px',
    marginBottom: '20px',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: '12px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '9999px',
  },
  categoryBadge: {
    backgroundColor: '#334155',
    color: '#cbd5e1',
    fontSize: '12px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '9999px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 8px 0',
  },
  dateLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  section: {
    marginBottom: '24px',
  },
  sectionHeading: {
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#94a3b8',
    margin: '0 0 10px 0',
  },
  descriptionText: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#e2e8f0',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  metaRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#0f172a',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #334155',
  },
  metaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    gap: '10px',
    flexWrap: 'wrap',
  },
  metaLabel: {
    color: '#94a3b8',
    fontWeight: '500',
  },
  metaVal: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  unassigned: {
    color: '#f59e0b',
    fontStyle: 'italic',
  },
  timelineHeading: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 20px 0',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    position: 'relative',
    paddingLeft: '20px',
    borderLeft: '2px solid #334155',
  },
  timelineItem: {
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: '-26px',
    top: '4px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    border: '2px solid #1e293b',
  },
  timelineContent: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px 14px',
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
    gap: '10px',
    flexWrap: 'wrap',
  },
  timelineStatus: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  timelineDate: {
    fontSize: '12px',
    color: '#64748b',
  },
  timelineActor: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  actionCard: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '22px',
  },
  actionHeading: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 6px 0',
  },
  actionDesc: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: '0 0 16px 0',
    lineHeight: '1.4',
  },
  assignForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  select: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
  },
  assignBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  statusButtonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statusBtn: {
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '18px',
  },
  infoTitle: {
    fontSize: '14px',
    color: '#60a5fa',
    margin: '0 0 6px 0',
  },
  infoText: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.5',
    margin: 0,
  },
  assignedWorkerBlock: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  workerSkillPill: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
    border: '1px solid #bfdbfe',
  },
  claimCard: {
    backgroundColor: '#1e293b',
    border: '2px solid #3b82f6',
    borderRadius: '16px',
    padding: '22px',
    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)',
  },
  claimHeading: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#60a5fa',
    margin: '0 0 6px 0',
  },
  claimDesc: {
    fontSize: '13px',
    color: '#cbd5e1',
    margin: '0 0 16px 0',
    lineHeight: '1.4',
  },
  claimActionBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 18px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.15s',
  },
  resetContainer: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  resetActionBtn: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
  },
  resetHint: {
    fontSize: '11px',
    color: '#94a3b8',
    lineHeight: '1.3',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#94a3b8',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '4px solid #334155',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    margin: '0 auto 16px auto',
    animation: 'spin 1s linear infinite',
  },
};

export default ComplaintDetail;
