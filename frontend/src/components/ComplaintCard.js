import { Link } from 'react-router-dom';

const ComplaintCard = ({ complaint }) => {
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

  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link to={`/complaints/${complaint._id}`} style={styles.cardLink}>
      <div style={styles.card}>
        {/* Top Header Row */}
        <div style={styles.topRow}>
          <div style={styles.ticketBadge}>{complaint.ticketId}</div>
          <div style={styles.badgeGroup}>
            <span style={{ ...styles.badge, ...getPriorityBadgeStyle(complaint.priority) }}>
              {complaint.priority} Priority
            </span>
            <span style={{ ...styles.badge, ...getStatusBadgeStyle(complaint.status) }}>
              {complaint.status}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 style={styles.title}>{complaint.title}</h3>
        <p style={styles.description}>
          {complaint.description.length > 120
            ? `${complaint.description.substring(0, 120)}...`
            : complaint.description}
        </p>

        {/* Metadata Row */}
        <div style={styles.metaGrid}>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Category:</span>
            <span style={styles.metaValue}>{complaint.category}</span>
          </div>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Location:</span>
            <span style={styles.metaValue}>{complaint.location}</span>
          </div>
          {complaint.createdBy?.name && (
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Filed by:</span>
              <span style={styles.metaValue}>{complaint.createdBy.name}</span>
            </div>
          )}
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Assigned to:</span>
            <span style={styles.metaValue}>
              {complaint.assignedTo ? complaint.assignedTo.name : 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div style={styles.footer}>
          <span style={styles.dateText}>Created {formattedDate}</span>
          <span style={styles.viewLink}>View Details →</span>
        </div>
      </div>
    </Link>
  );
};

const styles = {
  cardLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '20px',
    transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  ticketBadge: {
    backgroundColor: '#0f172a',
    color: '#60a5fa',
    border: '1px solid #3b82f6',
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: '13px',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  badgeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  badge: {
    fontSize: '12px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '9999px',
    letterSpacing: '0.02em',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
    lineHeight: '1.4',
  },
  description: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0,
    lineHeight: '1.5',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '8px',
    backgroundColor: '#0f172a',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #334155',
  },
  metaItem: {
    display: 'flex',
    gap: '6px',
    fontSize: '13px',
  },
  metaLabel: {
    color: '#94a3b8',
  },
  metaValue: {
    color: '#f1f5f9',
    fontWeight: '500',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #334155',
    paddingTop: '10px',
    marginTop: '4px',
  },
  dateText: {
    fontSize: '12px',
    color: '#64748b',
  },
  viewLink: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#60a5fa',
  },
};

export default ComplaintCard;
