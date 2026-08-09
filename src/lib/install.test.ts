import { describe, expect, it } from "vitest";
import {
  INSTALL_DISMISSAL_MS,
  detectInstallPlatform,
  installDismissalIsActive,
  isStandaloneDisplayMode,
  shouldShowInstallNudge,
} from "@/lib/install";

const baseInput = {
  cartCount: 0,
  dismissedAt: null,
  installPromptAvailable: true,
  now: 1_800_000_000_000,
  pathname: "/discover",
  platform: "android" as const,
  recentCount: 0,
  savedCount: 0,
  sessionCount: 2,
  standalone: false,
};

describe("install experience policy", () => {
  it("detects iOS including iPad desktop mode, Android, and desktop", () => {
    expect(detectInstallPlatform({ userAgent: "Mozilla/5.0 (iPhone)" })).toBe("ios");
    expect(detectInstallPlatform({ userAgent: "Mozilla/5.0", platform: "MacIntel", maxTouchPoints: 5 })).toBe("ios");
    expect(detectInstallPlatform({ userAgent: "Mozilla/5.0 (Linux; Android 15)" })).toBe("android");
    expect(detectInstallPlatform({ userAgent: "Mozilla/5.0 (Macintosh)" })).toBe("desktop");
  });

  it("offers only after return or meaningful engagement and never on high-intent routes", () => {
    expect(shouldShowInstallNudge(baseInput)).toBe(true);
    expect(shouldShowInstallNudge({ ...baseInput, sessionCount: 1 })).toBe(false);
    expect(shouldShowInstallNudge({ ...baseInput, sessionCount: 1, recentCount: 3 })).toBe(true);
    expect(shouldShowInstallNudge({ ...baseInput, pathname: "/order-review/noir" })).toBe(false);
    expect(shouldShowInstallNudge({ ...baseInput, pathname: "/products/copper-column-dress" })).toBe(false);
  });

  it("honors dismissal, native capability, iOS instructions, and installed state", () => {
    expect(installDismissalIsActive(baseInput.now - INSTALL_DISMISSAL_MS + 1, baseInput.now)).toBe(true);
    expect(shouldShowInstallNudge({ ...baseInput, dismissedAt: baseInput.now })).toBe(false);
    expect(shouldShowInstallNudge({ ...baseInput, installPromptAvailable: false })).toBe(false);
    expect(shouldShowInstallNudge({ ...baseInput, installPromptAvailable: false, platform: "ios" })).toBe(true);
    expect(shouldShowInstallNudge({ ...baseInput, standalone: true })).toBe(false);
    expect(isStandaloneDisplayMode({ mediaMatches: false, navigatorStandalone: true })).toBe(true);
  });
});
