// ResolveX Phase 21 — Customer Case Management Dashboard Component

import React, { useEffect, useState } from 'react';

export interface CustomerCase {
  id: string;
  orderId?: string | null;
  issueType: string;
  customerMessage: string;
  status: string;
  resolutionSummary?: string | null;
  requiresCustomerAction: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineItem {
  id: string;
  timestamp: string;
  stage: string;
  title: string;
  description: string;
  actor: string;
  isCustomerVisible: boolean;
}

export const CustomerDashboard: React.FC = () => {
  const [cases, setCases] = useState<CustomerCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [timelineLoading, setTimelineLoading] = useState<boolean>(false);
  const [consentSuccess, setConsentSuccess] = useState<string | null>(null);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/cases?search=${encodeURIComponent(search)}`, {
        headers: {
          'Authorization': 'Bearer customer-token-standard',
          'x-tenant-id': 'tenant-a',
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.cases) {
        setCases(data.cases);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [search]);

  const handleViewTimeline = async (caseId: string) => {
    setSelectedCaseId(caseId);
    setTimelineLoading(true);
    setTimeline([]);
    try {
      const res = await fetch(`/api/v1/cases/${caseId}/timeline`, {
        headers: {
          'Authorization': 'Bearer customer-token-standard',
          'x-tenant-id': 'tenant-a',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.timeline) {
        setTimeline(data.timeline);
      }
    } catch (err: any) {
      console.error('Failed to load timeline:', err);
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleGiveConsent = async (caseId: string, consent: boolean) => {
    try {
      const res = await fetch(`/api/v1/agents/runs/${caseId}/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer customer-token-standard',
          'x-tenant-id': 'tenant-a',
        },
        body: JSON.stringify({ consentGiven: consent }),
      });
      const data = await res.json();
      if (res.ok) {
        setConsentSuccess(consent ? 'Consent granted! Agent processing continued.' : 'Consent declined.');
        fetchCases();
        if (selectedCaseId === caseId) {
          handleViewTimeline(caseId);
        }
      } else {
        setError(data.error || 'Failed to submit consent choice');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit consent');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'WAITING_FOR_CUSTOMER':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse';
      case 'WAITING_FOR_APPROVAL':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'INVESTIGATING':
      case 'PROCESSING':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'ESCALATED':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'FAILED':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Customer Case Portal</h2>
          <p className="text-slate-400 text-sm mt-1">
            Track autonomous resolution progress, review case timelines, and authorize resolution actions.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Search by Case ID, Order ID, or issue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 w-64"
          />
          <button
            onClick={fetchCases}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {consentSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm flex justify-between items-center">
          <span>{consentSuccess}</span>
          <button onClick={() => setConsentSuccess(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Cards List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
              Loading customer cases...
            </div>
          ) : cases.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
              No active customer cases found.
            </div>
          ) : (
            cases.map((c) => (
              <div
                key={c.id}
                className={`p-5 rounded-xl border transition-all ${
                  selectedCaseId === c.id
                    ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-semibold text-indigo-400">{c.id}</span>
                    {c.orderId && (
                      <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        Order: {c.orderId}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${getStatusBadgeClass(c.status)}`}>
                    {c.status}
                  </span>
                </div>

                <div className="text-sm font-medium text-slate-200 mb-1">{c.issueType}</div>
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">{c.customerMessage}</p>

                {c.resolutionSummary && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs text-emerald-300 mb-3">
                    <strong className="font-semibold block mb-0.5">Resolution Summary:</strong>
                    {c.resolutionSummary}
                  </div>
                )}

                {c.requiresCustomerAction && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-xs text-amber-300 mb-3 space-y-2">
                    <div className="font-semibold flex items-center space-x-1.5 text-amber-400">
                      <span>⚠️ Your Input Required</span>
                    </div>
                    <p>The agent requires your authorization to process the recommended resolution choice.</p>
                    <div className="flex space-x-2 pt-1">
                      <button
                        onClick={() => handleGiveConsent(c.id, true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs transition-colors"
                      >
                        Confirm Choice
                      </button>
                      <button
                        onClick={() => handleGiveConsent(c.id, false)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium text-xs transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/80">
                  <span>Opened: {new Date(c.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleViewTimeline(c.id)}
                    className="text-indigo-400 hover:text-indigo-300 font-medium text-xs flex items-center space-x-1"
                  >
                    <span>View Redacted Timeline</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Timeline Inspector Panel */}
        <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 h-fit space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Customer Case Timeline</span>
          </h3>

          {!selectedCaseId ? (
            <p className="text-sm text-slate-500 italic py-6 text-center">
              Select a case to inspect its customer-safe resolution timeline.
            </p>
          ) : timelineLoading ? (
            <p className="text-sm text-slate-400 py-6 text-center">Loading timeline...</p>
          ) : (
            <div className="space-y-4 relative pl-4 border-l border-slate-800">
              {timeline.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-900" />
                  <div className="text-xs text-slate-400 flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-slate-300">{item.title}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
