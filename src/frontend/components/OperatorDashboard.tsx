import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock, Filter, Layers, RefreshCw, ShieldCheck, UserCheck, Search, FileText } from 'lucide-react';
import { OperatorRunSummary, OperatorRunDetail, StaleRunHealthReport } from '../../types/index';

interface OperatorDashboardProps {
  activeRunId?: string;
  onSelectRun?: (runId: string) => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ activeRunId, onSelectRun }) => {
  const [healthReport, setHealthReport] = useState<StaleRunHealthReport | null>(null);
  const [runs, setRuns] = useState<OperatorRunSummary[]>([]);
  const [selectedRunDetail, setSelectedRunDetail] = useState<OperatorRunDetail | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [evaluationReport, setEvaluationReport] = useState<any>(null);
  const [executionMetrics, setExecutionMetrics] = useState<any>(null);
  const [notificationMetrics, setNotificationMetrics] = useState<any>(null);
  const [sloReport, setSloReport] = useState<any[]>([]);
  const [incidentsList, setIncidentsList] = useState<any[]>([]);

  const fetchOperatorData = async () => {
    setRefreshing(true);
    try {
      // Fetch System Health & Stale Runs Report
      const healthRes = await fetch('/api/v1/ops/health/runs');
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        if (healthData.success) {
          setHealthReport(healthData.healthReport);
        }
      }

      // Fetch Runs List
      const runsRes = await fetch('/api/v1/ops/runs?limit=50');
      if (runsRes.ok) {
        const runsData = await runsRes.json();
        if (runsData.success) {
          setRuns(runsData.runs);
        }
      }

      // Fetch Evaluation Report
      const evalRes = await fetch('/api/v1/evaluation/latest');
      if (evalRes.ok) {
        const evalData = await evalRes.json();
        if (evalData.success) {
          setEvaluationReport(evalData.report);
        }
      }

      // Fetch Execution Worker Metrics
      const execRes = await fetch('/api/v1/ops/execution/status');
      if (execRes.ok) {
        const execData = await execRes.json();
        if (execData.success) {
          setExecutionMetrics(execData);
        }
      }
      // Fetch Notification Delivery Metrics (Phase 19)
      const notifRes = await fetch('/api/v1/ops/notifications/metrics', {
        headers: { Authorization: 'Bearer operator-a-token' },
      });
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        if (notifData.success) {
          setNotificationMetrics(notifData.metrics);
        }
      }

      // Fetch Phase 23 SLO & Operational Incidents Telemetry
      const sloRes = await fetch('/api/v1/ops/slo', {
        headers: { Authorization: 'Bearer operator-a-token' },
      });
      if (sloRes.ok) {
        const sloData = await sloRes.json();
        if (sloData.success) {
          setSloReport(sloData.slos || []);
        }
      }

      const incRes = await fetch('/api/v1/ops/incidents', {
        headers: { Authorization: 'Bearer operator-a-token' },
      });
      if (incRes.ok) {
        const incData = await incRes.json();
        if (incData.success) {
          setIncidentsList(incData.incidents || []);
        }
      }
    } catch (err) {
      console.error('Error fetching operator telemetry:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchRunDetail = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/ops/runs/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSelectedRunDetail(data.runDetail);
        }
      }
    } catch (err) {
      console.error(`Error fetching run detail for ${id}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperatorData();
  }, []);

  useEffect(() => {
    if (activeRunId) {
      fetchRunDetail(activeRunId);
    }
  }, [activeRunId]);

  const filteredRuns = runs.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.correlationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.orderId && r.orderId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #334155',
        color: '#f8fafc',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity style={{ color: '#38bdf8' }} size={24} />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>ResolveX Operator Control Plane</h2>
            <span style={{
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}>
              PHASE 13 OBSERVABILITY
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Production audit integrity, correlation ID tracing, and real-time diagnostic health monitoring.
          </p>
        </div>

        <button
          onClick={fetchOperatorData}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#334155',
            color: '#f8fafc',
            border: '1px solid #475569',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Telemetry'}
        </button>
      </div>

      {/* Metrics Summary Cards */}
      {healthReport && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
              <span>Total Orchestrated Runs</span>
              <Layers size={16} color="#38bdf8" />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: '6px' }}>
              {healthReport.summary.totalRuns}
            </div>
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
              <span>Healthy / Resolved</span>
              <CheckCircle2 size={16} color="#10b981" />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', marginTop: '6px' }}>
              {healthReport.summary.healthy}
            </div>
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
              <span>Human Gate Waiting</span>
              <UserCheck size={16} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b', marginTop: '6px' }}>
              {healthReport.summary.waiting}
            </div>
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
              <span>Stale Waiting (&gt;10m)</span>
              <Clock size={16} color="#f97316" />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: healthReport.summary.stale > 0 ? '#f97316' : '#f8fafc', marginTop: '6px' }}>
              {healthReport.summary.stale}
            </div>
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
              <span>Suspicious / Unverified</span>
              <AlertTriangle size={16} color="#ef4444" />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: healthReport.summary.suspicious > 0 ? '#ef4444' : '#f8fafc', marginTop: '6px' }}>
              {healthReport.summary.suspicious}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 19 NOTIFICATION DELIVERY TELEMETRY */}
      {notificationMetrics && (
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1a1f35 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#f8fafc',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🔔</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                  Phase 19 — Notification Delivery Telemetry
                </h3>
                <span style={{ fontSize: '0.73rem', color: '#64748b' }}>
                  Real-time communication delivery metrics
                </span>
              </div>
            </div>
            <div style={{
              background: notificationMetrics.deliverySuccessRate >= 90
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(245, 158, 11, 0.15)',
              color: notificationMetrics.deliverySuccessRate >= 90 ? '#10b981' : '#f59e0b',
              border: `1px solid ${notificationMetrics.deliverySuccessRate >= 90 ? '#10b981' : '#f59e0b'}`,
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.78rem',
            }}>
              {notificationMetrics.deliverySuccessRate}% DELIVERY RATE
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
            {[
              { label: 'Queued', value: notificationMetrics.queued, color: '#38bdf8' },
              { label: 'Sending', value: notificationMetrics.sending, color: '#a78bfa' },
              { label: 'Sent', value: notificationMetrics.sent, color: '#10b981' },
              { label: 'Failed', value: notificationMetrics.failed, color: '#f59e0b' },
              { label: 'Perm. Failed', value: notificationMetrics.failedPermanently, color: '#f43f5e' },
              { label: 'Total Retries', value: notificationMetrics.retryCount, color: '#60a5fa' },
              { label: 'Unread', value: notificationMetrics.unreadCount, color: '#fbbf24' },
              { label: 'Total', value: notificationMetrics.total, color: '#94a3b8' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '10px 12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHASE 23 OBSERVABILITY, SLO & OPERATIONAL INCIDENT CONTROL */}
      {(sloReport.length > 0 || incidentsList.length > 0) && (
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#f8fafc',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity style={{ color: '#c084fc' }} size={22} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                  Phase 23 — Observability, SLO Error Budgets & Active Operational Incidents
                </h3>
                <span style={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                  Real-time error budget tracking, burn rate monitoring, and automated incident deduplication
                </span>
              </div>
            </div>
            <span style={{
              background: incidentsList.filter(i => i.status === 'OPEN' || i.status === 'INVESTIGATING').length > 0
                ? 'rgba(239, 68, 68, 0.2)'
                : 'rgba(16, 185, 129, 0.2)',
              color: incidentsList.filter(i => i.status === 'OPEN' || i.status === 'INVESTIGATING').length > 0 ? '#ef4444' : '#10b981',
              border: `1px solid ${incidentsList.filter(i => i.status === 'OPEN' || i.status === 'INVESTIGATING').length > 0 ? '#ef4444' : '#10b981'}`,
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.78rem',
            }}>
              {incidentsList.filter(i => i.status === 'OPEN' || i.status === 'INVESTIGATING').length} ACTIVE INCIDENTS
            </span>
          </div>

          {/* SLO Grid */}
          {sloReport.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
                Service Level Objectives (SLOs)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                {sloReport.map((slo: any) => (
                  <div key={slo.name} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{slo.name}</span>
                      <span style={{ color: slo.status === 'HEALTHY' ? '#10b981' : slo.status === 'WARNING' ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>
                        {slo.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                      {(slo.currentValue * 100).toFixed(1)}% / {(slo.target * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                      Budget Remaining: {slo.remainingErrorBudget !== undefined ? `${slo.remainingErrorBudget}%` : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incidents List */}
          {incidentsList.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
                Recent Operational Incidents ({incidentsList.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {incidentsList.slice(0, 5).map((inc: any) => (
                  <div key={inc.id} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: inc.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: inc.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}>
                          {inc.severity}
                        </span>
                        <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }}>{inc.title}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        Fingerprint: {inc.fingerprint} | Component: {inc.affectedComponent}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: '#e2e8f0',
                        fontSize: '0.7rem',
                        padding: '3px 8px',
                        borderRadius: '4px',
                      }}>
                        {inc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 15 EVALUATION & QUALITY BENCHMARKS SCORECARD */}
      {evaluationReport && (

        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid #3b82f6',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={22} color="#10b981" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>Phase 15 — Autonomous Agent Quality & Safety Benchmarks</h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Golden Dataset Version {evaluationReport.datasetVersion} ({evaluationReport.summary.totalCases} Ground-Truth Cases Tested)
                </span>
              </div>
            </div>
            <div style={{
              background: evaluationReport.safetyScore.status === 'PASS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: evaluationReport.safetyScore.status === 'PASS' ? '#10b981' : '#ef4444',
              border: `1px solid ${evaluationReport.safetyScore.status === 'PASS' ? '#10b981' : '#ef4444'}`,
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}>
              SAFETY STATUS: {evaluationReport.safetyScore.status}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginTop: '4px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '10px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Intent Accuracy</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>{evaluationReport.metrics.intentAccuracy}%</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '10px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Policy Accuracy</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>{evaluationReport.metrics.policyAccuracy}%</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '10px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Decision Accuracy</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>{evaluationReport.metrics.decisionAccuracy}%</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '10px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Resolution Acc.</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>{evaluationReport.metrics.resolutionAccuracy}%</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '10px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Determinism Rate</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#a855f7' }}>{evaluationReport.metrics.determinismRate}%</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#cbd5e1', paddingTop: '4px', borderTop: '1px solid #334155' }}>
            <span>False Resolutions: <strong style={{ color: '#10b981' }}>{evaluationReport.safetyScore.falseResolutions}</strong></span>
            <span>Approval Bypasses: <strong style={{ color: '#10b981' }}>{evaluationReport.safetyScore.approvalBypasses}</strong></span>
            <span>Consent Bypasses: <strong style={{ color: '#10b981' }}>{evaluationReport.safetyScore.consentBypasses}</strong></span>
            <span>Duplicate Mutations: <strong style={{ color: '#10b981' }}>{evaluationReport.safetyScore.duplicateMutations}</strong></span>
          </div>
        </div>
      )}

      {/* Main Grid: Run Explorer (Left) & Detailed Inspector (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
        {/* Left Column: Operator Run Explorer */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#38bdf8" />
              Orchestrated Case Explorer
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Showing {filteredRuns.length} runs</span>
          </div>

          {/* Search & Filter Controls */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Filter by Correlation ID, Run ID, Order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '7px 10px 7px 32px',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '7px 10px',
                color: '#f8fafc',
                fontSize: '0.85rem',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="WAITING_FOR_APPROVAL">WAITING_FOR_APPROVAL</option>
              <option value="WAITING_FOR_CUSTOMER_CONSENT">WAITING_FOR_CUSTOMER_CONSENT</option>
              <option value="ESCALATED">ESCALATED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          {/* Runs List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
            {filteredRuns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.85rem' }}>
                No orchestrated runs match current filter criteria.
              </div>
            ) : (
              filteredRuns.map((r) => {
                const isSelected = selectedRunDetail?.id === r.id;
                const isWaiting = r.pendingHumanGate !== 'NONE';

                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      fetchRunDetail(r.id);
                      if (onSelectRun) onSelectRun(r.id);
                    }}
                    style={{
                      background: isSelected ? 'rgba(56, 189, 248, 0.1)' : '#0f172a',
                      border: isSelected ? '1px solid #38bdf8' : '1px solid #334155',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>
                        {r.correlationId}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background:
                            r.status === 'RESOLVED'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : isWaiting
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(244, 63, 94, 0.2)',
                          color:
                            r.status === 'RESOLVED'
                              ? '#10b981'
                              : isWaiting
                              ? '#f59e0b'
                              : '#f43f5e',
                          border: `1px solid ${
                            r.status === 'RESOLVED'
                              ? '#10b981'
                              : isWaiting
                              ? '#f59e0b'
                              : '#f43f5e'
                          }`,
                        }}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#f8fafc', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.goal}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>Step: {r.currentStep}</span>
                      <span>
                        Mutations: {r.mutations.verified}/{r.mutations.executed} Verified
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Run Inspector */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#38bdf8" />
            Audit & Diagnostic Run Inspector
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading detailed diagnostic telemetry...</div>
          ) : !selectedRunDetail ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '0.85rem' }}>
              Select a run from the explorer on the left to inspect its operational timeline, correlation ID, and audit integrity verification matrix.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Identity & Correlation Card */}
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Correlation ID:</span>
                    <div style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>{selectedRunDetail.correlationId}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Agent Run ID:</span>
                    <div style={{ fontFamily: 'monospace', color: '#f8fafc' }}>{selectedRunDetail.id}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Ticket Reference:</span>
                    <div style={{ color: '#f8fafc' }}>{selectedRunDetail.ticketId}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Order Reference:</span>
                    <div style={{ color: '#f8fafc' }}>{selectedRunDetail.orderId || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Mutation Verification Matrix */}
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#10b981" />
                  Mutation Audit Integrity Matrix
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                  <div style={{ background: '#1e293b', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ATTEMPTED</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>{selectedRunDetail.mutations.attempted}</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>EXECUTED</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>{selectedRunDetail.mutations.executed}</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>VERIFIED</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>{selectedRunDetail.mutations.verified}</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>VERIF. FAILED</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f43f5e' }}>{selectedRunDetail.mutations.verificationFailed}</div>
                  </div>
                </div>
              </div>

              {/* Phase 14: Reliability & Crash Recovery Control */}
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={16} color="#38bdf8" />
                    Reliability & Crash Recovery
                  </div>
                  <button
                    onClick={async () => {
                      if (!selectedRunDetail) return;
                      try {
                        const res = await fetch(`/api/v1/ops/runs/${selectedRunDetail.id}/reconcile`, { method: 'POST' });
                        const data = await res.json();
                        alert(`Reconciliation Result:\nStatus: ${data.reconciliation?.status}\nMessage: ${data.reconciliation?.message}`);
                        fetchOperatorData();
                        if (selectedRunDetail?.id) {
                          fetchRunDetail(selectedRunDetail.id);
                        }
                      } catch (err: any) {
                        alert(`Reconciliation failed: ${err.message}`);
                      }
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Reconcile Run
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '0.75rem' }}>
                  <div><span style={{ color: '#64748b' }}>Replans:</span> <span style={{ color: '#f8fafc' }}>{selectedRunDetail.replanCount} / 3</span></div>
                  <div><span style={{ color: '#64748b' }}>Ground Truth:</span> <span style={{ color: selectedRunDetail.mutations.verified > 0 ? '#10b981' : '#f59e0b' }}>{selectedRunDetail.mutations.verified > 0 ? 'VERIFIED' : 'UNVERIFIED'}</span></div>
                  <div><span style={{ color: '#64748b' }}>Reconciliation:</span> <span style={{ color: '#38bdf8' }}>SAFE</span></div>
                </div>
              </div>

              {/* Step Trace Timeline */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
                  Reconstructable Step Trace Timeline ({selectedRunDetail.traces.length} events)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '250px', overflowY: 'auto' }}>
                  {selectedRunDetail.traces.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        background: '#0f172a',
                        borderLeft: `3px solid ${t.status === 'SUCCESS' ? '#10b981' : t.status === 'FAILED' ? '#f43f5e' : '#38bdf8'}`,
                        padding: '8px 10px',
                        borderRadius: '0 6px 6px 0',
                        fontSize: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f8fafc', fontWeight: 600 }}>
                        <span>{t.title}</span>
                        <span style={{ color: '#64748b' }}>{new Date(t.timestamp).toLocaleTimeString()}</span>
                      </div>
                      {t.description && <div style={{ color: '#94a3b8', marginTop: '2px' }}>{t.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
