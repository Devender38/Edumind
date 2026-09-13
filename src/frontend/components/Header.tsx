import React from 'react';
import { ShieldCheck, Activity, Cpu } from 'lucide-react';
import { HealthCheckResponse } from '../../types';

interface HeaderProps {
  health: HealthCheckResponse | null;
  loading: boolean;
  error: string | null;
}

export const Header: React.FC<HeaderProps> = ({ health, loading, error }) => {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          padding: '12px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)'
        }}>
          <ShieldCheck size={28} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px', color: '#f8fafc' }}>
            ResolveX <span style={{ color: '#06b6d4', fontWeight: '400' }}>Autonomous Agent Engine</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>
            Closed-Loop Customer Resolution & Ground-Truth Verification Console
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="glass-card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color={loading ? '#f59e0b' : error ? '#f43f5e' : '#10b981'} />
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8' }}>
            Engine: <strong style={{ color: loading ? '#f59e0b' : error ? '#f43f5e' : '#10b981' }}>
              {loading ? 'CONNECTING...' : error ? 'OFFLINE' : 'ONLINE'}
            </strong>
          </span>
        </div>

        {health && (
          <div className="glass-card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#06b6d4' }}>
            <Cpu size={14} />
            <span className="font-mono">v{health.version}</span>
          </div>
        )}
      </div>
    </header>
  );
};
