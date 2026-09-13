import React from 'react';
import { Activity, CheckCircle2, Clock, AlertTriangle, ShieldCheck, RefreshCw, XCircle } from 'lucide-react';
import { AgentTraceItem, AgentOrchestrationResult } from '../../types';

interface AgentTimelineProps {
  orchestrationResult?: AgentOrchestrationResult | null;
  traces?: AgentTraceItem[];
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ orchestrationResult, traces = [] }) => {
  if (!orchestrationResult && traces.length === 0) {
    return null;
  }

  // Synthesize timeline steps from orchestrationResult if traces array is empty
  const timelineItems = traces.length > 0 ? traces : buildSyntheticTimeline(orchestrationResult);

  return (
    <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={18} color="#8b5cf6" />
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc' }}>
            Agent Execution Timeline
          </h3>
        </div>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          {timelineItems.length} Executed Steps
        </span>
      </div>

      <div style={{ position: 'relative', paddingLeft: '24px' }}>
        {/* Timeline Connecting Line */}
        <div style={{
          position: 'absolute',
          left: '9px',
          top: '12px',
          bottom: '12px',
          width: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        }} />

        {timelineItems.map((item, idx) => {
          const isLast = idx === timelineItems.length - 1;
          const styleConfig = getStepStyle(item.step || item.type, item.status);

          return (
            <div key={item.id || idx} style={{ position: 'relative', marginBottom: isLast ? '0' : '20px' }}>
              {/* Node Icon Badge */}
              <div style={{
                position: 'absolute',
                left: '-24px',
                top: '2px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: styleConfig.bg,
                border: `2px solid ${styleConfig.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}>
                {styleConfig.icon}
              </div>

              {/* Step Content */}
              <div style={{
                backgroundColor: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '10px',
                padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: styleConfig.color, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      {item.step || item.type}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>
                      {item.title || item.step}
                    </span>
                  </div>

                  <span className="font-mono" style={{ fontSize: '11px', color: '#64748b' }}>
                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>

                {item.description && (
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.4', marginTop: '4px' }}>
                    {item.description}
                  </p>
                )}

                {/* Structured Payload Rendering */}
                {item.output && typeof item.output === 'object' && (
                  <div style={{ marginTop: '8px', padding: '8px 10px', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', fontSize: '11px', color: '#cbd5e1' }}>
                    <span style={{ color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '2px' }}>Payload Output:</span>
                    <pre className="font-mono" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {JSON.stringify(item.output, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function getStepStyle(step: string, status?: string) {
  if (status === 'FAILED') {
    return { bg: '#451a03', color: '#f43f5e', icon: <XCircle size={10} color="#f43f5e" /> };
  }

  switch (step) {
    case 'GOAL_RECEIVED':
    case 'GOAL':
      return { bg: '#0c4a6e', color: '#06b6d4', icon: <Activity size={10} color="#06b6d4" /> };
    case 'INTENT_CLASSIFICATION':
    case 'INTENT':
      return { bg: '#1e1b4b', color: '#8b5cf6', icon: <ShieldCheck size={10} color="#8b5cf6" /> };
    case 'INVESTIGATION':
      return { bg: '#064e3b', color: '#10b981', icon: <CheckCircle2 size={10} color="#10b981" /> };
    case 'POLICY_EVALUATION':
    case 'POLICY':
      return { bg: '#78350f', color: '#f59e0b', icon: <Clock size={10} color="#f59e0b" /> };
    case 'DECISION_FORMULATION':
    case 'DECISION':
      return { bg: '#1e1b4b', color: '#8b5cf6', icon: <ShieldCheck size={10} color="#8b5cf6" /> };
    case 'TOOL_EXECUTION':
    case 'ACTION':
      return { bg: '#0c4a6e', color: '#3b82f6', icon: <Activity size={10} color="#3b82f6" /> };
    case 'ACTION_VERIFICATION':
    case 'VERIFICATION':
      return { bg: '#064e3b', color: '#10b981', icon: <CheckCircle2 size={10} color="#10b981" /> };
    case 'FAILURE_DETECTED':
    case 'REPLANNING':
    case 'REPLAN':
      return { bg: '#4c1d95', color: '#a855f7', icon: <RefreshCw size={10} color="#a855f7" /> };
    case 'CASE_RESOLVED':
    case 'RESOLVING':
      return { bg: '#064e3b', color: '#10b981', icon: <CheckCircle2 size={10} color="#10b981" /> };
    case 'HUMAN_ESCALATION':
    case 'ESCALATION':
      return { bg: '#881337', color: '#f43f5e', icon: <AlertTriangle size={10} color="#f43f5e" /> };
    default:
      return { bg: '#1e293b', color: '#94a3b8', icon: <Activity size={10} color="#94a3b8" /> };
  }
}

function buildSyntheticTimeline(result?: AgentOrchestrationResult | null): any[] {
  if (!result) return [];
  const items: any[] = [];
  const ts = new Date().toISOString();

  if (result.intent) {
    items.push({
      step: 'INTENT_CLASSIFICATION',
      title: `Intent Understanding: ${result.intent.issueType}`,
      description: `Classified requested resolution '${result.intent.requestedResolution}' with ${(result.intent.confidence * 100).toFixed(0)}% confidence.`,
      status: 'SUCCESS',
      timestamp: ts,
    });
  }

  if (result.investigation) {
    items.push({
      step: 'INVESTIGATION',
      title: 'Evidence Investigation',
      description: result.investigation.investigationSummary,
      status: 'SUCCESS',
      timestamp: ts,
    });
  }

  if (result.decision) {
    items.push({
      step: 'DECISION_FORMULATION',
      title: `Decision: ${result.decision.selectedAction} (${result.decision.decision})`,
      description: result.decision.reason,
      status: 'SUCCESS',
      timestamp: ts,
    });
  }

  if (result.execution) {
    items.push({
      step: 'TOOL_EXECUTION',
      title: `Action Execution: ${result.execution.actionType}`,
      description: result.execution.reason || `Executed ${result.execution.actionType} tool. Verification: ${result.execution.verificationStatus || 'PENDING'}`,
      status: result.execution.status === 'FAILED' ? 'FAILED' : 'SUCCESS',
      timestamp: ts,
    });
  }

  if (result.recovery) {
    items.push({
      step: 'REPLANNING',
      title: `Failure Recovery & Replan (${result.recovery.failureType || 'DETECTED'})`,
      description: result.recovery.reason,
      status: 'SUCCESS',
      timestamp: ts,
    });
  }

  return items;
}
