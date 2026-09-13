import React from 'react';
import { Database, ShieldCheck, AlertCircle, FileText } from 'lucide-react';
import { StructuredInvestigationResult } from '../../types';

interface EvidencePanelProps {
  investigation?: StructuredInvestigationResult;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ investigation }) => {
  if (!investigation) {
    return (
      <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
          <Database size={16} />
          <span>Ground-truth evidence will display after investigation.</span>
        </div>
      </div>
    );
  }

  const evidence = investigation.evidence || [];
  const signals = investigation.eligibilitySignals || [];

  return (
    <div className="glass-card glow-cyan" style={{ padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Database size={18} color="#06b6d4" />
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc' }}>Ground-Truth Evidence Panel</h3>
      </div>

      <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
        Read-only evidence aggregated across customer history, orders, inventory, and policy checks.
      </p>

      {/* Observed Evidence Facts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
        {evidence.map((item, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ color: '#06b6d4', fontWeight: '600' }}>{item.toolUsed}</span>
              <span className="font-mono" style={{ color: '#64748b', fontSize: '10px' }}>{item.entity}</span>
            </div>
            <p style={{ color: '#cbd5e1' }}>{item.fact}</p>
          </div>
        ))}
      </div>

      {/* Policy & Eligibility Signals */}
      {signals.length > 0 && (
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
            Policy Signals & Eligibility
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {signals.map((sig, idx) => {
              const isEligible = sig.status === 'ELIGIBLE';
              const isApproval = sig.status === 'REQUIRES_APPROVAL';
              const color = isEligible ? '#10b981' : isApproval ? '#f59e0b' : '#f43f5e';

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: `${color}15`,
                    border: `1px solid ${color}33`,
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                >
                  <span style={{ fontWeight: '600', color }}>{sig.signal}</span>
                  <span style={{ fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '4px', background: `${color}22`, color }}>
                    {sig.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
