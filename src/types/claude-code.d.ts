declare module '@anthropic-ai/claude-code' {
  export interface Options {
    abortController?: AbortController
    allowedTools?: string[]
    appendSystemPrompt?: string
    customSystemPrompt?: string
    cwd?: string
    disallowedTools?: string[]
    executable?: 'bun' | 'deno' | 'node'
    executableArgs?: string[]
    maxThinkingTokens?: number
    maxTurns?: number
    mcpServers?: Record<string, McpServerConfig>
    pathToClaudeCodeExecutable?: string
    permissionMode?: PermissionMode
    permissionPromptToolName?: string
    continue?: boolean
    resume?: string
    model?: string
  }

  export type PermissionMode =
    | 'default'
    | 'acceptEdits'
    | 'bypassPermissions'
    | 'plan'

  export type McpServerConfig = McpStdioServerConfig | McpSSEServerConfig

  export type McpStdioServerConfig = {
    type?: 'stdio'
    command: string
    args?: string[]
    env?: Record<string, string>
  }

  export type McpSSEServerConfig = {
    type: 'sse'
    url: string
    headers?: Record<string, string>
  }

  export type SDKMessage =
    | SDKAssistantMessage
    | SDKUserMessage
    | SDKResultMessage
    | SDKSystemMessage

  export interface SDKAssistantMessage {
    type: 'assistant'
    message: unknown
    session_id: string
  }

  export interface SDKUserMessage {
    type: 'user'
    message: unknown
    session_id: string
  }

  export interface SDKResultMessage {
    type: 'result'
    subtype: 'success' | 'error_max_turns' | 'error_during_execution'
    duration_ms: number
    duration_api_ms?: number
    is_error: boolean
    num_turns: number
    session_id: string
    total_cost_usd: number
    result?: string
    usage?: unknown
  }

  export interface SDKSystemMessage {
    type: 'system'
    session_id: string
    [key: string]: unknown
  }

  export interface QueryProps {
    prompt: string
    abortController?: AbortController
    options?: Options
  }

  export function query(props: QueryProps): AsyncGenerator<SDKMessage>
}
