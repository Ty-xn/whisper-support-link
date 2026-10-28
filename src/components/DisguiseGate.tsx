import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { ConverterDisguise } from "@/components/ConverterDisguise";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { startJudgeDemo } from "@/lib/judge-demo.functions";
import { hashPin, readLockConfig, readSession, writeSession, quickExit, INACTIVITY_EXIT_MS, type LockConfig } from "@/lib/safety";

// Demo unlock code used when the person has not set their own codes.
const DEMO_UNLOCK = "1234";

export function DisguiseGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<LockConfig | null>(null);
  const [state, setState] = useState<"open" | "locked">("locked");
  const [passBusy, setPassBusy] = useState(false);
  const [passError, setPassError] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const demoLogin = useServerFn(startJudgeDemo);

  useEffect(() => {
    setConfig(readLockConfig());
    setState(readSession() === "open" ? "open" : "locked");
    setReady(true);
    const onUpdate = () => {
      setConfig(readLockConfig());
      if (readSession() === "open") setState("open");
    };
    window.addEventListener("safepath:lock-updated", onUpdate);
    return () => window.removeEventListener("safepath:lock-updated", onUpdate);
  }, []);

  // False footprint: the tab title always reads as a plain calculator,
  // so the browser tab, history list and mobile app switcher show nothing revealing.
  useEffect(() => {
    const NEUTRAL = "Calculator";
    const apply = () => { if (document.title !== NEUTRAL) document.title = NEUTRAL; };
    apply();
    const obs = new MutationObserver(apply);
    obs.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  }, []);

  // Leave after two minutes; recheck elapsed time when a suspended tab resumes.
  useEffect(() => {
    if (state !== "open") return;
    let lastActivity = Date.now();
    let exiting = false;
    let timer = window.setTimeout(check, INACTIVITY_EXIT_MS);
    let exitTimer: number | undefined;
    function lock() {
      if (exiting) return;
      exiting = true;
      window.sessionStorage.removeItem("safepath.session");
      queryClient.clear();
      setState("locked");
      // Navigation must not be held up by a slow or failed sign-out request.
      exitTimer = window.setTimeout(quickExit, 750);
      void supabase.auth.signOut({ scope: "local" }).then(quickExit, quickExit);
    }
    function check() {
      window.clearTimeout(timer);
      const remaining = INACTIVITY_EXIT_MS - (Date.now() - lastActivity);
      if (remaining <= 0) lock();
      else timer = window.setTimeout(check, remaining);
    }
    const reset = () => {
      if (exiting) return;
      if (Date.now() - lastActivity >= INACTIVITY_EXIT_MS) { lock(); return; }
      lastActivity = Date.now();
      window.clearTimeout(timer);
      timer = window.setTimeout(check, INACTIVITY_EXIT_MS);
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart", "mousemove"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    document.addEventListener("visibilitychange", check);
    window.addEventListener("pageshow", check);
    return () => {
      window.clearTimeout(timer);
      // An exit already triggered must continue even after locking unmounts this effect.
      if (!exiting && exitTimer !== undefined) window.clearTimeout(exitTimer);
      events.forEach((e) => window.removeEventListener(e, reset));
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("pageshow", check);
    };
  }, [state, queryClient]);

  const handleCode = useCallback(
    async (code: string) => {
      if (!config) {
        if (code === DEMO_UNLOCK) {
          writeSession("open");
          setState("open");
        }
        return;
      }
      const hash = await hashPin(code);
      if (hash === config.unlockHash) {
        writeSession("open");
        setState("open");
      } else if (hash === config.duressHash) {
        writeSession("duress");
      }
    },
    [config],
  );

  const fastPass = async () => {
    setPassError("");
    setPassBusy(true);
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      const tokens = await demoLogin();
      const { error } = await supabase.auth.setSession(tokens);
      if (error) throw error;
      writeSession("open");
      setState("open");
      await navigate({ to: "/journal", replace: true });
    } catch {
      setPassError("Fast Pass could not start. Type 1234= to unlock instead.");
    } finally {
      setPassBusy(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background" aria-hidden="true">
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (state === "locked") {
    return (
      <div>
        {!config && (
          <aside className="border-b border-border bg-muted px-4 py-3">
            <div className="mx-auto max-w-[400px]">
              <p className="text-[13px] leading-relaxed text-foreground">
                <strong>FNB Hackathon Demo Mode:</strong> SafePath is disguised as a utility. Type 1234= on the keypad
                to unlock, or click the Fast Pass button.
              </p>
              <Button className="mt-2 w-full" onClick={fastPass} disabled={passBusy}>
                {passBusy ? "Opening demo…" : "Judge Fast Pass"}
              </Button>
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                Opens a shared demo account with fictional records only.
              </p>
              {passError && <p role="alert" className="mt-1 text-[12px] text-clay">{passError}</p>}
            </div>
          </aside>
        )}
        <ConverterDisguise onSubmitCode={handleCode} />
      </div>
    );
  }

  return <>{children}</>;
}
