import { createServerFn } from "@tanstack/react-start";
import { JUDGE_DEMO_EMAIL, isJudgeDemoUser } from "./judge-demo";

// Public demo bootstrap: no caller-controlled email or user ID is accepted.
// The only session this endpoint can issue belongs to the fictional judge account.
export const startJudgeDemo = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: JUDGE_DEMO_EMAIL,
  });
  if (error || !isJudgeDemoUser(data.user) || !data.properties?.hashed_token) {
    throw new Error("Judge demo login is unavailable. Please try again shortly.");
  }
  // Exchange only the fixed account's one-time token using normal Auth.
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Judge demo login is unavailable.");
  const auth = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data: verified, error: verifyError } = await auth.auth.verifyOtp({
    type: "magiclink", token_hash: data.properties.hashed_token,
  });
  if (verifyError || !verified.session || !isJudgeDemoUser(verified.user)) {
    throw new Error("Judge demo login is unavailable. Please try again shortly.");
  }
  return { access_token: verified.session.access_token, refresh_token: verified.session.refresh_token };
});