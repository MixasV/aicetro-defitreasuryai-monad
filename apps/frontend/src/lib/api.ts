import type {
  AIExecutionRecord,
  AIExecutionRequest,
  AIExecutionResult,
  AIExecutionSummary,
  AIPreviewRequest,
  AIPreviewResult,
  AIRecommendationRequest,
  AIRecommendationResponse,
  AIExecutionAnalytics,
  AISchedulerRunSummary,
  AISchedulerStatus,
  HealthStatus,
  AlertEvent,
  DelegationConfig,
  PortfolioSnapshot,
  PortfolioProjection,
  RiskInsights,
  EmergencyLogEntry,
  EmergencyStatus,
  EmergencyStopResponse,
  EmergencyResumeResponse,
  EmergencyControlSnapshot,
  DemoScenarioSummary,
  DemoScenarioRunResult,
  OpenRouterMetricsResponse,
  MonitoringPollerStatus,
  MonitoringPollerRunSummary,
  MonitoringPollerHistoryResponse,
  MonitoringPollerMetrics,
  MonitoringStreamStatus,
  AISimulationLogEntry,
  PreviewDataOverview,
  ApplicationModeState,
  SecurityDashboardSummary
} from '@defitreasuryai/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const apiBaseUrl = API_BASE;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...init
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return (await res.json()) as T;
}

export const apiClient = {
  getHealthStatus() {
    return (async () => {
      const res = await fetch(`${API_BASE}/health`, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });

      let payload: unknown = null;
      try {
        payload = await res.json();
      } catch (error) {
        throw new Error(`API error: ${res.status}`);
      }

      if (!res.ok && (payload == null || typeof payload !== 'object' || !('status' in payload))) {
        throw new Error(`API error: ${res.status}`);
      }

      return payload as HealthStatus;
    })();
  },
  getPortfolio(address: string) {
    return request<PortfolioSnapshot>(`/monitoring/portfolio/${address}`);
  },
  getPortfolioProjection(address: string) {
    return request<PortfolioProjection>(`/monitoring/portfolio/${address}/projection`);
  },
  getAlerts(address: string) {
    return request<AlertEvent[]>(`/monitoring/alerts/${address}`);
  },
  getRiskInsights(address: string) {
    return request<RiskInsights>(`/monitoring/risk/${address}`);
  },
  getDelegations(account: string) {
    return request<DelegationConfig[]>(`/treasury/delegations/${account}`);
  },
  getEmergencyLog(account?: string) {
    const suffix = account != null ? `/treasury/emergency-log/${account}` : '/treasury/emergency-log';
    return request<EmergencyLogEntry[]>(suffix);
  },
  getEmergencyStatus(account: string) {
    return request<EmergencyStatus>(`/treasury/emergency-status/${account}`);
  },
  getEmergencyControlSnapshot(account: string) {
    return request<EmergencyControlSnapshot>(`/treasury/emergency-control/${account}`);
  },
  getMonitoringStreamUrl(account?: string) {
    const suffix = account != null ? `/monitoring/stream/${account}` : '/monitoring/stream';
    return `${API_BASE}${suffix}`;
  },
  triggerEmergencyStop(account: string) {
    return request<EmergencyStopResponse>(`/treasury/emergency-stop/${account}`, {
      method: 'POST'
    });
  },
  resumeEmergency(account: string) {
    return request<EmergencyResumeResponse>(`/treasury/emergency-resume/${account}`, {
      method: 'POST'
    });
  },
  getEmergencyStreamUrl(account?: string) {
    const suffix = account != null ? `/treasury/emergency-stream/${account}` : '/treasury/emergency-stream';
    return `${API_BASE}${suffix}`;
  },
  getDemoSummary(account?: string) {
    const suffix = account != null ? `/demo/summary/${account}` : '/demo/summary';
    return request<DemoScenarioSummary>(suffix);
  },
  runDemoScenario() {
    return request<DemoScenarioRunResult>('/demo/run', {
      method: 'POST'
    });
  },
  createCorporateAccount(body: { owners: string[]; threshold: number }) {
    return request<{ address: string; owners: string[]; threshold: number }>(`/treasury/accounts`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  configureDelegation(body: {
    account: string;
    delegate: string;
    dailyLimitUsd: number;
    whitelist: string[];
    maxRiskScore: number;
  }) {
    return request<DelegationConfig>(`/treasury/delegations`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  postRecommendation(body: AIRecommendationRequest) {
    return request<AIRecommendationResponse>(`/ai/recommendations`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  previewAI(body: AIPreviewRequest) {
    return request<AIPreviewResult>(`/ai/preview`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  executeAI(body: AIExecutionRequest) {
    return request<AIExecutionResult>(`/ai/execute`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  getExecutionHistory(account: string) {
    return request<AIExecutionRecord[]>(`/ai/executions/${account}`);
  },
  getExecutionSummary(account: string) {
    return request<AIExecutionSummary>(`/ai/executions/${account}/summary`);
  },
  getExecutionAnalytics(account: string) {
    return request<AIExecutionAnalytics>(`/ai/executions/${account}/analytics`);
  },
  getSimulationHistory(account: string, limit?: number) {
    const query = typeof limit === 'number' && Number.isFinite(limit) ? `?limit=${Math.max(1, Math.floor(limit))}` : '';
    return request<AISimulationLogEntry[]>(`/ai/simulations/${account}${query}`);
  },
  getSchedulerStatus() {
    return request<AISchedulerStatus>(`/ai/scheduler/status`);
  },
  startScheduler() {
    return request<{ started: boolean; status: AISchedulerStatus }>(`/ai/scheduler/start`, {
      method: 'POST'
    });
  },
  stopScheduler() {
    return request<{ stopped: boolean; status: AISchedulerStatus }>(`/ai/scheduler/stop`, {
      method: 'POST'
    });
  },
  runSchedulerOnce() {
    return request<{ summary?: AISchedulerRunSummary | null; status: AISchedulerStatus; message?: string }>(
      `/ai/scheduler/run`,
      {
        method: 'POST'
      }
    );
  },
  getOpenRouterMetrics(limit?: number) {
    const query = typeof limit === 'number' && Number.isFinite(limit) ? `?limit=${Math.floor(Math.max(limit, 1))}` : '';
    return request<OpenRouterMetricsResponse>(`/ai/openrouter/metrics${query}`);
  },
  getMonitoringPollerStatus() {
    return request<MonitoringPollerStatus>(`/monitoring/poller/status`);
  },
  startMonitoringPoller() {
    return request<{ started: boolean; status: MonitoringPollerStatus }>(`/monitoring/poller/start`, {
      method: 'POST'
    });
  },
  stopMonitoringPoller() {
    return request<{ stopped: boolean; status: MonitoringPollerStatus }>(`/monitoring/poller/stop`, {
      method: 'POST'
    });
  },
  runMonitoringPollerOnce() {
    return request<{ summary?: MonitoringPollerRunSummary | null; status: MonitoringPollerStatus; message?: string }>(
      `/monitoring/poller/run`,
      {
        method: 'POST'
      }
    );
  },
  getMonitoringPollerHistory(limit?: number) {
    const query = typeof limit === 'number' && Number.isFinite(limit) ? `?limit=${Math.max(1, Math.floor(limit))}` : '';
    return request<MonitoringPollerHistoryResponse>(`/monitoring/poller/history${query}`);
  },
  getMonitoringPollerMetrics() {
    return request<MonitoringPollerMetrics>(`/monitoring/poller/metrics`);
  },
  getMonitoringStreamStatus() {
    return request<MonitoringStreamStatus>(`/monitoring/stream/control/status`);
  },
  startMonitoringStream() {
    return request<{ started: boolean; status: MonitoringStreamStatus }>(`/monitoring/stream/control/start`, {
      method: 'POST'
    });
  },
  stopMonitoringStream() {
    return request<{ stopped: boolean; status: MonitoringStreamStatus }>(`/monitoring/stream/control/stop`, {
      method: 'POST'
    });
  },
  getPreviewOverview() {
    return request<PreviewDataOverview>(`/preview/overview`);
  },
  getAppMode() {
    return request<ApplicationModeState>(`/mode`);
  },
  setAppMode(mode: 'real' | 'preview', actor?: string) {
    return request<ApplicationModeState>(`/mode`, {
      method: 'POST',
      body: JSON.stringify({ mode, actor })
    });
  },
  getSecurityDashboard(account: string) {
    return request<SecurityDashboardSummary>(`/treasury/security/${account}`);
  }
};
