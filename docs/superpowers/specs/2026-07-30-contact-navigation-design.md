# Contact navigation and form design

## Goal

Keep the original contact methods while adding a contact form that reads clearly as an interactive terminal form.

## Interaction

The Contact menu opens one page containing the message form and every contact method returned by the existing content API. Wide terminals place the form on the left, capped at 50% of the available content width, and the contact methods on the right. Narrow terminals stack the form first and the contact methods below it.

The form is selection index zero, followed by the API-provided contact methods. The page keeps the existing arrow, Page Up/Page Down, Home, End, and Enter behavior. Up and Down move between the form and contact methods; selecting a contact method opens the existing URL dialog. When the form is selected, Tab or Enter focuses its first field.

Tab and Shift-Tab move between form controls; Enter advances through single-line fields, and the button submits. Escape while editing returns focus to page navigation without clearing the form; Backspace remains available for text editing. Escape or Backspace from page navigation returns to the main menu.

## Form presentation

The form is always visible and has no separate Contact header or nested page. Name, email, and message use visible bordered containers rather than appearing as loose text. Labels sit immediately above each field. While the form is selected for page navigation, its outer border and title use the current terminal theme's yellow accent and its fields remain gray. Activating the form moves the yellow focus treatment to Name and restores the outer border and title to their idle colors. The message field remains taller than the single-line fields, and the submit button keeps the existing tuiparts treatment.

Name is labeled optional. Email and message are required. Submission validates both fields before calling the server: invalid controls receive an error-colored border and a short inline message, focus moves to the first invalid control, and each error clears when that field becomes valid. One blank row separates the message field from the submit button.

The form remains usable at the app's supported minimum terminal size and follows the dynamic light/dark palette through `ThemeProvider`.

## tuiparts theme

All installed tuiparts Recipes use a strict mapping of the active app palette rather than ANSI defaults. Yellow is the only accent for focus, primary actions, selection, success, and warning. Foreground, muted foreground, borders, surfaces, and disabled states derive from the app's white, dim, border, and background colors. Destructive feedback keeps a muted red so errors remain distinct.

Input and Textarea keep the normal foreground color while focused; only the cursor, selection, and enclosing field border use yellow. Button, Dialog, and Radio Group keep single-line borders and transparent or app-background surfaces. `ThemeProvider` updates the complete semantic token mapping whenever the terminal switches between light and dark mode.

## Components and state

`AppContent` owns whether keyboard focus is in page navigation or the form, along with the selected contact-page index. `ContactView` always renders both the contact methods and the form. `ContactForm` accepts whether it is active and owns control focus, input values, validation feedback, and submission state.

The contact list adds one synthetic item before the API-provided contact methods. This leaves remote content unchanged and preserves the existing link data.

## Errors and safety

Server validation also accepts an omitted name while requiring a valid email and non-empty message. Anonymous submissions use a neutral sender label in the email subject and body. The duplicate-submission lock, rate limits, request timeout, and Cloudflare response checks remain unchanged. A failed submission leaves the form populated for retry. A successful submission shows the existing confirmation state.

## Verification

- Test that Contact renders Send a message and API-provided contact methods.
- Test the wide side-by-side and narrow form-first layouts.
- Test that Tab or Enter activates the selected form and Escape returns to page navigation.
- Test optional names, invalid email, empty messages, error focus, and successful validation.
- Keep contact validation, delivery-response, duplicate-submission, typecheck, and headless render tests passing.
