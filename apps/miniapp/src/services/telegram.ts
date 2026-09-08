export interface TelegramWebApp {
  initData: string;
  ready(): void;
  expand(): void;
  openTelegramLink(url: string): void;
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export function getTelegramWebApp(): TelegramWebApp | undefined {
  return window.Telegram?.WebApp;
}

export function getInitData(): string {
  return getTelegramWebApp()?.initData ?? "";
}

export function initTelegramWebApp(): void {
  const webApp = getTelegramWebApp();
  webApp?.ready();
  webApp?.expand();
}

export function shareInvitationLink(url: string, text: string): void {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.openTelegramLink(shareUrl);
  } else {
    window.open(shareUrl, "_blank");
  }
}
