/**
 * Yandex.Metrika TypeScript Definitions
 * 
 * Provides type safety for Yandex.Metrika API calls
 */

interface YandexMetrikaOptions {
  ssr?: boolean;
  webvisor?: boolean;
  clickmap?: boolean;
  trackLinks?: boolean;
  accurateTrackBounce?: boolean;
  trackHash?: boolean;
  ecommerce?: string | boolean;
  params?: Record<string, any>;
}

interface YandexMetrikaHit {
  referer?: string;
  params?: Record<string, any>;
  callback?: () => void;
  ctx?: any;
}

interface YandexMetrika {
  (
    counterId: number,
    method: 'init',
    options: YandexMetrikaOptions
  ): void;
  (
    counterId: number,
    method: 'hit',
    url: string,
    options?: YandexMetrikaHit
  ): void;
  (
    counterId: number,
    method: 'reachGoal',
    target: string,
    params?: Record<string, any>,
    callback?: () => void,
    ctx?: any
  ): void;
  (
    counterId: number,
    method: 'params',
    params: Record<string, any>
  ): void;
  (
    counterId: number,
    method: 'userParams',
    params: Record<string, any>
  ): void;
  (
    counterId: number,
    method: 'notBounce',
    options?: { callback?: () => void; ctx?: any }
  ): void;
  (
    counterId: number,
    method: 'extLink',
    url: string,
    options?: { callback?: () => void; ctx?: any; title?: string }
  ): void;
  (
    counterId: number,
    method: 'file',
    url: string,
    options?: { callback?: () => void; ctx?: any; title?: string }
  ): void;
  (
    counterId: number,
    method: 'getClientID',
    callback: (clientID: string) => void
  ): void;
  (
    counterId: number,
    method: 'setUserID',
    userId: string
  ): void;
  (
    counterId: number,
    method: string,
    ...args: any[]
  ): void;
}

declare global {
  interface Window {
    ym: YandexMetrika;
    Ya?: {
      Metrika2?: any;
    };
  }
}

export {};
