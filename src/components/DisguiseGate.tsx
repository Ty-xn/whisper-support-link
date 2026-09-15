import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ConverterDisguise } from "@/components/ConverterDisguise";
import { hashPin, readLockConfig, readSession, writeSession, type LockConfig } from "@/lib/safety";

export function DisguiseGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<LockConfig | null>(null);
  const [state, setState] = useState<"open" | "locked">("locked");

  useEffect(() => {
    const cfg = readLockConfig();
    setConfig(cfg);
    const session = readSession();
    setState(!cfg || session === "open" ? "open" : "locked");
    setReady(true);

    const onStorage = () => {
      const next = readLockConfig();
      setConfig(next);
      if (!next) setState("open");
    };
    window.addEventListener("safepath:lock-updated", onStorage);
    return () => window.removeEventListener("safepath:lock-updated", onStorage);
  }, []);

  const handleCode = useCallback(
    async (code: string) => {
      if (!config) return;
      const hash = await hashPin(code);
      if (hash === config.unlockHash) {
        writeSession("open");
        setState("open");
      } else if (hash === config.duressHash) {
        // Distress code: stay on the calculator, silently.
        writeSession("duress");
      }
    },
    [config],
  );

  if (!ready) {
    return (
      <div className="min-h-screen bg-background" aria-hidden="true">
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (state === "locked") return <ConverterDisguise onSubmitCode={handleCode} />;

  return <>{children}</>;
}
