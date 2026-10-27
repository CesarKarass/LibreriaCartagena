/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_AUTH_API_URL?: string;
  readonly VITE_API_PROXY_TARGET?: string;
  readonly VITE_AUTH_PROXY_TARGET?: string;
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  readonly VITE_USE_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Grecaptcha {
  ready(callback: () => void): void;
  render(
    element: HTMLElement,
    options: {
      sitekey: string;
      theme?: 'light' | 'dark';
      size?: 'normal' | 'compact';
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    },
  ): number;
  reset(widgetId?: number): void;
  getResponse(widgetId?: number): string;
}

interface Window {
  grecaptcha?: Grecaptcha;
}
