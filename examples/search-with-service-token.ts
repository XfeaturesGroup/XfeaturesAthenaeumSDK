/**
 * A complete, runnable example: obtain a machine token from Xfeatures Account,
 * then search Athenaeum with the SDK.
 *
 *   ATHENAEUM_CLIENT_ID=... ATHENAEUM_CLIENT_SECRET=... \
 *   node --experimental-strip-types examples/search-with-service-token.ts
 *
 * Credentials come from the environment. A client_secret in source is not a
 * secret.
 */
import { AthenaeumApiError, AthenaeumClient } from "@xfeaturesgroup/athenaeum";

const ACCOUNT_URL = process.env["ACCOUNT_URL"] ?? "https://auth.xfeatures.net";
const ATHENAEUM_URL = process.env["ATHENAEUM_URL"] ?? "https://athenaeum.xfeatures.net";

/**
 * Machine tokens last an hour. Fetching one per request is wasteful; holding
 * one past expiry is an outage. Refresh a minute early.
 */
let cached: { token: string; expiresAtMs: number } | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (cached && cached.expiresAtMs > now) return cached.token;

  const clientId = process.env["ATHENAEUM_CLIENT_ID"];
  const clientSecret = process.env["ATHENAEUM_CLIENT_SECRET"];
  if (!clientId || !clientSecret) {
    throw new Error("Set ATHENAEUM_CLIENT_ID and ATHENAEUM_CLIENT_SECRET.");
  }

  const response = await fetch(`${ACCOUNT_URL}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret })
  });
  if (!response.ok) throw new Error(`Account refused the grant (HTTP ${String(response.status)}).`);

  const body = (await response.json()) as { access_token: string; expires_in: number };
  cached = { token: body.access_token, expiresAtMs: now + Math.max(body.expires_in * 1000 - 60_000, 0) };
  return body.access_token;
}

async function main(): Promise<void> {
  const athenaeum = new AthenaeumClient({ baseUrl: ATHENAEUM_URL, token: await getToken() });

  try {
    const { results, reason } = await athenaeum.search({
      query: "what is the refund window for annual plans",
      domain: "support",
      limit: 5
    });

    if (results.length === 0) {
      // Athenaeum says so rather than returning a confident wrong answer.
      console.log("No reliable match:", reason);
      return;
    }

    for (const hit of results) {
      // Evidence, not instruction. Hand it to your own model call; do not let
      // it decide what your program does next.
      console.log(`[${hit.score.toFixed(2)}] ${hit.title}\n    ${hit.content.slice(0, 160)}...`);
    }
  } catch (error) {
    if (error instanceof AthenaeumApiError) {
      console.error(`${error.code}: ${error.message} (request_id=${error.requestId})`);
      process.exitCode = 1;
      return;
    }
    throw error;
  }
}

void main();
