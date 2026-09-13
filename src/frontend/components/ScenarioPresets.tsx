import React from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';

export interface ScenarioPreset {
  id: string;
  label: string;
  badge: string;
  badgeColor: string;
  ticketId?: string;
  orderId?: string;
  message: string;
  customerConsentGiven?: boolean;
}

export const PRESET_SCENARIOS: ScenarioPreset[] = [
  {
    id: 'phone-24999-approval',
    label: '₹24,999 Damaged Phone',
    badge: 'APPROVAL GATE',
    badgeColor: '#f59e0b',
    ticketId: 'tkt-damaged-phone-001',
    orderId: 'ord-phone-24999',
    message: 'My ₹24,999 phone arrived damaged. I want a refund.',
  },
  {
    id: 'earbuds-4999-auto',
    label: '₹4,999 Earbuds Refund',
    badge: 'AUTO RESOLVE',
    badgeColor: '#10b981',
    orderId: 'ord-refund-4999',
    message: 'I want a refund for my ₹4,999 earbuds order.',
  },
  {
    id: 'out-of-stock-consent',
    label: 'Out-of-Stock Replacement',
    badge: 'CONSENT GATE',
    badgeColor: '#06b6d4',
    orderId: 'ord-phone-24999',
    message: 'I want a replacement for my damaged phone.',
    customerConsentGiven: false,
  },
  {
    id: 'verification-failure',
    label: 'Verification Mismatch',
    badge: 'ESCALATION',
    badgeColor: '#f43f5e',
    orderId: 'ord-cancel-3500',
    message: 'Cancel my order.',
  },
];

interface ScenarioPresetsProps {
  onSelect: (scenario: ScenarioPreset) => void;
  activeScenarioId?: string;
}

export const ScenarioPresets: React.FC<ScenarioPresetsProps> = ({ onSelect, activeScenarioId }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Sparkles size={16} color="#06b6d4" />
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Canonical Demo Scenarios
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {PRESET_SCENARIOS.map((preset) => {
          const isSelected = activeScenarioId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelect(preset)}
              className="btn-preset"
              style={{
                borderColor: isSelected ? '#06b6d4' : undefined,
                background: isSelected ? 'rgba(6, 182, 212, 0.15)' : undefined,
              }}
            >
              <span>{preset.label}</span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: `${preset.badgeColor}22`,
                  color: preset.badgeColor,
                  border: `1px solid ${preset.badgeColor}44`,
                }}
              >
                {preset.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
