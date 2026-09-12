import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, Database, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { HealthCheckResponse } from '../types';

export default function App() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: HealthCheckResponse) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Health check failed:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Top Banner Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)'
          }}>
            <ShieldCheck size={28} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              ResolveX <span style={{ color: '#06b6d4', fontWeight: '400' }}>Agent Engine</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '2px' }}>
              Autonomous Customer Resolution & Verification System
            </p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={18} color={loading ? '#f59e0b' : error ? '#f43f5e' : '#10b981'} />
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8' }}>
            System Status: <strong style={{ color: loading ? '#f59e0b' : error ? '#f43f5e' : '#10b981' }}>
              {loading ? 'CHECKING...' : error ? 'OFFLINE' : 'ONLINE'}
            </strong>
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Backend API Health Status */}
        <div className="glass-card glow-cyan" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Cpu size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Backend Service Health</h3>
          </div>

          {loading ? (
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Connecting to backend service...</p>
          ) : error ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '14px' }}>Backend disconnected ({error})</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#94a3b8' }}>Service:</span>
                <span className="font-mono" style={{ color: '#f8fafc' }}>{health?.service}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#94a3b8' }}>Version:</span>
                <span className="font-mono" style={{ color: '#06b6d4' }}>v{health?.version}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#94a3b8' }}>Timestamp:</span>
                <span className="font-mono" style={{ color: '#94a3b8', fontSize: '12px' }}>{health?.timestamp}</span>
              </div>
            </div>
          )}
        </div>

        {/* Phase Checklist Status */}
        <div className="glass-card glow-purple" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Database size={20} color="#8b5cf6" />
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Phase 2 Skeleton Status</h3>
          </div>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>Project Directory Skeleton & TypeScript Setup</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>Express API Gateway Server Setup (`/api/v1/health`)</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>React Vite Frontend Dashboard & Proxy Setup</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
