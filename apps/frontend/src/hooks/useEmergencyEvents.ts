import { useEffect } from 'react';
import type { EmergencyLogEntry, EmergencyStatus } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

interface EmergencyEventHandlers {
  onStatus?: (status: EmergencyStatus) => void;
  onLog?: (entry: EmergencyLogEntry) => void;
  onLogBatch?: (entries: EmergencyLogEntry[]) => void;
  onError?: (error: unknown) => void;
}

export const useEmergencyEvents = (account?: string, handlers: EmergencyEventHandlers = {}) => {
  const { onStatus, onLog, onLogBatch, onError } = handlers;

  useEffect(() => {
    const normalized = account?.trim().toLowerCase();
    if (normalized == null || normalized.length === 0) {
      return;
    }

    const url = apiClient.getEmergencyStreamUrl(normalized);
    const source = new EventSource(url);

    const safeParse = <T,>(data: string): T | null => {
      try {
        return JSON.parse(data) as T;
      } catch (error) {
        onError?.(error);
        return null;
      }
    };

    const handleStatus = (event: MessageEvent) => {
      const payload = safeParse<EmergencyStatus>(event.data);
      if (payload != null) {
        onStatus?.(payload);
      }
    };

    const handleLog = (event: MessageEvent) => {
      const payload = safeParse<EmergencyLogEntry>(event.data);
      if (payload != null) {
        onLog?.(payload);
      }
    };

    const handleLogBatch = (event: MessageEvent) => {
      const payload = safeParse<EmergencyLogEntry[]>(event.data);
      if (payload != null) {
        onLogBatch?.(payload);
      }
    };

    const handleError = (event: Event) => {
      onError?.(event);
    };

    source.addEventListener('status', handleStatus);
    source.addEventListener('log', handleLog);
    source.addEventListener('log-batch', handleLogBatch);
    source.addEventListener('error', handleError);

    return () => {
      source.removeEventListener('status', handleStatus);
      source.removeEventListener('log', handleLog);
      source.removeEventListener('log-batch', handleLogBatch);
      source.removeEventListener('error', handleError);
      source.close();
    };
  }, [account, onStatus, onLog, onLogBatch, onError]);
};
