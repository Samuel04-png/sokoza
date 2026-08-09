export type InstallPlatform = "ios" | "android" | "desktop";

export const INSTALL_DISMISSAL_DAYS = 21;
export const INSTALL_DISMISSAL_MS = INSTALL_DISMISSAL_DAYS * 24 * 60 * 60 * 1000;

export interface InstallNudgeInput {
  cartCount: number;
  dismissedAt: number | null;
  installPromptAvailable: boolean;
  now: number;
  pathname: string;
  platform: InstallPlatform;
  recentCount: number;
  savedCount: number;
  sessionCount: number;
  standalone: boolean;
}

export function detectInstallPlatform({
  maxTouchPoints = 0,
  platform = "",
  userAgent,
}: {
  maxTouchPoints?: number;
  platform?: string;
  userAgent: string;
}): InstallPlatform {
  const iosDevice = /iPad|iPhone|iPod/i.test(userAgent);
  const ipadDesktopMode = platform === "MacIntel" && maxTouchPoints > 1;
  if (iosDevice || ipadDesktopMode) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "desktop";
}

export function installDismissalIsActive(
  dismissedAt: number | null,
  now = Date.now(),
) {
  return dismissedAt !== null && now - dismissedAt < INSTALL_DISMISSAL_MS;
}

export function isStandaloneDisplayMode({
  mediaMatches,
  navigatorStandalone,
}: {
  mediaMatches: boolean;
  navigatorStandalone?: boolean;
}) {
  return mediaMatches || navigatorStandalone === true;
}

export function shouldShowInstallNudge(input: InstallNudgeInput) {
  if (input.standalone) return false;
  if (installDismissalIsActive(input.dismissedAt, input.now)) return false;
  if (input.pathname.startsWith("/order-review")) return false;
  if (input.pathname.startsWith("/products/") || input.pathname === "/cart") return false;

  const platformCanAct = input.platform === "ios" || input.installPromptAvailable;
  if (!platformCanAct) return false;

  const returningBuyer = input.sessionCount >= 2;
  const meaningfullyEngaged =
    input.recentCount >= 3 || input.savedCount >= 2 || input.cartCount > 0;
  return returningBuyer || meaningfullyEngaged;
}
