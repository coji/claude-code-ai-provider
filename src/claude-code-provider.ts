import type { LanguageModelV1, ProviderV1 } from '@ai-sdk/provider'
import { ClaudeCodeLanguageModel } from './claude-code-language-model'
import type {
  ClaudeCodeModelId,
  ClaudeCodeSettings,
} from './claude-code-settings'

/**
 * Claude Code Provider interface
 */
export interface ClaudeCodeProvider extends ProviderV1 {
  (modelId: ClaudeCodeModelId, settings?: ClaudeCodeSettings): LanguageModelV1

  /**
   * Create a new language model for text generation
   */
  languageModel: (
    modelId: ClaudeCodeModelId,
    settings?: ClaudeCodeSettings,
  ) => LanguageModelV1

  /**
   * Create a new chat model for text generation (alias for languageModel)
   */
  chatModel: (
    modelId: ClaudeCodeModelId,
    settings?: ClaudeCodeSettings,
  ) => LanguageModelV1
}

/**
 * Claude Code Provider settings
 */
export interface ClaudeCodeProviderSettings {
  /**
   * Path to Claude Code executable
   * @default "claude" (assumes it's in PATH)
   */
  claudeCodeExecutable?: string

  /**
   * Default working directory for Claude Code execution
   * @default process.cwd()
   */
  cwd?: string

  /**
   * Default environment variables to pass to Claude Code process
   */
  env?: Record<string, string>

  /**
   * Default timeout in milliseconds for Claude Code operations
   * @default 300000 (5 minutes)
   */
  timeout?: number

  /**
   * Whether to enable verbose logging by default
   * @default false
   */
  verbose?: boolean

  /**
   * Default permission mode for tool execution
   * @default "default"
   */
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan'

  /**
   * Default MCP configuration file path
   */
  mcpConfig?: string

  /**
   * Default allowed tools
   */
  allowedTools?: string[]

  /**
   * Default disallowed tools
   */
  disallowedTools?: string[]
}

/**
 * Creates a Claude Code provider instance
 */
export function createClaudeCode(
  options: ClaudeCodeProviderSettings = {},
): ClaudeCodeProvider {
  const config = {
    provider: 'claude-code',
    defaultObjectGenerationMode: 'json' as const,
    supportsStructuredOutputs: true,
  }

  /**
   * Create a language model instance
   */
  const createLanguageModel = (
    modelId: ClaudeCodeModelId,
    settings: ClaudeCodeSettings = {},
  ) => {
    // Merge provider-level and model-level settings
    const mergedSettings: ClaudeCodeSettings = {
      ...settings, // Model-specific settings override provider defaults
    }

    // Add provider defaults only if not already specified
    if (
      options.claudeCodeExecutable !== undefined &&
      mergedSettings.claudeCodeExecutable === undefined
    ) {
      mergedSettings.claudeCodeExecutable = options.claudeCodeExecutable
    }
    if (options.cwd !== undefined && mergedSettings.cwd === undefined) {
      mergedSettings.cwd = options.cwd
    }
    if (options.env !== undefined && mergedSettings.env === undefined) {
      mergedSettings.env = options.env
    }
    if (options.timeout !== undefined && mergedSettings.timeout === undefined) {
      mergedSettings.timeout = options.timeout
    }
    if (options.verbose !== undefined && mergedSettings.verbose === undefined) {
      mergedSettings.verbose = options.verbose
    }
    if (
      options.permissionMode !== undefined &&
      mergedSettings.permissionMode === undefined
    ) {
      mergedSettings.permissionMode = options.permissionMode
    }
    if (
      options.mcpConfig !== undefined &&
      mergedSettings.mcpConfig === undefined
    ) {
      mergedSettings.mcpConfig = options.mcpConfig
    }
    if (
      options.allowedTools !== undefined &&
      mergedSettings.allowedTools === undefined
    ) {
      mergedSettings.allowedTools = options.allowedTools
    }
    if (
      options.disallowedTools !== undefined &&
      mergedSettings.disallowedTools === undefined
    ) {
      mergedSettings.disallowedTools = options.disallowedTools
    }

    return new ClaudeCodeLanguageModel(modelId, mergedSettings, config)
  }

  // Default provider function
  const provider = (
    modelId: ClaudeCodeModelId,
    settings?: ClaudeCodeSettings,
  ) => createLanguageModel(modelId, settings)

  // Add methods to the provider
  provider.languageModel = createLanguageModel
  provider.chatModel = createLanguageModel

  return provider as unknown as ClaudeCodeProvider
}

/**
 * Default Claude Code provider instance
 */
export const claudeCode = createClaudeCode()
