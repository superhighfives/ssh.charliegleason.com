import { afterEach, expect, test } from "bun:test";
import { BoxRenderable, RGBA } from "@opentui/core";
import { testRender } from "@opentui/react/test-utils";
import { act } from "react";
import { ContactForm } from "./components/ContactForm";
import { dark } from "./theme";
import { ContactView } from "./views/ContactView";

let setup: Awaited<ReturnType<typeof testRender>> | undefined;

afterEach(async () => {
  await act(async () => {
    setup?.renderer.destroy();
  });
  setup = undefined;
});

test("renders the form and contact cards as a wide grid", async () => {
  setup = await testRender(
    <ContactView
      mode="options"
      contact={[
        {
          label: "GitHub",
          url: "github.com/superhighfives",
          icon: "github",
          description: "Code and open source work.",
        },
        {
          label: "Email",
          url: "hello@example.com",
          icon: "email",
          description: "The old-fashioned option.",
        },
        {
          label: "Website",
          url: "charliegleason.com",
          icon: "website",
          description: "Main portfolio site.",
        },
      ]}
      selectedIndex={0}
      scrollRef={{ current: null }}
      onSubmit={async () => {}}
    />,
    { width: 80, height: 24 },
  );
  await setup.renderOnce();

  const frame = setup.captureCharFrame();
  expect(frame).not.toContain("Name (optional)");
  expect(frame).toContain("GitHub");
  expect(frame).toContain("Email");
  const form = setup.renderer.root.findDescendantById("contact-option-0");
  const github = setup.renderer.root.findDescendantById("contact-option-1");
  const email = setup.renderer.root.findDescendantById("contact-option-2");
  const website = setup.renderer.root.findDescendantById("contact-option-3");
  expect(form?.y).toBe(github?.y);
  expect(form?.x ?? 0).toBeLessThan(github?.x ?? 0);
  expect(form?.width ?? 80).toBeLessThanOrEqual(39);
  expect(email?.x).toBe(github?.x);
  expect(email?.y ?? 0).toBeGreaterThan(github?.y ?? 0);
  expect(website?.x).toBe(form?.x);
  expect(website?.y ?? 0).toBeGreaterThan(form?.y ?? 0);
  expect(github instanceof BoxRenderable && github.border).toBe(true);
});

test("moves the yellow border from the form to Email when editing starts", async () => {
  setup = await testRender(
    <ContactView
      mode="form"
      contact={[]}
      selectedIndex={0}
      scrollRef={{ current: null }}
      onSubmit={async () => {}}
    />,
    { width: 80, height: 24 },
  );
  await setup.renderOnce();

  const frame = setup.captureCharFrame();
  expect(frame).toContain("Editing message");
  expect(frame).not.toContain("Back (esc)");
  const form = setup.renderer.root.findDescendantById("contact-option-0");
  const email = setup.renderer.root.findDescendantById("contact-email-field");
  if (!(form instanceof BoxRenderable) || !(email instanceof BoxRenderable)) {
    throw new Error("Contact form borders were not rendered");
  }
  expect(form.borderColor.equals(RGBA.fromHex(dark.border))).toBe(true);
  expect(email.borderColor.equals(RGBA.fromHex(dark.yellow))).toBe(true);
  expect(setup.renderer.currentFocusedRenderable?.id).toBe("contact-email");
});

test("stacks the form before contact links on narrow terminals", async () => {
  setup = await testRender(
    <ContactView
      mode="options"
      contact={[
        {
          label: "GitHub",
          url: "github.com/superhighfives",
          icon: "github",
          description: "Code and open source work.",
        },
      ]}
      selectedIndex={0}
      scrollRef={{ current: null }}
      onSubmit={async () => {}}
    />,
    { width: 50, height: 24 },
  );
  await setup.renderOnce();

  const frame = setup.captureCharFrame();
  expect(frame).not.toContain("Name (optional)");
  const form = setup.renderer.root.findDescendantById("contact-option-0");
  const github = setup.renderer.root.findDescendantById("contact-option-1");
  expect(form?.y ?? 0).toBeLessThan(github?.y ?? 0);
});

test("renders bordered tuiparts form fields", async () => {
  setup = await testRender(<ContactForm onSubmit={async () => {}} />, {
    width: 80,
    height: 24,
  });
  await setup.renderOnce();

  const frame = setup.captureCharFrame();
  expect(frame).toContain("Send a message");
  expect(frame).toContain("you@example.com");
  expect(frame).toContain("Send message");
  expect(frame).not.toContain("Name (optional)");
  expect(frame).toContain("┌");
  expect(frame).toContain("└");
});

test("shows inline errors and focuses the first invalid field", async () => {
  let submissions = 0;
  setup = await testRender(
    <ContactForm
      onSubmit={async () => {
        submissions += 1;
      }}
    />,
    { width: 80, height: 24 },
  );
  await setup.renderOnce();

  const button = setup.renderer.root.findDescendantById("contact-submit");
  if (!button || !("press" in button) || typeof button.press !== "function") {
    throw new Error("Contact submit button was not rendered");
  }
  const press = button.press.bind(button);
  await act(async () => {
    press();
  });
  await setup.renderOnce();

  const frame = setup.captureCharFrame();
  expect(submissions).toBe(0);
  expect(frame).toContain("Please enter a valid email address.");
  expect(frame).toContain("Please enter a message.");
  expect(setup.renderer.currentFocusedRenderable?.id).toBe("contact-email");
});

test("clears field errors when their values become valid", async () => {
  setup = await testRender(<ContactForm onSubmit={async () => {}} />, {
    width: 80,
    height: 24,
  });
  await setup.renderOnce();

  const button = setup.renderer.root.findDescendantById("contact-submit");
  if (!button || !("press" in button) || typeof button.press !== "function") {
    throw new Error("Contact submit button was not rendered");
  }
  const press = button.press.bind(button);
  await act(async () => {
    press();
  });
  await setup.renderOnce();

  const email = setup.renderer.root.findDescendantById("contact-email");
  const message = setup.renderer.root.findDescendantById("contact-message");
  if (
    !email ||
    !("value" in email) ||
    !message ||
    !("setText" in message) ||
    typeof message.setText !== "function"
  ) {
    throw new Error("Contact fields were not rendered");
  }
  const setMessage = message.setText.bind(message);
  await act(async () => {
    email.value = "ada@example.com";
    setMessage("Hello");
  });
  await setup.renderOnce();

  const frame = setup.captureCharFrame();
  expect(frame).not.toContain("Please enter a valid email address.");
  expect(frame).not.toContain("Please enter a message.");
});

test("locks submission before React rerenders", async () => {
  let submissions = 0;
  let resolveSubmission: (() => void) | undefined;
  setup = await testRender(
    <ContactForm
      onSubmit={() => {
        submissions += 1;
        return new Promise<void>((resolve) => {
          resolveSubmission = resolve;
        });
      }}
    />,
    { width: 80, height: 24 },
  );
  await setup.renderOnce();

  const email = setup.renderer.root.findDescendantById("contact-email");
  const message = setup.renderer.root.findDescendantById("contact-message");
  if (
    !email ||
    !("value" in email) ||
    !message ||
    !("setText" in message) ||
    typeof message.setText !== "function"
  ) {
    throw new Error("Contact fields were not rendered");
  }
  const setMessage = message.setText.bind(message);
  await act(async () => {
    email.value = "ada@example.com";
    setMessage("Hello");
  });
  await setup.renderOnce();

  const button = setup.renderer.root.findDescendantById("contact-submit");
  if (!button || !("press" in button) || typeof button.press !== "function") {
    throw new Error("Contact submit button was not rendered");
  }
  const press = button.press.bind(button);
  await act(async () => {
    press();
    press();
  });

  expect(submissions).toBe(1);
  await act(async () => {
    resolveSubmission?.();
    await Promise.resolve();
  });
});

test("replaces the form with an error and a Try again button on failure", async () => {
  setup = await testRender(
    <ContactForm
      onSubmit={async () => {
        throw new Error("I couldn't send that right now.");
      }}
    />,
    { width: 80, height: 24 },
  );
  await setup.renderOnce();

  const email = setup.renderer.root.findDescendantById("contact-email");
  const message = setup.renderer.root.findDescendantById("contact-message");
  if (
    !email ||
    !("value" in email) ||
    !message ||
    !("setText" in message) ||
    typeof message.setText !== "function"
  ) {
    throw new Error("Contact fields were not rendered");
  }
  const setMessage = message.setText.bind(message);
  await act(async () => {
    email.value = "ada@example.com";
    setMessage("Hello");
  });
  await setup.renderOnce();

  const submit = setup.renderer.root.findDescendantById("contact-submit");
  if (!submit || !("press" in submit) || typeof submit.press !== "function") {
    throw new Error("Contact submit button was not rendered");
  }
  const press = submit.press.bind(submit);
  await act(async () => {
    press();
    await Promise.resolve();
  });
  await setup.renderOnce();

  let frame = setup.captureCharFrame();
  expect(frame).toContain("I couldn't send that right now.");
  expect(frame).toContain("Try again");
  expect(frame).not.toContain("Send message");

  const retry = setup.renderer.root.findDescendantById("contact-retry");
  if (!retry || !("press" in retry) || typeof retry.press !== "function") {
    throw new Error("Try again button was not rendered");
  }
  const pressRetry = retry.press.bind(retry);
  await act(async () => {
    pressRetry();
  });
  await setup.renderOnce();

  frame = setup.captureCharFrame();
  expect(frame).toContain("Send message");
  expect(frame).not.toContain("Try again");
});

test("replaces the form with a sent message and no button on success", async () => {
  setup = await testRender(<ContactForm onSubmit={async () => {}} />, {
    width: 80,
    height: 24,
  });
  await setup.renderOnce();

  const email = setup.renderer.root.findDescendantById("contact-email");
  const message = setup.renderer.root.findDescendantById("contact-message");
  if (
    !email ||
    !("value" in email) ||
    !message ||
    !("setText" in message) ||
    typeof message.setText !== "function"
  ) {
    throw new Error("Contact fields were not rendered");
  }
  const setMessage = message.setText.bind(message);
  await act(async () => {
    email.value = "ada@example.com";
    setMessage("Hello");
  });
  await setup.renderOnce();

  const submit = setup.renderer.root.findDescendantById("contact-submit");
  if (!submit || !("press" in submit) || typeof submit.press !== "function") {
    throw new Error("Contact submit button was not rendered");
  }
  const press = submit.press.bind(submit);
  await act(async () => {
    press();
    await Promise.resolve();
  });
  await setup.renderOnce();

  const frame = setup.captureCharFrame();
  expect(frame).toContain("Sent. Thanks for saying hello");
  expect(frame).not.toContain("Try again");
  expect(frame).not.toContain("Send message");
});
