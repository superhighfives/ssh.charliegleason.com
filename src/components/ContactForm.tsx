import { type InputRenderable, type TextareaRenderable } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useRef, useState } from "react";
import { type ContactMessage, isValidEmail } from "../contact-email";
import { useColors } from "./ThemeProvider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

type ContactFormProps = {
	onSubmit: (message: ContactMessage) => Promise<void>;
	active?: boolean;
	selected?: boolean;
	onActivate?: () => void;
};

type Field = "email" | "message";
type FieldErrors = Partial<Record<Field, string>>;
type FormStatus = "idle" | "sending" | "sent" | "error";

// Matches the combined height of the two stacked contact cards beside it (in
// the wide grid layout) so the box doesn't resize when swapping in the
// centered error/sent states, and doesn't leave a gap below it either.
const FORM_HEIGHT = 13;

export function ContactForm({
	onSubmit,
	active = true,
	selected = true,
	onActivate,
}: ContactFormProps) {
	const colors = useColors();
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [focusedField, setFocusedField] = useState<Field | null>("email");
	const [status, setStatus] = useState<FormStatus>("idle");
	const [feedback, setFeedback] = useState("");
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const controls = useRef<Array<{ focus(): void; blur(): void } | null>>([]);
	const textareaRef = useRef<TextareaRenderable>(null);
	const focusIndex = useRef(0);
	const submitting = useRef(false);
	const retryRef = useRef<{ focus(): void } | null>(null);

	const focus = (index: number) => {
		focusIndex.current =
			(index + controls.current.length) % controls.current.length;
		const field = (["email", "message"] as const)[focusIndex.current];
		setFocusedField(field ?? null);
		controls.current[focusIndex.current]?.focus();
	};

	const activate = (index: number) => {
		if (active) {
			focus(index);
			return;
		}
		focusIndex.current = index;
		onActivate?.();
	};

	const submit = async () => {
		if (submitting.current || status === "sent") return;
		const errors: FieldErrors = {};
		if (!isValidEmail(email))
			errors.email = "Please enter a valid email address.";
		if (!message.trim()) errors.message = "Please enter a message.";
		if (errors.email || errors.message) {
			setFieldErrors(errors);
			focus(errors.email ? 0 : 1);
			return;
		}
		submitting.current = true;
		setStatus("sending");
		setFeedback("Sending...");
		try {
			await onSubmit({ email, message });
			setStatus("sent");
			setFeedback("Sent. Thanks for saying hello - I'll get back to you soon.");
		} catch (error) {
			submitting.current = false;
			setStatus("error");
			setFeedback(
				error instanceof Error
					? error.message
					: "I couldn't send that right now.",
			);
		}
	};

	useEffect(() => {
		if (active) {
			focus(0);
			return;
		}
		controls.current.forEach((control) => control?.blur());
		setFocusedField(null);
		focusIndex.current = 0;
	}, [active]);

	useEffect(() => {
		if (status === "error") {
			retryRef.current?.focus();
		} else if (status === "idle" && active) {
			focus(0);
		}
	}, [status]);

	const retry = () => {
		setStatus("idle");
		setFeedback("");
	};

	useKeyboard((key) => {
		if (!active || status === "sent") return;
		if (key.name === "tab") {
			focus(focusIndex.current + (key.shift ? -1 : 1));
		}
	});

	const borderColor = (field: Field) => {
		if (fieldErrors[field]) return colors.error;
		return focusedField === field ? colors.yellow : colors.border;
	};

	return (
		<box
			id="contact-option-0"
			flexDirection="column"
			border
			borderColor={
				status !== "sent" && selected && !active ? colors.yellow : colors.border
			}
			title="Send a message"
			titleColor={
				status !== "sent" && selected && !active ? colors.yellow : colors.white
			}
			paddingX={1}
		>
			{status === "sent" ? (
				<box
					flexDirection="column"
					minHeight={FORM_HEIGHT}
					justifyContent="center"
					alignItems="center"
				>
					<text
						fg={colors.yellow}
						content={feedback}
						wrapMode="word"
						width="80%"
					/>
				</box>
			) : status === "error" ? (
				<box
					flexDirection="column"
					minHeight={FORM_HEIGHT}
					justifyContent="center"
					alignItems="center"
					gap={1}
				>
					<text
						fg={colors.white}
						content={feedback}
						wrapMode="word"
						width="80%"
					/>
					<Button
						id="contact-retry"
						ref={(renderable) => {
							retryRef.current = renderable;
						}}
						intent="neutral"
						label="Try again"
						size="comfortable"
						onPress={retry}
					/>
				</box>
			) : (
				<box flexDirection="column" minHeight={FORM_HEIGHT} flexGrow={1}>
					<box flexDirection="column">
						<box
							id="contact-email-field"
							border
							borderColor={borderColor("email")}
							title="Email"
							titleColor={colors.white}
							paddingX={1}
							onMouseDown={() => activate(0)}
						>
							<Input
								id="contact-email"
								ref={(renderable: InputRenderable | null) => {
									controls.current[0] = renderable;
								}}
								flexGrow={1}
								placeholder="you@example.com"
								maxLength={254}
								onInput={(value) => {
									setEmail(value);
									if (isValidEmail(value)) {
										setFieldErrors((current) => ({
											...current,
											email: undefined,
										}));
									}
								}}
								onSubmit={() => focus(1)}
							/>
						</box>
						{fieldErrors.email && (
							<text
								fg={colors.error}
								content={fieldErrors.email}
								wrapMode="word"
							/>
						)}
					</box>
					<box flexDirection="column" flexGrow={1}>
						<box
							border
							borderColor={borderColor("message")}
							title="Message"
							titleColor={colors.white}
							paddingX={1}
							flexGrow={1}
							onMouseDown={() => activate(1)}
						>
							<Textarea
								id="contact-message"
								ref={(renderable) => {
									textareaRef.current = renderable;
									controls.current[1] = renderable;
								}}
								flexGrow={1}
								placeholder="What's on your mind?"
								onPaste={(event) => {
									if (message.length + event.bytes.length > 4_000) {
										event.preventDefault();
									}
								}}
								onContentChange={() => {
									const value = textareaRef.current?.plainText ?? "";
									if (value.length > 4_000) {
										textareaRef.current?.setText(value.slice(0, 4_000));
										return;
									}
									setMessage(value);
									if (value.trim()) {
										setFieldErrors((current) => ({
											...current,
											message: undefined,
										}));
									}
							}}
						/>
					</box>
					{fieldErrors.message && (
						<text
							fg={colors.error}
							content={fieldErrors.message}
							wrapMode="word"
						/>
					)}
				</box>
				<box
					flexDirection="row"
					justifyContent="flex-end"
				>
					<Button
						id="contact-submit"
						ref={(renderable) => {
							controls.current[2] = renderable;
						}}
						label={status === "sending" ? "Sending..." : "Send message"}
						size="comfortable"
						disabled={status === "sending"}
						onMouseDown={() => {
							activate(2);
							setFocusedField(null);
						}}
						onPress={() => void submit()}
					/>
				</box>
				</box>
			)}
		</box>
	);
}
