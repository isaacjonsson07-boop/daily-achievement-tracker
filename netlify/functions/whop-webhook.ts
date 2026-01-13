import { Handler } from "@netlify/functions";
import { createHmac, timingSafeEqual } from "crypto";

export const handler: Handler = async (event) => {
  // 1. Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const rawBody = event.body || "";

  // 2. READ WHOP HEADERS (LOWERCASE — THIS IS CRITICAL)
  const webhookId = event.headers["webhook-id"];
  const webhookTimestamp = event.headers["webhook-timestamp"];
  const webhookSignature = event.headers["webhook-signature"];

  console.log("[Whop Webhook] Incoming request", {
    hasBody: rawBody.length > 0,
    webhookId: !!webhookId,
    webhookTimestamp: !!webhookTimestamp,
    webhookSignature: !!webhookSignature,
    availableHeaders: Object.keys(event.headers || {}),
  });

  // 3. Ensure headers exist
  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Missing signature" }),
    };
  }

  // 4. Load secret
  const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET;
  if (!WHOP_WEBHOOK_SECRET) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Webhook secret not configured" }),
    };
  }

  // 5. Build signing string EXACTLY as Whop expects
  const signingString = `${webhookId}.${webhookTimestamp}.${rawBody}`;

  const expectedSignature = createHmac("sha256", WHOP_WEBHOOK_SECRET)
    .update(signingString)
    .digest("base64");

  // 6. Extract v1 signatures (Whop formats)
  const v1Signatures: string[] = [];
  const parts = webhookSignature.split(",").map((p) => p.trim());

  for (const part of parts) {
    if (part.startsWith("v1=")) {
      v1Signatures.push(part.slice(3));
    }
  }

  if (parts.length === 2 && parts[0] === "v1") {
    v1Signatures.push(parts[1]);
  }

  if (v1Signatures.length === 0) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Invalid signature format" }),
    };
  }

  // 7. Constant-time comparison
  const expectedBuf = Buffer.from(expectedSignature, "utf8");
  let valid = false;

  for (const sig of v1Signatures) {
    const providedBuf = Buffer.from(sig, "utf8");
    if (
      providedBuf.length === expectedBuf.length &&
      timingSafeEqual(providedBuf, expectedBuf)
    ) {
      valid = true;
      break;
    }
  }

  if (!valid) {
    console.log("[Whop Webhook] Invalid signature");
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Invalid signature" }),
    };
  }

  // 8. SUCCESS
  console.log("[Whop Webhook] Signature verified");

  const payload = JSON.parse(rawBody);
console.log("[Whop Webhook] FULL PAYLOAD:", JSON.stringify(payload));
console.log("[Whop Webhook] Event type:", payload.type || payload.event_type);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log("[Whop Webhook] Supabase env vars missing, skipping plan update");
  return { statusCode: 200, body: "ok" };
}

// Try to pull an email from common locations in the payload
const email =
  payload?.data?.user?.email ||
  payload?.data?.customer?.email ||
  payload?.data?.email ||
  payload?.user?.email ||
  payload?.customer?.email;

if (!email) {
  console.log("[Whop Webhook] No email in payload, skipping plan update");
  return { statusCode: 200, body: "ok" };
}

let plan: "free" | "paid" = "free";
if (eventType === "membership.activated" || eventType === "invoice.paid") plan = "paid";
if (eventType === "membership.deactivated" || eventType === "membership.canceled") plan = "free";

console.log("[Whop Webhook] Updating plan", { email, plan, eventType });

await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?email=eq.${encodeURIComponent(email)}`, {
  method: "PATCH",
  headers: {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify({
    plan,
    trial_ends_at: null,
    updated_at: new Date().toISOString(),
  }),
});

return { statusCode: 200, body: "ok" };
};
