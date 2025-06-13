import type { LanguageModelV1Prompt } from "@ai-sdk/provider";

/**
 * Convert Vercel AI SDK prompt to Claude Code prompt format
 */
export function convertToClaudeCodePrompt(
	prompt: LanguageModelV1Prompt,
): string {
	if (typeof prompt === "string") {
		return prompt;
	}

	// Handle array of messages
	if (Array.isArray(prompt)) {
		return prompt
			.map((message: Record<string, unknown>) => {
				const role = message.role as string;
				switch (role) {
					case "system":
						return `System: ${message.content}`;
					case "user":
						return formatUserMessage(message);
					case "assistant":
						return formatAssistantMessage(message);
					case "tool":
						return `Tool Result: ${JSON.stringify(message.content)}`;
					default:
						return `${role}: ${JSON.stringify(message)}`;
				}
			})
			.join("\n\n");
	}

	// Fallback to string representation
	return JSON.stringify(prompt);
}

/**
 * Format user message content
 */
function formatUserMessage(message: Record<string, unknown>): string {
	if (typeof message.content === "string") {
		return `User: ${message.content}`;
	}

	if (Array.isArray(message.content)) {
		const parts = message.content.map((part: Record<string, unknown>) => {
			const partType = part.type as string;
			switch (partType) {
				case "text":
					return part.text;
				case "image":
					return `[Image: ${(part.image as Record<string, unknown>)?.type ?? "image"}]`;
				case "file":
					return `[File: ${(part.file as Record<string, unknown>)?.name ?? "file"}]`;
				default:
					return `[${partType}: ${JSON.stringify(part)}]`;
			}
		});
		return `User: ${parts.join(" ")}`;
	}

	return `User: ${JSON.stringify(message.content)}`;
}

/**
 * Format assistant message content
 */
function formatAssistantMessage(message: Record<string, unknown>): string {
	if (typeof message.content === "string") {
		return `Assistant: ${message.content}`;
	}

	if (Array.isArray(message.content)) {
		const parts = message.content.map((part: Record<string, unknown>) => {
			const partType = part.type as string;
			switch (partType) {
				case "text":
					return part.text;
				case "tool-call":
					return `[Tool Call: ${part.toolName}(${part.args})]`;
				default:
					return `[${partType}: ${JSON.stringify(part)}]`;
			}
		});
		return `Assistant: ${parts.join(" ")}`;
	}

	// Handle tool calls
	if (message.toolCalls && Array.isArray(message.toolCalls)) {
		const toolCallsText = message.toolCalls
			.map(
				(call: Record<string, unknown>) =>
					`[Tool Call: ${call.toolName}(${call.args})]`,
			)
			.join(" ");
		return `Assistant: ${message.content ?? ""} ${toolCallsText}`.trim();
	}

	return `Assistant: ${JSON.stringify(message.content)}`;
}
