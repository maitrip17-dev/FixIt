import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/notifications.js';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Silent polling every 30 seconds
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifs();
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Error marking notification read:', err);
      }
    }
    setIsOpen(false);
    const targetComplaintId = notif.complaintId?._id || notif.complaintId;
    if (targetComplaintId) {
      navigate(`/complaints/${targetComplaintId}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        style={styles.bellButton}
        title="Notifications"
        aria-label="View Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <div style={styles.headerLeft}>
              <span style={styles.headerTitle}>Notifications</span>
              {unreadCount > 0 && (
                <span style={styles.unreadTag}>{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                style={styles.markAllBtn}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={styles.notificationList}>
            {notifications.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>🔔</span>
                <p style={styles.emptyText}>No notifications yet</p>
                <span style={styles.emptySubtext}>
                  You will receive updates when complaints are claimed, resolved, or modified.
                </span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    ...styles.notificationItem,
                    ...(n.isRead ? styles.readItem : styles.unreadItem),
                  }}
                >
                  <div style={styles.itemHeader}>
                    {!n.isRead && <span style={styles.unreadDot} />}
                    <span style={styles.itemTime}>
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p style={styles.itemMessage}>{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  bellButton: {
    backgroundColor: '#334155',
    border: '1px solid #475569',
    borderRadius: '8px',
    padding: '7px 10px',
    color: '#e2e8f0',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s, border-color 0.2s',
  },
  badge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    borderRadius: '10px',
    minWidth: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    border: '2px solid #1e293b',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    width: '340px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
    overflow: 'hidden',
    animation: 'fadeIn 0.15s ease-out',
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #334155',
    backgroundColor: '#0f172a',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: '14px',
    fontWeight: '700',
  },
  unreadTag: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '6px',
  },
  markAllBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#38bdf8',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '2px 4px',
  },
  notificationList: {
    maxHeight: '380px',
    overflowY: 'auto',
  },
  notificationItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #334155',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  unreadItem: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  readItem: {
    backgroundColor: 'transparent',
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  unreadDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#38bdf8',
  },
  itemTime: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  itemMessage: {
    margin: 0,
    fontSize: '13px',
    lineHeight: '1.4',
    color: '#e2e8f0',
  },
  emptyState: {
    padding: '32px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  emptyText: {
    color: '#f1f5f9',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  emptySubtext: {
    color: '#64748b',
    fontSize: '12px',
    lineHeight: '1.4',
  },
};

export default NotificationBell;
