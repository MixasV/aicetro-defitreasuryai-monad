import { useEffect } from 'react';
import { useSWRConfig } from 'swr';
import type { AlertEvent, PortfolioProjection, PortfolioSnapshot, RiskInsights } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

interface SnapshotEventPayload {
  account: string;
  snapshot: PortfolioSnapshot;
}

interface AlertsEventPayload {
  account: string;
  alerts: AlertEvent[];
}

interface RiskEventPayload {
  account: string;
  insights: RiskInsights;
}

interface ProjectionEventPayload {
  account: string;
  projection: PortfolioProjection;
}

interface UseMonitoringEventsOptions {
  enabled?: boolean;
  onError?: (error: unknown) => void;
}

export const useMonitoringEvents = (account?: string, options: UseMonitoringEventsOptions = {}) => {
  const { mutate } = useSWRConfig();
  const { enabled = true, onError } = options;

  useEffect(() => {
    const rawAccount = account?.trim();
    if (!enabled || rawAccount == null || rawAccount.length === 0) {
      return;
    }

    const normalized = rawAccount.toLowerCase();
    const source = new EventSource(apiClient.getMonitoringStreamUrl(normalized));

    const safeParse = <T,>(data: string): T | null => {
      try {
        return JSON.parse(data) as T;
      } catch (error) {
        onError?.(error);
        return null;
      }
    };

    const applySnapshot = (payload: SnapshotEventPayload) => {
      if (payload.account === normalized) {
        void mutate(['portfolio', rawAccount], payload.snapshot, false);
      }
    };

    const applyAlerts = (payload: AlertsEventPayload) => {
      if (payload.account === normalized) {
        void mutate(['alerts', rawAccount], payload.alerts, false);
      }
    };

    const applyRisk = (payload: RiskEventPayload) => {
      if (payload.account === normalized) {
        void mutate(['risk-insights', normalized], payload.insights, false);
      }
    };

    const applyProjection = (payload: ProjectionEventPayload) => {
      if (payload.account === normalized) {
        void mutate(['portfolio-projection', rawAccount], payload.projection, false);
      }
    };

    const handleSnapshot = (event: MessageEvent) => {
      const payload = safeParse<SnapshotEventPayload>(event.data);
      if (payload != null) {
        applySnapshot(payload);
      }
    };

    const handleAlerts = (event: MessageEvent) => {
      const payload = safeParse<AlertsEventPayload>(event.data);
      if (payload != null) {
        applyAlerts(payload);
      }
    };

    const handleRisk = (event: MessageEvent) => {
      const payload = safeParse<RiskEventPayload>(event.data);
      if (payload != null) {
        applyRisk(payload);
      }
    };

    const handleProjection = (event: MessageEvent) => {
      const payload = safeParse<ProjectionEventPayload>(event.data);
      if (payload != null) {
        applyProjection(payload);
      }
    };

    const handleSnapshotBatch = (event: MessageEvent) => {
      const payload = safeParse<SnapshotEventPayload[]>(event.data);
      if (payload != null) {
        payload.forEach(applySnapshot);
      }
    };

    const handleAlertsBatch = (event: MessageEvent) => {
      const payload = safeParse<AlertsEventPayload[]>(event.data);
      if (payload != null) {
        payload.forEach(applyAlerts);
      }
    };

    const handleRiskBatch = (event: MessageEvent) => {
      const payload = safeParse<RiskEventPayload[]>(event.data);
      if (payload != null) {
        payload.forEach(applyRisk);
      }
    };

    const handleProjectionBatch = (event: MessageEvent) => {
      const payload = safeParse<ProjectionEventPayload[]>(event.data);
      if (payload != null) {
        payload.forEach(applyProjection);
      }
    };

    const handleError = (event: Event) => {
      onError?.(event);
    };

    source.addEventListener('snapshot', handleSnapshot);
    source.addEventListener('alerts', handleAlerts);
    source.addEventListener('risk', handleRisk);
    source.addEventListener('projection', handleProjection);
    source.addEventListener('snapshot-batch', handleSnapshotBatch);
    source.addEventListener('alerts-batch', handleAlertsBatch);
    source.addEventListener('risk-batch', handleRiskBatch);
    source.addEventListener('projection-batch', handleProjectionBatch);
    source.addEventListener('error', handleError);

    return () => {
      source.removeEventListener('snapshot', handleSnapshot);
      source.removeEventListener('alerts', handleAlerts);
      source.removeEventListener('risk', handleRisk);
      source.removeEventListener('projection', handleProjection);
      source.removeEventListener('snapshot-batch', handleSnapshotBatch);
      source.removeEventListener('alerts-batch', handleAlertsBatch);
      source.removeEventListener('risk-batch', handleRiskBatch);
      source.removeEventListener('projection-batch', handleProjectionBatch);
      source.removeEventListener('error', handleError);
      source.close();
    };
  }, [account, enabled, mutate, onError]);
};
