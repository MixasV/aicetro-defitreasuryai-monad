export interface DelegationLimit {
  protocol: string;
  dailyLimitUsd: number;
  riskScore: number;
}

export interface AIStrategy {
  id: string;
  name: string;
  description: string;
  targetApy: number;
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  whitelistedProtocols: string[];
}

export interface PortfolioMetricPoint {
  timestamp: string;
  netAssetValue: number;
  projectedYield: number;
}

export interface PortfolioProjection {
  baseValueUsd: number;
  netApy: number;
  horizons: number[];
  points: PortfolioMetricPoint[];
  generatedAt: string;
}

export interface AlertEvent {
  id: string;
  title: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
  createdAt: string;
}

export interface DelegationConfig {
  delegate: string;
  dailyLimit: string;
  spent24h: string;
  allowedProtocols: string[];
  maxRiskScore: number;
  updatedAt: string;
  remainingDailyLimit?: string;
  validUntil?: string;
  active?: boolean;
  
  // Hybrid AI execution
  autoExecutionEnabled?: boolean;
  portfolioPercentage?: number;
  autoExecutedUsd?: number;
  lastAutoExecutionAt?: string;
}

export interface PortfolioPosition {
  protocol: string;
  asset: string;
  amount: number;
  valueUSD: number;
  currentAPY: number;
  riskScore: number;
}

export interface PortfolioSnapshot {
  positions: PortfolioPosition[];
  totalValueUSD: number;
  netAPY: number;
}

export interface AIRecommendationConstraints {
  dailyLimitUsd: number;
  remainingDailyLimitUsd: number;
  maxRiskScore: number;
  whitelist: string[];
  allowedTokens?: string[]; // Tokens user allowed AI to use as initial source
  notes?: string;
  // ✅ CRITICAL FIX: AI must know its actual budget (portfolioPercentage)
  portfolioPercentage?: number;     // % of portfolio delegated to AI (e.g. 25 = AI can use 25%)
  autoAllowance?: number;            // Total USD AI can manage (portfolio * percentage)
  remainingAllowance?: number;       // Remaining after previous executions
}

export interface AIRecommendationContext {
  account: string;
  delegate: string;
  chainId: number;
  scenario?: string;
}

export interface AIRecommendationRequest {
  portfolio: PortfolioSnapshot;
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  protocols: string[];
  constraints: AIRecommendationConstraints;
  context?: AIRecommendationContext;
  evaluationGoals?: string[];
  protocolMetrics?: MonadProtocolMetrics;
}

export interface AllocationRecommendation {
  protocol: string;
  allocationPercent: number;
  expectedAPY: number;
  rationale: string;
  riskScore: number;
  amountUsd?: number;
  reasoning?: string;
}

export interface AIRecommendationEvaluation {
  confidence: number;
  riskScore: number;
  warnings: string[];
  notes?: string;
  simulatedUsd?: number;
}

export interface AIRecommendationResponse {
  summary: string;
  analysis: string;
  allocations: AllocationRecommendation[];
  rejectedAllocations?: AllocationRecommendation[]; // Non-whitelisted protocols removed by post-processing
  suggestedActions: string[];
  generatedAt: string;
  evaluation?: AIRecommendationEvaluation;
  governanceSummary?: string;
  model?: string;
  provider?: string;
}

export type OpenRouterCallStatus = 'success' | 'error' | 'skipped';

export interface OpenRouterCallMetric {
  id: string;
  model: string;
  provider?: string;
  endpoint?: string;
  status: OpenRouterCallStatus;
  latencyMs: number;
  retries: number;
  createdAt: string;
  fallbackUsed: boolean;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  rateLimitRemaining?: number;
  rateLimitResetMs?: number;
  errorMessage?: string;
}

export interface OpenRouterMetricsSummary {
  totalCalls: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  averageLatencyMs?: number;
  lastCallAt?: string;
  lastSuccessAt?: string;
  lastErrorAt?: string;
}

export interface OpenRouterMetricsResponse {
  summary: OpenRouterMetricsSummary;
  metrics: OpenRouterCallMetric[];
}

export interface AIExecutionRequest {
  account: string;
  delegate?: string;
  riskTolerance?: 'conservative' | 'balanced' | 'aggressive';
  protocols?: string[];
}

export interface AIExecutionAction {
  protocol: string;
  allocationPercent: number;
  amountUsd: number;
  expectedAPY: number;
  riskScore: number;
  status: 'executed' | 'skipped' | 'deferred';
  reason?: string;
  protocolId?: string;
  protocolAddress?: string;
  callData?: string;
  transactionHash?: string;
  simulationUsd?: number;
}

export interface AIExecutionTransaction {
  protocolId: string;
  protocolAddress: string;
  callData: string;
  amountUsd: number;
  submittedAt: string;
  status: 'pending' | 'executed' | 'failed';
  transactionHash?: string;
  failureReason?: string;
}

export interface AIExecutionResult {
  account: string;
  delegate: string;
  generatedAt: string;
  summary: string;
  totalExecutedUsd: number;
  remainingDailyLimitUsd: number;
  actions: AIExecutionAction[];
  analysis?: string;
  suggestedActions?: string[];
  evaluation?: AIRecommendationEvaluation;
  governanceSummary?: string;
  warnings?: string[];
  model?: string;
  provider?: string;
  transactions?: AIExecutionTransaction[];
}

export type AIExecutionMode = 'manual' | 'auto' | 'hybrid';

export interface AIExecutionRecord extends AIExecutionResult {
  id: string;
  createdAt: string;
  
  // Enhanced tracking
  executionMode: AIExecutionMode;
  txHashes?: string[];
  profitLossUsd?: number;
  reasoning?: string;
  userApproved: boolean;
}

export interface AIExecutionLastRun {
  generatedAt: string;
  totalExecutedUsd: number;
  remainingDailyLimitUsd: number;
  summary: string;
}

export interface AIExecutionSummaryWindow {
  count: number;
  volumeUsd: number;
}

export interface AIExecutionSummary {
  account: string;
  totalExecutions: number;
  executedVolumeUsd: number;
  averageExecutedUsd: number;
  successCount: number;
  successRate: number;
  lastExecution?: AIExecutionLastRun;
  last24h: AIExecutionSummaryWindow;
}

export interface AIExecutionProtocolStat {
  protocol: string;
  executedUsd: number;
  executedCount: number;
  skippedCount: number;
  averageAPY: number;
  averageRisk: number;
}

export interface AIExecutionAnalytics {
  account: string;
  totalExecutions: number;
  successRate: number;
  totalExecutedUsd: number;
  executedProtocols: number;
  topProtocols: AIExecutionProtocolStat[];
  lastExecutionAt?: string;
}

export interface AIPreviewRequest {
  account: string;
  delegate?: string;
  riskTolerance?: 'conservative' | 'balanced' | 'aggressive';
  protocols?: string[];
}

export interface AIPreviewResult {
  account: string;
  delegate: string;
  generatedAt: string;
  summary: string;
  totalExecutableUsd: number;
  remainingDailyLimitUsd: number;
  actions: AIExecutionAction[];
  delegation: {
    dailyLimitUsd: number;
    spent24hUsd: number;
    whitelist: string[];
    maxRiskScore: number;
  };
  analysis?: string;
  evaluation?: AIRecommendationEvaluation;
  suggestedActions?: string[];
  governanceSummary?: string;
  warnings?: string[];
  model?: string;
  provider?: string;
}

export interface AISimulationLogEntry {
  id: string;
  account: string;
  delegate: string;
  summary: string;
  totalExecutableUsd: number;
  remainingDailyLimitUsd: number;
  actions: AIExecutionAction[];
  analysis?: string;
  evaluation?: AIRecommendationEvaluation;
  governanceSummary?: string;
  warnings?: string[];
  generatedAt: string;
  createdAt: string;
  model?: string;
  provider?: string;
}

export interface AIRecommendationLogEntry {
  id: string;
  account: string;
  delegate: string;
  model: string;
  provider?: string;
  status: OpenRouterCallStatus;
  latencyMs: number;
  fallbackUsed: boolean;
  prompt: string;
  response: string;
  createdAt: string;
  evaluation?: AIRecommendationEvaluation;
  errorMessage?: string;
}

export type AISchedulerTrigger = 'automatic' | 'manual';

export interface AISchedulerAccountResult {
  account: string;
  delegate: string;
  status: 'success' | 'error';
  executedUsd?: number;
  remainingDailyLimitUsd?: number;
  summary?: string;
  error?: string;
}

export interface AISchedulerRunSummary {
  source: AISchedulerTrigger;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  processedAccounts: number;
  successCount: number;
  errorCount: number;
  results: AISchedulerAccountResult[];
}

export interface AISchedulerStatus {
  enabled: boolean;
  running: boolean;
  intervalMs: number;
  lastRunAt?: string;
  lastDurationMs?: number;
  lastError?: string;
  lastSummary?: AISchedulerRunSummary;
}

export type MonitoringPollerTrigger = 'automatic' | 'manual';

export interface MonitoringPollerAccountResult {
  account: string;
  snapshotFetched: boolean;
  alertsFetched: boolean;
  riskCalculated: boolean;
  projectionBuilt: boolean;
  error?: string;
}

export interface MonitoringPollerRunSummary {
  source: MonitoringPollerTrigger;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  processedAccounts: number;
  successCount: number;
  errorCount: number;
  results: MonitoringPollerAccountResult[];
  protocolMetricsUpdated?: boolean;
  protocolMetricsError?: string;
}

export interface MonitoringPollerStatus {
  enabled: boolean;
  running: boolean;
  intervalMs: number;
  lastRunAt?: string;
  lastDurationMs?: number;
  lastError?: string;
  lastSummary?: MonitoringPollerRunSummary;
}

export interface MonitoringPollerHistoryResponse {
  summaries: MonitoringPollerRunSummary[];
}

export interface MonitoringPollerMetrics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  successRate: number;
  averageDurationMs: number;
  averageAccountsPerRun: number;
  lastRunAt?: string;
  lastSuccessAt?: string;
  lastErrorAt?: string;
}

export type MonadProtocolMetricsSource = 'envio' | 'mixed' | 'fallback';

export interface MonadNablaPoolMetric {
  id: string;
  address: string;
  asset: string;
  currentApy: number;
  tvlUsd: number;
  volume24hUsd: number;
  fees24hUsd: number;
  riskScore: number;
  lastUpdate: string;
  isActive: boolean;
  source?: MonadProtocolMetricsSource;
}

export interface MonadUniswapPairMetric {
  id: string;
  pairAddress: string;
  token0Symbol: string;
  token1Symbol: string;
  reserve0: number;
  reserve1: number;
  volume24hUsd: number;
  fees24hUsd: number;
  apr: number;
  lastUpdate: string;
  isActive: boolean;
  source?: MonadProtocolMetricsSource;
}

export interface MonadProtocolMetrics {
  source: MonadProtocolMetricsSource;
  fetchedAt: string;
  fallbackReason?: string;
  nablaPools: MonadNablaPoolMetric[];
  uniswapPairs: MonadUniswapPairMetric[];
}

export interface MonitoringStreamStatus {
  enabled: boolean;
  running: boolean;
  connected: boolean;
  observedAccounts: number;
  lastEventAt?: string;
  lastError?: string;
}

export type HealthIndicatorStatus = 'ok' | 'degraded' | 'critical';

export interface HealthIndicator {
  component: string;
  status: HealthIndicatorStatus;
  message?: string;
  details?: Record<string, unknown>;
}

export interface HealthStatusMetadata {
  environment: string;
  version?: string;
  schedulerEnabled: boolean;
  monitoringPollerEnabled: boolean;
  monitoringStreamEnabled: boolean;
  alertWebhookConfigured: boolean;
  alertRiskThreshold: number;
  alertUtilizationThreshold: number;
}

export interface HealthStatus {
  status: HealthIndicatorStatus;
  timestamp: string;
  uptimeSeconds: number;
  indicators: HealthIndicator[];
  metadata: HealthStatusMetadata;
}

export type RiskBandLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface RiskBandBreakdown {
  level: RiskBandLevel;
  label: string;
  minScore: number;
  maxScore: number;
  valueUSD: number;
  percentage: number;
  topPositions: Array<{
    protocol: string;
    valueUSD: number;
    riskScore: number;
  }>;
}

export interface RiskGuardrailStatus {
  maxAllowedRiskScore: number;
  highestPositionRisk: number;
  violations: string[];
}

export interface DelegationExposure {
  dailyLimitUsd: number;
  spent24hUsd: number;
  remainingDailyLimitUsd: number;
  utilization: number;
}

export interface RiskInsights {
  account: string;
  totalValueUsd: number;
  netAPY: number;
  exposure: RiskBandBreakdown[];
  guardrails: RiskGuardrailStatus;
  delegation: DelegationExposure;
  updatedAt: string;
}

export type EmergencyEventStatus = 'success' | 'error';

export interface EmergencyLogEntry {
  id: string;
  account: string;
  status: EmergencyEventStatus;
  message: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export type EmergencyState = 'active' | 'paused';

export type EmergencyStopMode = 'executed' | 'simulated' | 'skipped';

export type EmergencyActionTag = 'stop' | 'resume' | 'auto';

export interface EmergencyStatusMetadata {
  txHash?: string;
  simulated?: boolean;
  reason?: string;
  action?: EmergencyActionTag;
  mode?: EmergencyStopMode;
}

export interface EmergencyStatus {
  account: string;
  state: EmergencyState;
  updatedAt: string;
  metadata?: EmergencyStatusMetadata;
}

export interface EmergencyActionResponse {
  operation: EmergencyActionTag;
  status: EmergencyStatus;
  mode: EmergencyStopMode;
  message: string;
  completedAt: string;
  simulated: boolean;
  txHash?: string;
  reason?: string;
  logEntry?: EmergencyLogEntry;
}

export interface EmergencyStopResponse extends EmergencyActionResponse {}

export interface EmergencyResumeResponse extends EmergencyActionResponse {}

export interface EmergencyControlSnapshot {
  account: string;
  status: EmergencyStatus;
  isPaused: boolean;
  updatedAt: string;
  lastAction?: EmergencyActionResponse | null;
}

export type DemoStepStatus = 'completed' | 'pending' | 'error';

export interface DemoStep {
  id: string;
  title: string;
  status: DemoStepStatus;
  description: string;
  timestamp?: string;
}

export interface DemoAccountOverview {
  address: string;
  owners: string[];
  threshold: number;
}

export interface DemoDelegationOverview {
  delegate: string;
  dailyLimitUsd: number;
  spent24hUsd: number;
  remainingDailyLimitUsd: number;
  maxRiskScore: number;
  whitelist: string[];
  updatedAt: string;
}

export interface DemoScenarioSummary {
  account: DemoAccountOverview;
  delegation: DemoDelegationOverview;
  risk: RiskInsights;
  aiSummary: AIExecutionSummary;
  portfolio: PortfolioSnapshot;
  alerts: AlertEvent[];
  projection: PortfolioProjection;
  aiHistory: AIExecutionRecord[];
  emergencyLog: EmergencyLogEntry[];
  steps: DemoStep[];
  generatedAt: string;
}

export interface DemoScenarioRunResult {
  execution: AIExecutionResult;
  summary: DemoScenarioSummary;
}

export type LaunchChecklistStatus = 'pass' | 'warn' | 'fail';

export interface LaunchChecklistItem {
  id: string;
  title: string;
  status: LaunchChecklistStatus;
  details: string;
  remediation?: string;
}

export interface LaunchChecklistStats {
  corporateAccounts: number;
  delegations: number;
  aiRecommendations: number;
  aiSimulations: number;
}

export interface LaunchChecklistReport {
  generatedAt: string;
  items: LaunchChecklistItem[];
  statusSummary: {
    pass: number;
    warn: number;
    fail: number;
  };
  stats?: LaunchChecklistStats;
}

export type ApplicationMode = 'real' | 'preview';

export interface ApplicationModeState {
  mode: ApplicationMode;
  updatedAt: string;
  lastActor?: string;
  note?: string;
}

export type PreviewProtocolCategory =
  | 'lending'
  | 'dex'
  | 'yield'
  | 'lsd'
  | 'derivatives'
  | 'stablecoin'
  | 'infrastructure'
  | 'treasury'
  | 'other';

export interface PreviewProtocolMetric {
  id: string;
  name: string;
  category: PreviewProtocolCategory;
  chain: string;
  symbol?: string;
  apy: number;
  tvlUsd: number;
  volume24hUsd?: number;
  riskScore: number;
  url?: string;
  sources?: {
    defiLlamaPoolId?: string;
    coinGeckoId?: string;
    oneInchAddress?: string;
  };
  lastUpdated: string;
  dataQuality: 'live' | 'fallback' | 'stale';
}

export interface PreviewCategorySummary {
  category: PreviewProtocolCategory;
  tvlUsd: number;
  averageApy: number;
  protocolCount: number;
}

export interface PreviewDataOverview {
  generatedAt: string;
  source: {
    defiLlama: boolean;
    coinGecko: boolean;
    oneInch: boolean;
    fallbackApplied: boolean;
  };
  protocols: PreviewProtocolMetric[];
  topOpportunities: PreviewProtocolMetric[];
  summary: {
    totalTvlUsd: number;
    averageApy: number;
    medianApy: number;
    riskWeightedYield: number;
    categories: PreviewCategorySummary[];
  };
}

export type SecurityCheckStatus = 'pass' | 'warn' | 'fail';

export interface SecurityCheckItem {
  id: string;
  title: string;
  status: SecurityCheckStatus;
  details?: string;
  remediation?: string;
}

export interface SecurityDelegationSummary {
  delegate: string;
  dailyLimitUsd: number;
  spent24hUsd: number;
  remainingDailyLimitUsd: number;
  whitelist: string[];
  maxRiskScore: number;
  updatedAt: string;
  active: boolean;
}

export interface SecurityEmergencySummary {
  state: EmergencyState;
  updatedAt: string;
  lastAction?: EmergencyActionResponse | null;
}

export interface SecurityDashboardSummary {
  account: string;
  generatedAt: string;
  mode: ApplicationMode;
  delegation?: SecurityDelegationSummary | null;
  emergency: SecurityEmergencySummary;
  trustlessGuarantees: string[];
  checks: SecurityCheckItem[];
}
