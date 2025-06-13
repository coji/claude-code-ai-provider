// Main exports
export { claudeCode, createClaudeCode } from './claude-code-provider'
export type {
  ClaudeCodeProvider,
  ClaudeCodeProviderSettings,
} from './claude-code-provider'

// Settings and types
export type {
  ClaudeCodeModelId,
  ClaudeCodeSettings,
} from './claude-code-settings'

// Language model implementation
export { ClaudeCodeLanguageModel } from './claude-code-language-model'
export type { ClaudeCodeConfig } from './claude-code-language-model'

// SDK management
export { ClaudeCodeSDK } from './claude-code-sdk'
export type {
  ClaudeCodeProcessOptions,
  ClaudeCodeProcessResult,
  ClaudeCodeSDKMessage,
  ClaudeCodeStreamChunk,
} from './claude-code-types'

// Error handling
export {
  ClaudeCodeErrorSchema,
  createClaudeCodeError,
  defaultClaudeCodeErrorStructure,
  isClaudeCodeError,
} from './claude-code-error'
export type { ClaudeCodeError, ClaudeCodeErrorType } from './claude-code-error'

// Message conversion utilities
export { convertToClaudeCodePrompt } from './convert-messages'
