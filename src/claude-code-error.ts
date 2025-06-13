import { z } from "zod";

/**
 * Claude Code specific error types
 */
export type ClaudeCodeErrorType =
	| "process_error"
	| "timeout_error"
	| "parsing_error"
	| "session_error"
	| "permission_error"
	| "invalid_response";

/**
 * Claude Code error structure
 */
export interface ClaudeCodeError {
	type: ClaudeCodeErrorType;
	message: string;
	code?: string;
	details?: unknown;
	sessionId?: string;
}

/**
 * Error schema for Claude Code responses
 */
export const ClaudeCodeErrorSchema = z.object({
	error: z.object({
		type: z.string(),
		message: z.string(),
		code: z.string().optional(),
		details: z.unknown().optional(),
		sessionId: z.string().optional(),
	}),
});

/**
 * Default error structure for Claude Code API responses
 */
export const defaultClaudeCodeErrorStructure = {
	errorSchema: ClaudeCodeErrorSchema,
	errorToMessage: (error: z.infer<typeof ClaudeCodeErrorSchema>) => {
		return `Claude Code Error (${error.error.type}): ${error.error.message}`;
	},
};

/**
 * Creates a Claude Code error
 */
export function createClaudeCodeError(
	type: ClaudeCodeErrorType,
	message: string,
	options?: {
		code?: string;
		details?: unknown;
		sessionId?: string;
	},
): ClaudeCodeError {
	const error: ClaudeCodeError = {
		type,
		message,
	};

	if (options?.code !== undefined) {
		error.code = options.code;
	}
	if (options?.details !== undefined) {
		error.details = options.details;
	}
	if (options?.sessionId !== undefined) {
		error.sessionId = options.sessionId;
	}

	return error;
}

/**
 * Checks if an error is a Claude Code error
 */
export function isClaudeCodeError(error: unknown): error is ClaudeCodeError {
	return (
		typeof error === "object" &&
		error !== null &&
		"type" in error &&
		"message" in error &&
		typeof (error as ClaudeCodeError).type === "string" &&
		typeof (error as ClaudeCodeError).message === "string"
	);
}
