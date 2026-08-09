"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { AccessibleDialog } from "@/components/accessible-dialog";
import { useBuyerState } from "@/components/buyer-state";
import { Icon } from "@/components/icon";
import {
  type InstallPlatform,
  detectInstallPlatform,
  isStandaloneDisplayMode,
  shouldShowInstallNudge,
} from "@/lib/install";

const DISMISSED_KEY = "sokoza-install-dismissed-at-v1";
const SESSION_COUNT_KEY = "sokoza-session-count-v1";
const SESSION_MARKER_KEY = "sokoza-session-counted-v1";

interface DeferredInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface SafariNavigator extends Navigator {
  standalone?: boolean;
}

interface InstallContextValue {
  availableInSettings: boolean;
  install: () => Promise<void>;
  platform: InstallPlatform;
  standalone: boolean;
}

const InstallContext = createContext<InstallContextValue | null>(null);

function readNumber(key: string) {
  const value = Number.parseInt(window.localStorage.getItem(key) ?? "", 10);
  return Number.isFinite(value) ? value : 0;
}

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cart, hydrated, recentIds, savedIds } = useBuyerState();
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredInstallPrompt | null>(null);
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [platform] = useState<InstallPlatform>(() =>
    typeof window === "undefined"
      ? "desktop"
      : detectInstallPlatform({
          maxTouchPoints: window.navigator.maxTouchPoints,
          platform: window.navigator.platform,
          userAgent: window.navigator.userAgent,
        }),
  );
  const [sessionCount, setSessionCount] = useState(0);
  const [standalone, setStandalone] = useState(() =>
    typeof window === "undefined"
      ? false
      : isStandaloneDisplayMode({
          mediaMatches: window.matchMedia("(display-mode: standalone)").matches,
          navigatorStandalone: (window.navigator as SafariNavigator).standalone,
        }),
  );
  const [ready, setReady] = useState(false);
  const [evaluationTime] = useState(() => Date.now());

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const updateStandalone = () =>
      setStandalone(
        isStandaloneDisplayMode({
          mediaMatches: media.matches,
          navigatorStandalone: (window.navigator as SafariNavigator).standalone,
        }),
      );
    let storedDismissal: number | null = null;
    let count = 1;
    try {
      const dismissalValue = readNumber(DISMISSED_KEY);
      storedDismissal = dismissalValue || null;
      count = readNumber(SESSION_COUNT_KEY);
      if (!window.sessionStorage.getItem(SESSION_MARKER_KEY)) {
        count += 1;
        window.localStorage.setItem(SESSION_COUNT_KEY, String(count));
        window.sessionStorage.setItem(SESSION_MARKER_KEY, "true");
      }
    } catch {}

    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as DeferredInstallPrompt);
    };
    const installed = () => {
      setStandalone(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", installed);
    media.addEventListener?.("change", updateStandalone);
    queueMicrotask(() => {
      setDismissedAt(storedDismissal);
      setSessionCount(count);
      updateStandalone();
      setReady(true);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", installed);
      media.removeEventListener?.("change", updateStandalone);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const register = () => {
      void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  const dismiss = useCallback(() => {
    const now = Date.now();
    setDismissedAt(now);
    try {
      window.localStorage.setItem(DISMISSED_KEY, String(now));
    } catch {
      // The current session still respects dismissal when storage is unavailable.
    }
  }, []);

  const install = useCallback(async () => {
    if (standalone) return;
    if (platform === "ios") {
      setInstructionsOpen(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (choice.outcome === "dismissed") dismiss();
  }, [deferredPrompt, dismiss, platform, standalone]);

  const availableInSettings =
    ready && !standalone && (platform === "ios" || deferredPrompt !== null);
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const showNudge =
    ready &&
    hydrated &&
    shouldShowInstallNudge({
      cartCount,
      dismissedAt,
      installPromptAvailable: deferredPrompt !== null,
      now: evaluationTime,
      pathname,
      platform,
      recentCount: recentIds.length,
      savedCount: savedIds.length,
      sessionCount,
      standalone,
    });
  const value = useMemo(
    () => ({ availableInSettings, install, platform, standalone }),
    [availableInSettings, install, platform, standalone],
  );

  return (
    <InstallContext.Provider value={value}>
      {children}
      {showNudge ? (
        <aside aria-label="Install SOKOZA" className="install-nudge">
          <button aria-label="Dismiss install suggestion" className="install-nudge-close" onClick={dismiss} type="button">
            <Icon name="close" size={18} />
          </button>
          <span className="install-nudge-icon"><Icon name="home" size={22} /></span>
          <div>
            <strong>Add SOKOZA to your Home Screen</strong>
            <p>Open local fashion faster, with its own app window.</p>
            <button className="text-link" onClick={() => void install()} type="button">
              {platform === "ios" ? "Show me how" : "Install SOKOZA"}
            </button>
          </div>
        </aside>
      ) : null}
      {instructionsOpen ? (
        <AccessibleDialog labelledBy="ios-install-title" onClose={() => setInstructionsOpen(false)}>
          <div className="sheet-heading">
            <div>
              <p className="eyebrow">iPhone and iPad</p>
              <h2 id="ios-install-title">Add SOKOZA to your Home Screen</h2>
            </div>
            <button aria-label="Close install instructions" className="icon-button" onClick={() => setInstructionsOpen(false)} type="button">
              <Icon name="close" />
            </button>
          </div>
          <ol className="install-steps">
            <li><Icon name="share" size={20} /><span>Tap <strong>Share</strong> in Safari.</span></li>
            <li><Icon name="plus" size={20} /><span>Choose <strong>Add to Home Screen</strong>.</span></li>
            <li><Icon name="tick" size={20} /><span>Confirm by tapping <strong>Add</strong>.</span></li>
          </ol>
          <p className="field-help">This creates a website shortcut. SOKOZA never asks you to download an APK.</p>
          <button className="button primary full" onClick={() => setInstructionsOpen(false)} type="button">Got it</button>
        </AccessibleDialog>
      ) : null}
    </InstallContext.Provider>
  );
}

export function useInstallExperience() {
  const context = useContext(InstallContext);
  if (!context) throw new Error("useInstallExperience must be used inside InstallProvider");
  return context;
}
