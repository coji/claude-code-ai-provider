import { query, type Options, type SDKMessage } from '@anthropic-ai/claude-code'
import { createClaudeCodeError } from './claude-code-error'
import type {
  ClaudeCodeProcessOptions,
  ClaudeCodeProcessResult,
  ClaudeCodeSDKMessage,
  ClaudeCodeStreamChunk,
} from './claude-code-types'

/**
 * Claude Code SDK wrapper that provides the same interface as ClaudeCodeProcess
 * but uses the official @anthropic-ai/claude-code TypeScript SDK
 */
export class ClaudeCodeSDK {
  private readonly options: Required<Omit<ClaudeCodeProcessOptions, 'prompt'>>
  private readonly prompt: string
  private abortController?: AbortController

  constructor(options: ClaudeCodeProcessOptions) {
    this.prompt = options.prompt
    this.options = {
      cwd: options.cwd ?? process.cwd(),
      executable: options.executable ?? 'claude',
      env: { ...process.env, ...(options.env ?? {}) } as Record<string, string>,
      timeout: options.timeout ?? 300000, // 5 minutes
      outputFormat: options.outputFormat ?? 'stream-json',
      args: options.args ?? [],
      verbose: options.verbose ?? false,
    }
  }

  /**
   * Execute Claude Code with the given prompt using the official SDK
   */
  async execute(): Promise<ClaudeCodeProcessResult> {
    return new Promise((resolve, reject) => {
      this.abortController = new AbortController()
      const messages: ClaudeCodeSDKMessage[] = []
      let sessionId = ''
      let totalCost = 0
      let duration = 0

      // Set up timeout
      const timeoutId = setTimeout(() => {
        if (this.abortController) {
          this.abortController.abort()
          reject(
            createClaudeCodeError(
              'timeout_error',
              'Claude Code SDK request timed out',
              {
                details: { timeout: this.options.timeout },
              },
            ),
          )
        }
      }, this.options.timeout)

      const runQuery = async () => {
        try {
          const sdkOptions = this.buildSDKOptions()

          if (this.options.verbose) {
            console.log(
              'Executing Claude Code SDK query with options:',
              sdkOptions,
            )
          }

          const queryProps: {
            prompt: string
            options: Options
            abortController?: AbortController
          } = {
            prompt: this.prompt,
            options: sdkOptions,
          }

          if (this.abortController) {
            queryProps.abortController = this.abortController
          }

          const response = query(queryProps)

          for await (const message of response) {
            if (this.options.verbose) {
              console.log('Received SDK message:', message.type)
            }

            // Convert SDKMessage to ClaudeCodeSDKMessage format
            const convertedMessage = this.convertSDKMessage(message)
            messages.push(convertedMessage)

            // Extract metadata
            if (message.type === 'system' && 'session_id' in message) {
              sessionId = message.session_id
            } else if (message.type === 'result') {
              if ('total_cost_usd' in message) {
                totalCost = message.total_cost_usd
              }
              if ('duration_ms' in message) {
                duration = message.duration_ms
              }
            }
          }

          clearTimeout(timeoutId)
          resolve({
            messages,
            sessionId,
            success: true,
            exitCode: 0,
            duration,
            totalCost,
          })
        } catch (error) {
          clearTimeout(timeoutId)
          reject(
            createClaudeCodeError(
              'process_error',
              'Claude Code SDK execution failed',
              {
                details: error,
              },
            ),
          )
        }
      }

      runQuery()
    })
  }

  /**
   * Execute Claude Code with streaming using the official SDK
   */
  async *executeStreaming(): AsyncGenerator<
    ClaudeCodeStreamChunk,
    void,
    unknown
  > {
    this.abortController = new AbortController()

    // Set up timeout
    const timeoutId = setTimeout(() => {
      if (this.abortController) {
        this.abortController.abort()
      }
    }, this.options.timeout)

    try {
      const sdkOptions = this.buildSDKOptions()

      if (this.options.verbose) {
        console.log(
          'Executing Claude Code SDK streaming query with options:',
          sdkOptions,
        )
      }

      const queryProps: {
        prompt: string
        options: Options
        abortController?: AbortController
      } = {
        prompt: this.prompt,
        options: sdkOptions,
      }

      if (this.abortController) {
        queryProps.abortController = this.abortController
      }

      const response = query(queryProps)

      for await (const message of response) {
        if (this.options.verbose) {
          console.log('Received streaming SDK message:', message.type)
        }

        // Convert SDKMessage to streaming format
        const convertedMessage = this.convertSDKMessage(message)
        const done = message.type === 'result'

        yield {
          data: convertedMessage,
          done,
        }

        if (done) {
          break
        }
      }
    } catch (error) {
      throw createClaudeCodeError(
        'process_error',
        'Claude Code SDK streaming failed',
        {
          details: error,
        },
      )
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Kill the operation (abort the request)
   */
  kill(): void {
    if (this.abortController) {
      this.abortController.abort()
    }
  }

  /**
   * Build SDK options from process options
   */
  private buildSDKOptions(): Options {
    const sdkOptions: Options = {}

    // Map process options to SDK options
    if (this.options.cwd) {
      sdkOptions.cwd = this.options.cwd
    }

    if (this.options.env) {
      // Extract specific environment variables that might be relevant
      // The SDK doesn't directly support env vars, but we can set them on process.env
      Object.assign(process.env, this.options.env)
    }

    // Parse args to extract SDK-compatible options
    const args = this.options.args
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      const nextArg = args[i + 1]

      switch (arg) {
        case '--max-turns':
          if (nextArg && !Number.isNaN(Number(nextArg))) {
            sdkOptions.maxTurns = Number(nextArg)
            i++ // Skip next arg
          }
          break
        case '--system-prompt':
          if (nextArg) {
            sdkOptions.customSystemPrompt = nextArg
            i++ // Skip next arg
          }
          break
        case '--append-system-prompt':
          if (nextArg) {
            sdkOptions.appendSystemPrompt = nextArg
            i++ // Skip next arg
          }
          break
        case '--allowedTools':
          if (nextArg) {
            sdkOptions.allowedTools = nextArg.split(',')
            i++ // Skip next arg
          }
          break
        case '--disallowedTools':
          if (nextArg) {
            sdkOptions.disallowedTools = nextArg.split(',')
            i++ // Skip next arg
          }
          break
        case '--model':
          if (nextArg) {
            sdkOptions.model = nextArg
            i++ // Skip next arg
          }
          break
        case '--continue':
          sdkOptions.continue = true
          break
        case '--resume':
          if (nextArg) {
            sdkOptions.resume = nextArg
            i++ // Skip next arg
          }
          break
      }
    }

    return sdkOptions
  }

  /**
   * Convert SDK message to ClaudeCodeSDKMessage format
   */
  private convertSDKMessage(message: SDKMessage): ClaudeCodeSDKMessage {
    switch (message.type) {
      case 'system':
        return {
          type: 'system',
          subtype: 'init',
          session_id: 'session_id' in message ? message.session_id : '',
          // Add other system properties as needed
        } as ClaudeCodeSDKMessage

      case 'assistant':
        return {
          type: 'assistant',
          message: message.message,
          session_id: message.session_id,
        } as ClaudeCodeSDKMessage

      case 'user':
        return {
          type: 'user',
          message: message.message,
          session_id: message.session_id,
        } as ClaudeCodeSDKMessage

      case 'result':
        return {
          type: 'result',
          subtype: message.subtype,
          is_error: message.is_error,
          duration_ms: message.duration_ms,
          duration_api_ms: message.duration_api_ms || 0,
          num_turns: message.num_turns,
          session_id: message.session_id,
          total_cost_usd: message.total_cost_usd,
          ...(message.subtype === 'success' && { result: message.result }),
        } as ClaudeCodeSDKMessage

      default:
        // Fallback for unknown message types
        return message as unknown as ClaudeCodeSDKMessage
    }
  }
}
