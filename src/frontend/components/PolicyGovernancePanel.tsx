// ResolveX Phase 20 — Policy Governance, Versioning & Change Control Dashboard Component

import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  GitBranch,
  Play,
  RotateCcw,
  Plus,
  ArrowRight,
  Shield,
  Layers,
  History,
  Check,
  X,
  Eye,
  Settings,
} from 'lucide-react';

export interface PolicyGovernancePanelProps {
  token: string;
  role: string;
  tenantId: string;
}

export const PolicyGovernancePanel: React.FC<PolicyGovernancePanelProps> = ({ token, role, tenantId }) => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null);
  const [diffData, setDiffData] = useState<any | null>(null);
  const [previewResult, setPreviewResult] = useState<any | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Modals / Inputs
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newPolicyKey, setNewPolicyKey] = useState<string>('');
  const [newPolicyName, setNewPolicyName] = useState<string>('');
  const [newIssueType, setNewIssueType] = useState<string>('DAMAGED');
  const [newActionType, setNewActionType] = useState<string>('REFUND');
  const [newMaxRefundAmount, setNewMaxRefundAmount] = useState<number>(5000);

  const [previewAmount, setPreviewAmount] = useState<number>(4999);
  const [previewIssueType, setPreviewIssueType] = useState<string>('DAMAGED');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/policies', { headers });
      const data = await res.json();
      if (data.success) {
        setPolicies(data.policies || []);
        setMetrics(data.metrics || null);
        if (data.policies?.length > 0 && !selectedPolicy) {
          setSelectedPolicy(data.policies[0]);
          if (data.policies[0].versions?.length > 0) {
            setSelectedVersion(data.policies[0].versions[0]);
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [tenantId]);

  const handleSelectPolicy = (pol: any) => {
    setSelectedPolicy(pol);
    setDiffData(null);
    setPreviewResult(null);
    if (pol.versions?.length > 0) {
      setSelectedVersion(pol.versions[0]);
    } else {
      setSelectedVersion(null);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/policies', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          policyKey: newPolicyKey.toUpperCase(),
          name: newPolicyName,
          issueType: newIssueType,
          actionType: newActionType,
          conditions: { maxAutoRefundAmount: newMaxRefundAmount, requiresApprovalAbove: true },
          priority: 1,
          autoActivate: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Policy '${newPolicyKey}' created successfully!` });
        setShowCreateModal(false);
        fetchPolicies();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create policy' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleCreateDraftVersion = async (maxRefund: number) => {
    if (!selectedPolicy) return;
    try {
      const res = await fetch(`/api/v1/policies/${selectedPolicy.id}/versions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          conditions: { maxAutoRefundAmount: maxRefund, requiresApprovalAbove: true },
          changeSummary: `Updated auto-refund threshold to ₹${maxRefund}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Draft Version ${data.version.version} created!` });
        fetchPolicies();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleSubmitVersion = async (versionNum: number) => {
    if (!selectedPolicy) return;
    try {
      const res = await fetch(`/api/v1/policies/${selectedPolicy.id}/versions/${versionNum}/submit`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Version ${versionNum} submitted for approval!` });
        fetchPolicies();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleApproveVersion = async (versionNum: number) => {
    if (!selectedPolicy) return;
    try {
      const res = await fetch(`/api/v1/policies/${selectedPolicy.id}/versions/${versionNum}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ allowSelfApprove: role === 'ADMIN' }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Version ${versionNum} approved!` });
        fetchPolicies();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleActivateVersion = async (versionNum: number) => {
    if (!selectedPolicy) return;
    try {
      const res = await fetch(`/api/v1/policies/${selectedPolicy.id}/versions/${versionNum}/activate`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Version ${versionNum} is now ACTIVE!` });
        fetchPolicies();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleRollback = async (versionNum: number) => {
    if (!selectedPolicy) return;
    try {
      const res = await fetch(`/api/v1/policies/${selectedPolicy.id}/versions/${versionNum}/rollback`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Rolled back policy to Version ${versionNum}!` });
        fetchPolicies();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handlePreviewEvaluation = async () => {
    if (!selectedPolicy || !selectedVersion) return;
    try {
      const res = await fetch(`/api/v1/policies/${selectedPolicy.id}/versions/${selectedVersion.version}/evaluate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          investigationContext: {
            intent: {
              issueType: previewIssueType,
              requestedResolution: selectedPolicy.actionType,
              entities: { amount: previewAmount, currency: 'INR' },
            },
            order: { totalAmount: previewAmount, deliveryDate: new Date().toISOString() },
            customer: { tier: 'STANDARD' },
            eligibilitySignals: [],
            products: [],
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPreviewResult(data.evaluationItem);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleFetchDiff = async (v1: number, v2: number) => {
    if (!selectedPolicy) return;
    try {
      const res = await fetch(`/api/v1/policies/${selectedPolicy.id}/diff?v1=${v1}&v2=${v2}`, { headers });
      const data = await res.json();
      if (data.success) {
        setDiffData(data.diff);
      }
    } catch (err: any) {
      console.error('Diff error:', err);
    }
  };

  return (
    <div style={{ padding: '24px', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield style={{ color: '#38bdf8' }} size={28} />
            Policy Governance & Change Control
          </h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '14px' }}>
            Phase 20 Immutable Versioning, Dual Approval, Effective Dates & Decision Reproducibility
          </p>
        </div>

        {role === 'ADMIN' && (
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#38bdf8',
              color: '#0f172a',
              fontWeight: '600',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={18} /> New Policy
          </button>
        )}
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
            color: message.type === 'success' ? '#4ade80' : '#f87171',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{message.text}</span>
          <X size={16} style={{ cursor: 'pointer' }} onClick={() => setMessage(null)} />
        </div>
      )}

      {/* Telemetry Metrics */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>TOTAL POLICIES</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>{metrics.totalPolicies}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>ACTIVE</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#4ade80', marginTop: '4px' }}>{metrics.activePolicies}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>DRAFTS</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#94a3b8', marginTop: '4px' }}>{metrics.draftVersions}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>PENDING APPROVAL</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#fbbf24', marginTop: '4px' }}>{metrics.pendingApprovalVersions}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>APPROVED</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#38bdf8', marginTop: '4px' }}>{metrics.approvedVersions}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>RETIRED</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#64748b', marginTop: '4px' }}>{metrics.retiredVersions}</div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        {/* Left: Policy List */}
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: '#38bdf8' }} /> Policies ({policies.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {policies.map((p) => {
              const isSelected = selectedPolicy?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPolicy(p)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.05)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#f8fafc', fontSize: '14px' }}>{p.name}</span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: p.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                        color: p.active ? '#4ade80' : '#94a3b8',
                      }}
                    >
                      {p.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    Key: {p.policyKey} • Issue: {p.issueType}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    Active Version: v{p.activeVersion?.version || 'None'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Policy Detail & Version Management */}
        {selectedPolicy ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header info */}
            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>{selectedPolicy.name}</h3>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                    Key: <code style={{ color: '#38bdf8' }}>{selectedPolicy.policyKey}</code> | Issue: {selectedPolicy.issueType} | Action: {selectedPolicy.actionType}
                  </div>
                </div>

                {role === 'ADMIN' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleCreateDraftVersion(3000)}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: 'rgba(56, 189, 248, 0.2)',
                        border: '1px solid #38bdf8',
                        color: '#38bdf8',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      + Draft (₹3,000 Threshold)
                    </button>
                    <button
                      onClick={() => handleCreateDraftVersion(15000)}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: 'rgba(168, 85, 247, 0.2)',
                        border: '1px solid #c084fc',
                        color: '#c084fc',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      + Draft (₹15,000 Threshold)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Version History List */}
            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} style={{ color: '#38bdf8' }} /> Version History & Lifecycle Actions
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedPolicy.versions?.map((v: any) => {
                  const isSelectedV = selectedVersion?.id === v.id;
                  let statusBg = '#64748b';
                  let statusColor = '#f8fafc';
                  if (v.status === 'ACTIVE') { statusBg = 'rgba(34, 197, 94, 0.2)'; statusColor = '#4ade80'; }
                  else if (v.status === 'APPROVED') { statusBg = 'rgba(56, 189, 248, 0.2)'; statusColor = '#38bdf8'; }
                  else if (v.status === 'PENDING_APPROVAL') { statusBg = 'rgba(251, 191, 36, 0.2)'; statusColor = '#fbbf24'; }
                  else if (v.status === 'DRAFT') { statusBg = 'rgba(148, 163, 184, 0.2)'; statusColor = '#cbd5e1'; }

                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVersion(v)}
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        backgroundColor: isSelectedV ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.4)',
                        border: `1px solid ${isSelectedV ? '#38bdf8' : 'rgba(255, 255, 255, 0.05)'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: '700', fontSize: '15px', color: '#f8fafc' }}>Version {v.version}</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: statusBg, color: statusColor }}>
                            {v.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                          Created by: {v.createdBy} | Change: {v.changeSummary || 'No summary'}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {v.status === 'DRAFT' && role === 'ADMIN' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSubmitVersion(v.version); }}
                            style={{ padding: '6px 12px', backgroundColor: '#fbbf24', color: '#0f172a', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}
                          >
                            Submit
                          </button>
                        )}
                        {v.status === 'PENDING_APPROVAL' && (role === 'APPROVER' || role === 'ADMIN') && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApproveVersion(v.version); }}
                            style={{ padding: '6px 12px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                        )}
                        {v.status === 'APPROVED' && (role === 'ADMIN' || role === 'SERVICE') && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleActivateVersion(v.version); }}
                            style={{ padding: '6px 12px', backgroundColor: '#22c55e', color: '#0f172a', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}
                          >
                            Activate
                          </button>
                        )}
                        {(v.status === 'RETIRED' || (v.status === 'APPROVED' && selectedPolicy.activeVersion?.version !== v.version)) && role === 'ADMIN' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRollback(v.version); }}
                            style={{ padding: '6px 12px', backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid #c084fc', borderRadius: '4px', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}
                          >
                            Rollback to v{v.version}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Version Detail & Preview / Dry Run */}
            {selectedVersion && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Definition Viewer */}
                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', marginBottom: '12px' }}>
                    Version {selectedVersion.version} Definition JSON
                  </h4>
                  <pre
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#38bdf8',
                      overflowX: 'auto',
                      maxHeight: '220px',
                    }}
                  >
                    {JSON.stringify(JSON.parse(selectedVersion.definition || '{}'), null, 2)}
                  </pre>
                </div>

                {/* Dry Run Preview Form */}
                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Play size={16} style={{ color: '#4ade80' }} /> Dry-Run Policy Evaluation Preview
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#94a3b8' }}>Test Claim Amount (₹):</label>
                      <input
                        type="number"
                        value={previewAmount}
                        onChange={(e) => setPreviewAmount(Number(e.target.value))}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', marginTop: '4px' }}
                      />
                    </div>
                    <button
                      onClick={handlePreviewEvaluation}
                      style={{ padding: '8px 14px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}
                    >
                      Run Non-Mutating Preview
                    </button>
                    {previewResult && (
                      <div style={{ marginTop: '10px', padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #38bdf8', fontSize: '12px' }}>
                        <div><strong>Applicable:</strong> {previewResult.applicable ? '✅ YES' : '❌ NO'}</div>
                        <div><strong>Approval Required:</strong> {previewResult.approvalRequired ? '⚠️ YES' : '🟢 NO'}</div>
                        <div style={{ color: '#94a3b8', marginTop: '4px' }}>{previewResult.reason}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Select a policy from the left to view version history</div>
        )}
      </div>

      {/* Create Policy Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreatePolicy} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', width: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>Create New Policy</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Policy Key (e.g. HIGH_VALUE_REFUND):</label>
                <input required value={newPolicyKey} onChange={(e) => setNewPolicyKey(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Display Name:</label>
                <input required value={newPolicyName} onChange={(e) => setNewPolicyName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Max Auto-Refund Amount (₹):</label>
                <input type="number" required value={newMaxRefundAmount} onChange={(e) => setNewMaxRefundAmount(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', marginTop: '4px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '8px 16px', backgroundColor: '#475569', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: '600', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Create & Activate v1</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
