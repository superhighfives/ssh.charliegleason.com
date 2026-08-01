import { afterEach, describe, expect, mock, test } from "bun:test";
import { sendContactEmail, validateContactMessage } from "./contact-email";

const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;
const originalEnv = { ...process.env };

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
  process.env = { ...originalEnv };
});

describe("validateContactMessage", () => {
  test("trims valid contact details", () => {
    expect(
      validateContactMessage({
        email: " ada@example.com ",
        message: "  Hello from the terminal.  ",
      }),
    ).toEqual({
      email: "ada@example.com",
      message: "Hello from the terminal.",
    });
  });

  test("rejects invalid fields", () => {
    expect(() =>
      validateContactMessage({ email: "nope", message: "Hi" }),
    ).toThrow("email");
    expect(() =>
      validateContactMessage({
        email: "ada@example.com",
        message: "",
      }),
    ).toThrow("message");
  });
});

describe("sendContactEmail", () => {
  test("sends fixed addresses through Cloudflare Email Service", async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = "account-id";
    process.env.CLOUDFLARE_EMAIL_API_TOKEN = "token";
    process.env.CONTACT_EMAIL_TO = "charlie@example.com";
    process.env.CONTACT_EMAIL_FROM = "contact@example.com";
    const fetchMock = Object.assign(
      mock(async (_input: string | URL | Request, _init?: RequestInit) =>
        Response.json({ result: { delivered: ["charlie@example.com"], queued: [] } }),
      ),
      { preconnect: originalFetch.preconnect },
    );
    globalThis.fetch = fetchMock;

    await sendContactEmail(
      { email: "ada@example.com", message: "Hello" },
      "test-success",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0] ?? [];
    const payload = JSON.parse(String(options?.body));
    expect(payload).toMatchObject({
      to: "charlie@example.com",
      from: "contact@example.com",
      reply_to: "ada@example.com",
      subject: "SSH contact form message",
    });
    expect(payload.text).not.toContain("Name:");
  });

  test("rejects a response that Cloudflare did not accept", async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = "account-id";
    process.env.CLOUDFLARE_EMAIL_API_TOKEN = "token";
    process.env.CONTACT_EMAIL_TO = "charlie@example.com";
    process.env.CONTACT_EMAIL_FROM = "contact@example.com";
    globalThis.fetch = Object.assign(
      mock(async (_input: string | URL | Request, _init?: RequestInit) =>
        Response.json({ result: { delivered: [], queued: [], permanent_bounces: ["charlie@example.com"] } }),
      ),
      { preconnect: originalFetch.preconnect },
    );
    console.error = mock(() => {});

    await expect(
      sendContactEmail(
        { email: "ada@example.com", message: "Hello" },
        "test-bounce",
      ),
    ).rejects.toThrow("couldn't send");
  });
});
