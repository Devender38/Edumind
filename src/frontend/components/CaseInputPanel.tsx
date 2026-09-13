import React from 'react';
import { Play, RotateCcw, UserCheck } from 'lucide-react';

interface CaseInputPanelProps {
  message: string;
  setMessage: (msg: string) => void;
  ticketId: string;
  setTicketId: (id: string) => void;
  orderId: string;
  setOrderId: (id: string) => void;
  customerConsentGiven: boolean;
  setCustomerConsentGiven: (given: boolean) => void;
  approvalToken: string;
  setApprovalToken: (token: string) => void;
  onRun: () => void;
  loading: boolean;
}

export const CaseInputPanel: React.FC<CaseInputPanelProps> = ({
  message,
  setMessage,
  ticketId,
  setTicketId,
  orderId,
  setOrderId,
  customerConsentGiven,
  setCustomerConsentGiven,
  approvalToken,
  setApprovalToken,
  onRun,
  loading,
}) => {
  return (
    <div className="glass-card glow-cyan" style={{ padding: '20px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Customer Request & Orchestration Controls</span>
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={customerConsentGiven}
              onChange={(e) => setCustomerConsentGiven(e.target.checked)}
              style={{ accentColor: '#06b6d4', cursor: 'pointer' }}
            />
            <UserCheck size={14} color={customerConsentGiven ? '#06b6d4' : '#64748b'} />
            <span>Customer Substitution Consent</span>
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 180px', gap: '12px', marginBottom: '14px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
            Customer Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type customer message (e.g. My ₹24,999 phone arrived damaged. I want a refund.)..."
            rows={2}
            style={{
              width: '100%',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: '#f8fafc',
              fontSize: '13px',
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
            Ticket ID (Optional)
          </label>
          <input
            type="text"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            placeholder="tkt-damaged-phone-001"
            style={{
              width: '100%',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: '#f8fafc',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
            Order ID (Optional)
          </label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="ord-phone-24999"
            style={{
              width: '100%',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: '#f8fafc',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            value={approvalToken}
            onChange={(e) => setApprovalToken(e.target.value)}
            placeholder="Manager Approval Token (Optional)"
            style={{
              width: '260px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#f8fafc',
              fontSize: '12px',
              outline: 'none',
            }}
          />
        </div>

        <button
          onClick={onRun}
          disabled={loading || !message.trim()}
          className="btn-primary"
        >
          {loading ? <RotateCcw size={16} className="spin" /> : <Play size={16} />}
          <span>{loading ? 'Executing Agent Loop...' : 'Run Agent Orchestrator'}</span>
        </button>
      </div>
    </div>
  );
};
