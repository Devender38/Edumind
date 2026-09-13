import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldAlert, RefreshCw, XCircle, Bot } from 'lucide-react';
import { OrchestrationStatus } from '../../types';

interface AgentStatusBannerProps {
  status: OrchestrationStatus | null;
  reason?: string;
  loopCount?: number;
  replanCount?: number;
  agentRunId?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onGrantConsent?: () => void;
  onDenyConsent?: () => void;
  actionLoading?: boolean;
}

export const AgentStatusBanner: React.FC<AgentStatusBannerProps> = ({
  status,
  reason,
  loopCount = 1,
  replanCount = 0,
  agentRunId,
  onApprove,
  onReject,
  onGrantConsent,
  onDenyConsent,
  actionLoading = false,
}) => {
  if (!status) {
    return (
      <div className="glass-card" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
        <Bot size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
        <p style={{ fontSize: '14px' }}>Ready to run. Select a scenario above or enter a customer message.</p>
      </div>
    );
  }

  const getConfig = () => {
    switch (status) {
      case 'RESOLVED':
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          icon: <CheckCircle2 size={24} color="#10b981" />,
          title: 'CASE RESOLVED & GROUND-TRUTH VERIFIED',
          subtitle: 'The agent successfully completed the business action and verified postconditions against the database.',
          nextStep: 'No further action required.',
          glowClass: 'glow-emerald',
        };
      case 'WAITING_FOR_APPROVAL':
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
          icon: <Clock size={24} color="#f59e0b" />,
          title: 'AGENT PAUSED SAFELY — WAITING FOR APPROVAL',
          subtitle: 'Requested resolution exceeds autonomous approval limit (₹10,000 auto-refund threshold). Zero business mutations executed.',
          nextStep: 'Human manager approval token required to execute this high-value action.',
          glowClass: 'glow-amber',
        };
      case 'WAITING_FOR_CUSTOMER_CONSENT':
        return {
          bg: 'rgba(6, 182, 212, 0.12)',
          border: 'rgba(6, 182, 212, 0.3)',
          color: '#06b6d4',
          icon: <AlertTriangle size={24} color="#06b6d4" />,
          title: 'AGENT PAUSED SAFELY — WAITING FOR CUSTOMER CONSENT',
          subtitle: 'Primary requested SKU is out of stock. An alternative SKU replacement is available, but customer consent is required for substitution.',
          nextStep: 'Customer substitution consent required prior to execution.',
          glowClass: 'glow-cyan',
        };
      case 'ESCALATED':
        return {
          bg: 'rgba(244, 63, 94, 0.12)',
          border: 'rgba(244, 63, 94, 0.3)',
          color: '#f43f5e',
          icon: <ShieldAlert size={24} color="#f43f5e" />,
          title: 'CASE ESCALATED TO HUMAN AGENT',
          subtitle: 'Case constraints or maximum autonomous replan limits were reached without a safe autonomous resolution.',
          nextStep: 'High-priority ticket assigned to human customer support specialist.',
          glowClass: 'glow-rose',
        };
      case 'FAILED':
        return {
          bg: 'rgba(244, 63, 94, 0.12)',
          border: 'rgba(244, 63, 94, 0.3)',
          color: '#f43f5e',
          icon: <XCircle size={24} color="#f43f5e" />,
          title: 'AGENT ORCHESTRATION FAILED',
          subtitle: 'Unrecoverable execution error occurred during orchestration loop.',
          nextStep: 'Inspect system logs or escalate case.',
          glowClass: 'glow-rose',
        };
      default:
        return {
          bg: 'rgba(139, 92, 246, 0.12)',
          border: 'rgba(139, 92, 246, 0.3)',
          color: '#8b5cf6',
          icon: <RefreshCw size={24} color="#8b5cf6" className="spin" />,
          title: 'AGENT ADAPTING & REPLANNING',
          subtitle: 'Detecting changed conditions and evaluating safe alternative policies.',
          nextStep: 'Running fresh investigation...',
          glowClass: 'glow-purple',
        };
    }
  };

  const config = getConfig();

  return (
    <div
      className={`glass-card ${config.glowClass}`}
      style={{
        padding: '20px',
        backgroundColor: config.bg,
        borderColor: config.border,
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{ marginTop: '2px' }}>{config.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: config.color, letterSpacing: '0.3px' }}>
              {config.title}
            </h3>

            <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
              <span className="font-mono" style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', color: '#94a3b8' }}>
                Loop: {loopCount}
              </span>
              <span className="font-mono" style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', color: '#94a3b8' }}>
                Replan: {replanCount}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#f8fafc', marginBottom: '8px', lineHeight: '1.4' }}>
            {reason || config.subtitle}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: config.color, fontWeight: '500', marginBottom: status === 'WAITING_FOR_APPROVAL' || status === 'WAITING_FOR_CUSTOMER_CONSENT' ? '14px' : '0' }}>
            <span style={{ color: '#94a3b8' }}>Next Step:</span>
            <span>{config.nextStep}</span>
          </div>

          {/* Phase 12 Interactive Human-in-the-Loop Resumable Controls */}
          {status === 'WAITING_FOR_APPROVAL' && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={onApprove}
                disabled={actionLoading || !agentRunId}
                style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                ✓ Approve & Resume Execution
              </button>
              <button
                onClick={onReject}
                disabled={actionLoading || !agentRunId}
                style={{
                  backgroundColor: 'rgba(244, 63, 94, 0.2)',
                  color: '#f43f5e',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                }}
              >
                ✗ Reject Approval
              </button>
            </div>
          )}

          {status === 'WAITING_FOR_CUSTOMER_CONSENT' && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={onGrantConsent}
                disabled={actionLoading || !agentRunId}
                style={{
                  backgroundColor: '#06b6d4',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                ✓ Grant Substitution Consent
              </button>
              <button
                onClick={onDenyConsent}
                disabled={actionLoading || !agentRunId}
                style={{
                  backgroundColor: 'rgba(244, 63, 94, 0.2)',
                  color: '#f43f5e',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                }}
              >
                ✗ Deny Consent
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
