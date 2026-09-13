// ResolveX Phase 19 — Customer Notifications Panel
// Glassmorphism design consistent with existing dashboard UI

import React, { useEffect, useState, useCallback } from 'react';

interface NotificationItem {
  id: string;
  eventType: string;
  title: string;
  message: string;
  channel: string;
  status: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  agentRunId?: string;
  ticketId?: string;
  correlationId?: string;
}

interface NotificationsPanelProps {
  authToken?: string;
}

const eventTypeConfig: Record<string, { icon: string; color: string; label: string; actionRequired?: boolean }> = {
  CASE_CREATED:               { icon: '📋', color: '#38bdf8', label: 'Case Received' },
  INVESTIGATION_COMPLETED:    { icon: '🔍', color: '#a78bfa', label: 'Investigation Done' },
  APPROVAL_REQUIRED:          { icon: '⚠️', color: '#f59e0b', label: 'Approval Required', actionRequired: true },
  CUSTOMER_CONSENT_REQUIRED:  { icon: '✅', color: '#f59e0b', label: 'Confirmation Needed', actionRequired: true },
  RESOLUTION_COMPLETED:       { icon: '🎉', color: '#10b981', label: 'Resolved' },
  RESOLUTION_FAILED:          { icon: '❌', color: '#f43f5e', label: 'Resolution Failed' },
  CASE_ESCALATED:             { icon: '🔺', color: '#f97316', label: 'Escalated' },
  RECOVERY_STARTED:           { icon: '🔄', color: '#60a5fa', label: 'Retrying' },
  RECOVERY_COMPLETED:         { icon: '✨', color: '#10b981', label: 'Retry Resolved' },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationsPanel({ authToken = 'customer-a-token' }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter === 'UNREAD' ? '?unreadOnly=true' : '';
      const res = await fetch(`/api/v1/notifications${params}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authToken, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (notifId: string) => {
    setMarkingRead(notifId);
    try {
      const res = await fetch(`/api/v1/notifications/${notifId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Silently ignore
    } finally {
      setMarkingRead(null);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(51, 65, 85, 0.6)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
  };

  const notifCardStyle = (isRead: boolean): React.CSSProperties => ({
    background: isRead ? 'rgba(30, 41, 59, 0.4)' : 'rgba(56, 189, 248, 0.05)',
    border: `1px solid ${isRead ? 'rgba(51, 65, 85, 0.4)' : 'rgba(56, 189, 248, 0.2)'}`,
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '10px',
    transition: 'all 0.2s ease',
    cursor: 'default',
    position: 'relative',
  });

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>
            🔔
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Notifications
            </h2>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
              Your case updates and alerts
            </p>
          </div>
          {unreadCount > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
              color: 'white',
              borderRadius: '12px',
              padding: '2px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              minWidth: '24px',
              textAlign: 'center',
            }}>
              {unreadCount}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {(['ALL', 'UNREAD'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              id={`notif-filter-${f.toLowerCase()}`}
              style={{
                background: filter === f ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: filter === f ? '#38bdf8' : '#64748b',
                border: `1px solid ${filter === f ? 'rgba(56, 189, 248, 0.3)' : 'rgba(51, 65, 85, 0.5)'}`,
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {f === 'ALL' ? 'All' : `Unread (${unreadCount})`}
            </button>
          ))}
          <button
            onClick={fetchNotifications}
            id="notif-refresh-btn"
            style={{
              background: 'transparent',
              color: '#64748b',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
          >
            ↻
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '10px',
          padding: '12px 16px',
          color: '#f43f5e',
          fontSize: '0.8rem',
          marginBottom: '16px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#475569', fontSize: '0.85rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
          Loading notifications...
        </div>
      )}

      {/* Notifications list */}
      {!loading && notifications.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px 20px',
          color: '#475569',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px', opacity: 0.4 }}>🔔</div>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>No notifications yet</p>
          <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#475569' }}>
            {filter === 'UNREAD' ? 'All caught up! No unread notifications.' : 'You\'ll see updates about your cases here.'}
          </p>
        </div>
      )}

      {!loading && notifications.map((notif) => {
        const config = eventTypeConfig[notif.eventType] || { icon: '📌', color: '#64748b', label: notif.eventType };
        return (
          <div key={notif.id} style={notifCardStyle(notif.isRead)} id={`notification-card-${notif.id}`}>
            {/* Unread indicator */}
            {!notif.isRead && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#38bdf8',
                boxShadow: '0 0 6px rgba(56, 189, 248, 0.6)',
              }} />
            )}

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              {/* Event icon */}
              <div style={{
                width: '36px', height: '36px',
                background: `${config.color}18`,
                border: `1px solid ${config.color}30`,
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', flexShrink: 0,
              }}>
                {config.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: config.color,
                    background: `${config.color}12`,
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}>
                    {config.label}
                  </span>
                  {config.actionRequired && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#f59e0b',
                      background: 'rgba(245, 158, 11, 0.1)',
                      padding: '2px 7px',
                      borderRadius: '5px',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}>
                      ACTION REQUIRED
                    </span>
                  )}
                  <span style={{ fontSize: '0.72rem', color: '#475569', marginLeft: 'auto' }}>
                    {timeAgo(notif.createdAt)}
                  </span>
                </div>

                {/* Title */}
                <div style={{
                  fontSize: '0.88rem',
                  fontWeight: notif.isRead ? 500 : 700,
                  color: notif.isRead ? '#94a3b8' : '#f1f5f9',
                  marginBottom: '4px',
                }}>
                  {notif.title}
                </div>

                {/* Message */}
                <div style={{
                  fontSize: '0.78rem',
                  color: '#64748b',
                  lineHeight: 1.5,
                  marginBottom: notif.isRead ? 0 : '10px',
                }}>
                  {notif.message}
                </div>

                {/* Mark as read button */}
                {!notif.isRead && (
                  <button
                    id={`mark-read-${notif.id}`}
                    onClick={() => handleMarkRead(notif.id)}
                    disabled={markingRead === notif.id}
                    style={{
                      background: 'rgba(56, 189, 248, 0.1)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      padding: '5px 12px',
                      borderRadius: '7px',
                      fontSize: '0.73rem',
                      fontWeight: 600,
                      cursor: markingRead === notif.id ? 'not-allowed' : 'pointer',
                      opacity: markingRead === notif.id ? 0.6 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {markingRead === notif.id ? 'Marking...' : '✓ Mark as read'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Footer hint */}
      {notifications.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.72rem', color: '#334155' }}>
          Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
