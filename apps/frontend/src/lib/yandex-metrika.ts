/**
 * Yandex.Metrika Helper Functions
 * 
 * Provides type-safe wrappers for Yandex.Metrika API
 */

const METRIKA_ID = 104604562;

/**
 * Track page view
 * @param url - URL to track
 */
export function trackPageView(url: string): void {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRIKA_ID, 'hit', url);
  }
}

/**
 * Track goal (conversion)
 * @param goal - Goal name
 * @param params - Additional parameters
 */
export function trackGoal(goal: string, params?: Record<string, any>): void {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRIKA_ID, 'reachGoal', goal, params);
  }
}

/**
 * Track user parameters
 * @param params - User parameters
 */
export function trackUserParams(params: Record<string, any>): void {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRIKA_ID, 'userParams', params);
  }
}

/**
 * Get Yandex.Metrika Client ID
 * @param callback - Callback with client ID
 */
export function getClientID(callback: (clientID: string) => void): void {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRIKA_ID, 'getClientID', callback);
  }
}

/**
 * Track external link click
 * @param url - External URL
 */
export function trackExternalLink(url: string): void {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRIKA_ID, 'extLink', url);
  }
}

/**
 * Track file download
 * @param url - File URL
 */
export function trackFileDownload(url: string): void {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRIKA_ID, 'file', url);
  }
}

/**
 * Mark visit as not bounce
 */
export function notBounce(): void {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRIKA_ID, 'notBounce');
  }
}

// Predefined goals for AIcetro
export const GOALS = {
  // Onboarding
  WALLET_CONNECTED: 'wallet_connected',
  MODE_SELECTED: 'mode_selected',
  SIMPLE_SETUP_STARTED: 'simple_setup_started',
  CORPORATE_SETUP_STARTED: 'corporate_setup_started',
  
  // Delegation
  DELEGATION_CREATED: 'delegation_created',
  DELEGATION_REVOKED: 'delegation_revoked',
  
  // Dashboard
  DASHBOARD_VIEWED: 'dashboard_viewed',
  TRANSACTION_EXECUTED: 'transaction_executed',
  
  // Documentation
  DOCS_VIEWED: 'docs_viewed',
  FAQ_VIEWED: 'faq_viewed',
  
  // Social
  TWITTER_CLICKED: 'twitter_clicked',
  GITHUB_CLICKED: 'github_clicked',
  CREATOR_CLICKED: 'creator_clicked',
} as const;

/**
 * Example usage:
 * 
 * ```tsx
 * import { trackGoal, GOALS } from '@/lib/yandex-metrika';
 * 
 * // Track wallet connection
 * trackGoal(GOALS.WALLET_CONNECTED, {
 *   walletType: 'MetaMask',
 *   network: 'monad-testnet'
 * });
 * ```
 */
