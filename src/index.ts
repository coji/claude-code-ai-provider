// Main exports
export { createClaudeCode, claudeCode } from "./claude-code-provider";
export type {
	ClaudeCodeProvider,
	ClaudeCodeProviderSettings,
} from "./claude-code-provider";

// Settings and types
export type {
	ClaudeCodeModelId,
	ClaudeCodeSettings,
} from "./claude-code-settings";

// Language model implementation
export { ClaudeCodeLanguageModel } from "./claude-code-language-model";
export type { ClaudeCodeConfig } from "./claude-code-language-model";

// Process management
export { ClaudeCodeProcess } from "./claude-code-process";
export type {
	ClaudeCodeProcessOptions,
	ClaudeCodeProcessResult,
	ClaudeCodeStreamChunk,
	ClaudeCodeSDKMessage,
} from "./claude-code-types";

// Error handling
export {
	createClaudeCodeError,
	isClaudeCodeError,
	ClaudeCodeErrorSchema,
	defaultClaudeCodeErrorStructure,
} from "./claude-code-error";
export type {
	ClaudeCodeError,
	ClaudeCodeErrorType,
} from "./claude-code-error";

// Message conversion utilities
export { convertToClaudeCodePrompt } from "./convert-messages";
