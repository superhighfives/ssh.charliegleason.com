export type ContactMessage = {
  email: string;
  message: string;
};

const RATE_LIMIT_WINDOW_MS = 15 * 60_000;
const RATE_LIMIT_MAX = 3;
const GLOBAL_RATE_LIMIT_MAX = 30;
const MAX_RATE_LIMIT_ENTRIES = 10_000;
const attempts = new Map<string, { count: number; resetAt: number }>();
let globalAttempts = { count: 0, resetAt: 0 };

export function isValidEmail(email: string): boolean {
  const value = email.trim();
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateContactMessage(input: ContactMessage): ContactMessage {
  const message = {
    email: input.email.trim(),
    message: input.message.trim(),
  };

  if (!isValidEmail(message.email)) {
    throw new Error("Please enter a valid email address.");
  }
  if (!message.message || message.message.length > 4_000) {
    throw new Error("Please enter a message (4,000 characters max).");
  }

  return message;
}

function checkRateLimit(source: string) {
  const now = Date.now();

  for (const [key, value] of attempts) {
    if (value.resetAt <= now) attempts.delete(key);
  }
  if (attempts.size >= MAX_RATE_LIMIT_ENTRIES && !attempts.has(source)) {
    throw new Error("The contact form is busy. Please try again later.");
  }

  if (globalAttempts.resetAt <= now) {
    globalAttempts = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  if (globalAttempts.count >= GLOBAL_RATE_LIMIT_MAX) {
    throw new Error("The contact form is busy. Please try again later.");
  }

  const entry = attempts.get(source);
  if (!entry || entry.resetAt <= now) {
    attempts.set(source, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else if (entry.count >= RATE_LIMIT_MAX) {
    throw new Error("Too many messages. Please try again in a little while.");
  } else {
    entry.count += 1;
  }
  globalAttempts.count += 1;
}

export async function sendContactEmail(
  input: ContactMessage,
  source: string,
): Promise<void> {
  const message = validateContactMessage(input);

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_EMAIL_API_TOKEN;
  const to = process.env.CONTACT_EMAIL_TO;
  const from = process.env.CONTACT_EMAIL_FROM;
  if (!accountId || !apiToken || !to || !from) {
    throw new Error("The contact form isn't configured yet.");
  }
  checkRateLimit(source);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        to,
        from,
        reply_to: message.email,
        subject: "SSH contact form message",
        text: [
          `Email: ${message.email}`,
          `Source: ${source}`,
          "",
          message.message,
        ].join("\n"),
      }),
    },
  );

  const body = await response.json().catch(() => null) as {
    success?: boolean;
    result?: { permanent_bounces?: string[] };
  } | null;
  if (!response.ok || body === null || body?.success === false) {
    console.error("[contact] Cloudflare Email Service failed", {
      status: response.status,
      body,
    });
    throw new Error("I couldn't send that right now. Please try again.");
  }
  if (body?.result?.permanent_bounces?.length) {
    console.error("[contact] Cloudflare Email Service bounced the message", body);
    throw new Error("I couldn't send that right now. Please try again.");
  }
}
