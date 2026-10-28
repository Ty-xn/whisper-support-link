const CONFIG_KEY = "safepath.lock";
const SESSION_KEY = "safepath.session";

export type LockConfig = {
  enabled: boolean;
  unlockHash: string;
  duressHash: string;
};

export type SessionState = "locked" | "open" | "duress";

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`safepath:${pin.trim()}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function readLockConfig(): LockConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LockConfig;
    return parsed?.enabled && parsed.unlockHash ? parsed : null;
  } catch {
    return null;
  }
}

export function writeLockConfig(config: LockConfig) {
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearLockConfig() {
  window.localStorage.removeItem(CONFIG_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function readSession(): SessionState | null {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(SESSION_KEY);
  return value === "open" || value === "duress" ? value : null;
}

export function writeSession(state: SessionState) {
  window.sessionStorage.setItem(SESSION_KEY, state);
}

/**
 * Leaves the app for a neutral page. This is a convenience, not a guarantee:
 * browser history, backups and device monitoring are outside our control.
 */
export function quickExit() {
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  window.location.replace("https://www.bbc.com/weather");
}
