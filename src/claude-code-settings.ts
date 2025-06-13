/**
 * Claude Code Provider Settings
 */

/**
 * Available Claude Code models
 */
export type ClaudeCodeModelId =
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'claude-3-haiku-20240307'
  | string // Allow custom model IDs

/**
 * Settings for Claude Code chat functionality
 */
export interface ClaudeCodeSettings {
  /**
   * Maximum number of conversation turns.
   * @default undefined (no limit)
   */
  maxTurns?: number

  /**
   * Custom system prompt to override the default.
   * Only works in non-interactive mode.
   */
  systemPrompt?: string

  /**
   * Additional instructions to append to the system prompt.
   * Only works in non-interactive mode.
   */
  appendSystemPrompt?: string

  /**
   * List of allowed tools.
   * Can be tool names or patterns like "Bash(npm install)".
   */
  allowedTools?: string[]

  /**
   * List of disallowed tools.
   * Can be tool names or patterns like "Bash(git commit)".
   */
  disallowedTools?: string[]

  /**
   * Permission mode for tool execution.
   * @default "default"
   */
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan'

  /**
   * MCP configuration file path for loading external tools.
   */
  mcpConfig?: string

  /**
   * MCP tool to use for permission prompts.
   * Format: mcp__<serverName>__<toolName>
   */
  permissionPromptTool?: string

  /**
   * Working directory for Claude Code execution.
   * @default process.cwd()
   */
  cwd?: string

  /**
   * Path to Claude Code executable.
   * @default "claude" (assumes it's in PATH)
   */
  claudeCodeExecutable?: string

  /**
   * Timeout in milliseconds for Claude Code operations.
   * @default 300000 (5 minutes)
   */
  timeout?: number

  /**
   * Whether to enable verbose logging.
   * @default false
   */
  verbose?: boolean

  /**
   * Environment variables to pass to Claude Code process.
   */
  env?: Record<string, string>

  /**
   * Session ID to resume a previous conversation.
   */
  sessionId?: string

  /**
   * Whether to continue the latest conversation.
   * @default false
   */
  continue?: boolean
}
