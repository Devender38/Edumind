import React, { useEffect, useState } from 'react';
import { HealthCheckResponse, AgentOrchestrationResult, AgentTraceItem } from '../types';
import { Header } from './components/Header';
import { ScenarioPresets, ScenarioPreset, PRESET_SCENARIOS } from './components/ScenarioPresets';
import { CaseInputPanel } from './components/CaseInputPanel';
import { AgentStatusBanner } from './components/AgentStatusBanner';
import { CaseContextCard } from './components/CaseContextCard';
import { AgentTimeline } from './components/AgentTimeline';
import { EvidencePanel } from './components/EvidencePanel';
import { AuditSafetyCard } from './components/AuditSafetyCard';

import { OperatorDashboard } from './components/OperatorDashboard';
import { NotificationsPanel } from './components/NotificationsPanel';

import { PolicyGovernancePanel } from './components/PolicyGovernancePanel';
import { CustomerDashboard } from './components/CustomerDashboard';
import { getApiUrl } from './config/apiConfig';

export default function App() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'RESOLUTION' | 'OPERATOR' | 'NOTIFICATIONS' | 'POLICIES' | 'CASES'>('RESOLUTION');

  // Form State
  const [message, setMessage] = useState<string>(PRESET_SCENARIOS[0].message);
  const [ticketId, setTicketId] = useState<string>(PRESET_SCENARIOS[0].ticketId || '');
  const [orderId, setOrderId] = useState<string>(PRESET_SCENARIOS[0].orderId || '');
  const [customerConsentGiven, setCustomerConsentGiven] = useState<boolean>(false);
  const [approvalToken, setApprovalToken] = useState<string>('');
  const [activePresetId, setActivePresetId] = useState<string>(PRESET_SCENARIOS[0].id);

  // Orchestration & Run State
  const [orchestrationLoading, setOrchestrationLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AgentOrchestrationResult | null>(null);
  const [traces, setTraces] = useState<AgentTraceItem[]>([]);
  const [runError, setRunError] = useState<string | null>(null);

  // Fetch Health Check on Load
  useEffect(() => {
    fetch(getApiUrl('/api/v1/health'))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: HealthCheckResponse) => {
        setHealth(data);
        setHealthLoading(false);
      })
      .catch((err) => {
        console.error('Health check failed:', err);
        setHealthError(err.message);
        setHealthLoading(false);
      });
  }, []);

  // Handle Preset Selection
  const handleSelectPreset = (preset: ScenarioPreset) => {
    setActivePresetId(preset.id);
    setMessage(preset.message);
    setTicketId(preset.ticketId || '');
    setOrderId(preset.orderId || '');
    setCustomerConsentGiven(Boolean(preset.customerConsentGiven));
    setApprovalToken('');
    setResult(null);
    setTraces([]);
    setRunError(null);
  };

  // Execute Agent Orchestration
  const handleRunAgent = async () => {
    if (!message.trim()) return;

    setOrchestrationLoading(true);
    setRunError(null);
    setResult(null);
    setTraces([]);

    try {
      const response = await fetch(getApiUrl('/api/v1/agents/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          ticketId: ticketId.trim() || undefined,
          orderId: orderId.trim() || undefined,
          customerConsentGiven,
          approvalToken: approvalToken.trim() || undefined,
          idempotencyKey: `dash-${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.orchestrationResult) {
        setResult(data.orchestrationResult);

        // Fetch full traces if agentRunId is returned
        if (data.orchestrationResult.agentRunId) {
          fetch(getApiUrl(`/api/v1/agent-runs/${data.orchestrationResult.agentRunId}`))
            .then((r) => r.json())
            .then((runData) => {
              if (runData && runData.traces) {
                setTraces(runData.traces);
              }
            })
            .catch(() => null);
        }
      } else {
        throw new Error(data.error || 'Orchestration failed to return structured result');
      }
    } catch (err: any) {
      console.error('Orchestration error:', err);
      setRunError(err.message || 'Network error executing agent orchestrator');
    } finally {
      setOrchestrationLoading(false);
    }
  };

  // Helper to fetch updated traces
  const fetchTraces = (agentRunId: string) => {
    fetch(getApiUrl(`/api/v1/agent-runs/${agentRunId}`))
      .then((r) => r.json())
      .then((runData) => {
        if (runData && runData.traces) {
          setTraces(runData.traces);
        }
      })
      .catch(() => null);
  };

  // Phase 12 Human-in-the-Loop Resumable Actions
  const handleApproveRun = async (decision: 'APPROVE' | 'REJECT') => {
    if (!result?.agentRunId) return;
    setOrchestrationLoading(true);
    setRunError(null);

    try {
      const response = await fetch(getApiUrl(`/api/v1/agents/runs/${result.agentRunId}/approve`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          approvalToken: approvalToken.trim() || 'MANAGER_APPROVAL_GRANTED',
        }),
      });

      const data = await response.json();
      if (data.success && data.orchestrationResult) {
        setResult(data.orchestrationResult);
        fetchTraces(result.agentRunId);
      } else {
        throw new Error(data.error || 'Approval action failed');
      }
    } catch (err: any) {
      setRunError(err.message || 'Error processing approval decision');
    } finally {
      setOrchestrationLoading(false);
    }
  };

  const handleConsentRun = async (consentGiven: boolean) => {
    if (!result?.agentRunId) return;
    setOrchestrationLoading(true);
    setRunError(null);

    try {
      const response = await fetch(getApiUrl(`/api/v1/agents/runs/${result.agentRunId}/consent`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentGiven }),
      });

      const data = await response.json();
      if (data.success && data.orchestrationResult) {
        setResult(data.orchestrationResult);
        fetchTraces(result.agentRunId);
      } else {
        throw new Error(data.error || 'Consent action failed');
      }
    } catch (err: any) {
      setRunError(err.message || 'Error processing customer consent decision');
    } finally {
      setOrchestrationLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      {/* Header Bar */}
      <Header health={health} loading={healthLoading} error={healthError} />

      {/* Phase 13 Navigation View Switcher */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('RESOLUTION')}
          style={{
            background: activeTab === 'RESOLUTION' ? '#38bdf8' : '#1e293b',
            color: activeTab === 'RESOLUTION' ? '#0f172a' : '#f8fafc',
            border: '1px solid #334155',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Customer Resolution View
        </button>
        <button
          onClick={() => setActiveTab('OPERATOR')}
          style={{
            background: activeTab === 'OPERATOR' ? '#38bdf8' : '#1e293b',
            color: activeTab === 'OPERATOR' ? '#0f172a' : '#f8fafc',
            border: '1px solid #334155',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Operator Control Plane (Phase 13)
        </button>
        <button
          onClick={() => setActiveTab('NOTIFICATIONS')}
          id="tab-notifications"
          style={{
            background: activeTab === 'NOTIFICATIONS' ? '#38bdf8' : '#1e293b',
            color: activeTab === 'NOTIFICATIONS' ? '#0f172a' : '#f8fafc',
            border: '1px solid #334155',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          🔔 Notifications (Phase 19)
        </button>
        <button
          onClick={() => setActiveTab('POLICIES')}
          id="tab-policies"
          style={{
            background: activeTab === 'POLICIES' ? '#38bdf8' : '#1e293b',
            color: activeTab === 'POLICIES' ? '#0f172a' : '#f8fafc',
            border: '1px solid #334155',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          🛡️ Policy Governance (Phase 20)
        </button>
        <button
          onClick={() => setActiveTab('CASES')}
          id="tab-cases"
          style={{
            background: activeTab === 'CASES' ? '#38bdf8' : '#1e293b',
            color: activeTab === 'CASES' ? '#0f172a' : '#f8fafc',
            border: '1px solid #334155',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          📁 Case Portal (Phase 21)
        </button>
      </div>

      {activeTab === 'OPERATOR' ? (
        <OperatorDashboard activeRunId={result?.agentRunId} />
      ) : activeTab === 'NOTIFICATIONS' ? (
        <NotificationsPanel authToken="customer-a-token" />
      ) : activeTab === 'POLICIES' ? (
        <PolicyGovernancePanel token="admin-a-token" role="ADMIN" tenantId="tenant-default" />
      ) : activeTab === 'CASES' ? (
        <CustomerDashboard />
      ) : (
        <>
          {/* Preset Scenarios Selector */}
          <ScenarioPresets onSelect={handleSelectPreset} activeScenarioId={activePresetId} />

          {/* Input Controls Panel */}
          <CaseInputPanel
            message={message}
            setMessage={setMessage}
            ticketId={ticketId}
            setTicketId={setTicketId}
            orderId={orderId}
            setOrderId={setOrderId}
            customerConsentGiven={customerConsentGiven}
            setCustomerConsentGiven={setCustomerConsentGiven}
            approvalToken={approvalToken}
            setApprovalToken={setApprovalToken}
            onRun={handleRunAgent}
            loading={orchestrationLoading}
          />

          {/* Error Alert Banner */}
          {runError && (
            <div style={{
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '24px',
              color: '#f43f5e',
              fontSize: '14px',
              fontWeight: '500',
            }}>
              ⚠️ Error Executing Orchestrator: {runError}
            </div>
          )}

          {/* Main Responsive Grid Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 380px',
            gap: '24px',
            alignItems: 'start',
          }}>
            {/* Left Column: Context Card & Agent Timeline */}
            <div>
              <CaseContextCard
                investigation={result?.investigation}
                ticketId={ticketId}
                orderId={orderId}
                message={message}
              />

              <AgentTimeline
                orchestrationResult={result}
                traces={traces}
              />
            </div>

            {/* Right Column: Status Banner, Evidence Panel, Audit Safety Card */}
            <div>
              <AgentStatusBanner
                status={result?.status || null}
                reason={result?.reason}
                loopCount={result?.loopCount}
                replanCount={result?.replanCount}
                agentRunId={result?.agentRunId}
                onApprove={() => handleApproveRun('APPROVE')}
                onReject={() => handleApproveRun('REJECT')}
                onGrantConsent={() => handleConsentRun(true)}
                onDenyConsent={() => handleConsentRun(false)}
                actionLoading={orchestrationLoading}
              />

              <EvidencePanel investigation={result?.investigation} />

              <AuditSafetyCard orchestrationResult={result} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
