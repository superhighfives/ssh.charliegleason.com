# Contact Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present contact links and the tuiparts contact form together in one responsive Contact page.

**Architecture:** `AppContent` owns Contact's page/form focus mode and selection so global navigation remains the single keyboard owner. `ContactView` always renders the API-backed links and embedded `ContactForm`, side by side on wide terminals and form-first on narrow terminals. `ContactForm` owns field editing, validation, and submission only while active.

**Tech Stack:** React 19, OpenTUI 0.4.5, tuiparts React Recipes, Bun test renderer.

---

### Task 1: Restore contact navigation

**Files:**
- Modify: `src/index.tsx`
- Modify: `src/views/ContactView.tsx`
- Test: `src/contact-view.test.tsx`

- [ ] Add a failing headless test that renders API contact data and expects both `Send a message` and the original labels.
- [ ] Add `contactMode` and Contact list selection handling to `AppContent`.
- [ ] Render a synthetic first item followed by every item from `useContent().contact`.
- [ ] Route Enter on the synthetic item to form mode and Enter on API items through the existing URL opener.
- [ ] Make Escape/Backspace return form → contact list → main menu.
- [ ] Run `bun test src/contact-view.test.tsx` and confirm the navigation tests pass.

### Task 2: Split and style the form

**Files:**
- Create: `src/components/ContactForm.tsx`
- Modify: `src/views/ContactView.tsx`
- Test: `src/contact-view.test.tsx`

- [ ] Move form values, refs, focus traversal, duplicate-submit locking, feedback, and submission into `ContactForm`.
- [ ] Wrap each tuiparts Input/Textarea in a bordered box with one cell of horizontal padding.
- [ ] Track focus per field through `onFocus`/`onBlur`; use `colors.yellow` for the focused border and `colors.border` otherwise.
- [ ] Keep the message area three rows tall and preserve the 4,000-character paste/content limit.
- [ ] Keep Tab/Shift-Tab traversal, Enter-to-advance for single-line fields, and the tuiparts submit Button.
- [ ] Add render assertions for visible field borders and preserve the duplicate-submission test.
- [ ] Run `bun test src/contact-view.test.tsx` and confirm all form tests pass.

### Task 3: Verify the integrated TUI

**Files:**
- Modify only if verification exposes a defect.

- [ ] Run `bun run typecheck` and expect no TypeScript errors.
- [ ] Run `bun test` and expect all tests to pass.
- [ ] Run `git diff --check` and expect no whitespace errors.
- [ ] Launch `script -q /dev/null bun run src/dev.tsx` and confirm the TUI renders without a startup exception.
- [ ] Review the final diff without committing or pushing.

### Task 4: Match tuiparts to the app theme

**Files:**
- Modify: `src/theme.ts`
- Modify: `src/components/ThemeProvider.tsx`
- Modify: `src/components/ui/theme.ts`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/textarea.tsx`
- Test: `src/components/ui/theme.test.ts`

- [ ] Add a failing token-mapping test for the app's dark and light palettes.
- [ ] Add a muted `error` color to each app palette so destructive feedback avoids ANSI defaults.
- [ ] Export `tokensForColors(colors)` from the tuiparts theme and map every semantic token to app colors: yellow for primary/focus/success/warning; white/dim/border/background for text, surfaces, and disabled states; error for destructive.
- [ ] Initialize the tuiparts store from the dark app palette and update `ThemeProvider` to apply the complete mapping when terminal mode changes.
- [ ] Keep focused Input/Textarea text unchanged while using yellow for cursors and textarea selection.
- [ ] Run `bun test src/components/ui/theme.test.ts`, `bun run typecheck`, and `bun test`.

### Task 5: Add the message callout

**Files:**
- Modify: `src/views/ContactView.tsx`
- Test: `src/contact-view.test.tsx`

- [x] Add render assertions for a bordered Send a message callout without decorative ASCII art.
- [x] Render the synthetic message option in its own yellow bordered box with its title and description.
- [x] Keep API-provided contact methods in the existing list style and preserve selection/navigation behavior.
- [x] Run `bun test src/contact-view.test.tsx` and confirm the callout assertions pass.

### Task 6: Validate optional-name contact submissions

**Files:**
- Modify: `src/contact-email.ts`
- Modify: `src/components/ContactForm.tsx`
- Modify: `src/contact-email.test.ts`
- Modify: `src/contact-view.test.tsx`

- [x] Add failing validation tests proving an empty name is accepted while invalid email and blank message are rejected.
- [x] Update server validation and email formatting to use a neutral anonymous label when name is omitted.
- [x] Label the form field `Name (optional)` and add one blank row above the submit button.
- [x] Add client validation state for email and message, error-colored borders, inline messages, first-invalid focus, and error clearing on edit.
- [x] Keep network/API failures in the existing general feedback area.
- [x] Run `bun test src/contact-email.test.ts src/contact-view.test.tsx`, then run the full typecheck and test suite.

### Task 7: Embed the form in the Contact page

**Files:**
- Modify: `src/index.tsx`
- Modify: `src/views/ContactView.tsx`
- Modify: `src/components/ContactForm.tsx`
- Modify: `src/contact-view.test.tsx`

- [x] Add failing wide-layout assertions that contact links and form fields render together, with links before the form in the terminal row.
- [x] Add failing narrow-layout assertions that the form renders before the contact links.
- [x] Make `ContactForm` embeddable by removing its page wrapper/header and accepting an active state that controls focus and Tab traversal.
- [x] Render links and form side by side at or above `STACK_BREAKPOINT`; stack the form before links below it.
- [x] Keep the form as selection index zero and contact links at indices one onward.
- [x] Let Tab or Enter activate the selected form; let Escape return from form focus to page navigation without clearing values or intercepting Backspace editing.
- [x] Run `bun test src/contact-view.test.tsx`, then run `bun run typecheck`, `bun test`, and `git diff --check`.

### Task 8: Reverse the wide layout and clarify focus

**Files:**
- Modify: `src/views/ContactView.tsx`
- Modify: `src/components/ContactForm.tsx`
- Modify: `src/contact-view.test.tsx`

- [x] Add failing geometry assertions that the form sits left of the links and uses no more than half of the available content width.
- [x] Add a failing active-state assertion that the outer form border is gray while Name has the yellow border and input focus.
- [x] Place the form scroll area first at 50% width and let the contact-links scroll area use the remaining wide-layout space.
- [x] Use yellow on the outer form only during page navigation; move yellow to the focused control after Tab or Enter activation.
- [x] Keep the narrow form-first layout unchanged.
- [x] Run the focused contact tests and typecheck.
