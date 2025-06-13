import type {
  LanguageModelV1,
  LanguageModelV1CallOptions,
  LanguageModelV1CallWarning,
  LanguageModelV1FinishReason,
  LanguageModelV1StreamPart,
} from '@ai-sdk/provider'
import { generateId } from '@ai-sdk/provider-utils'
import { createClaudeCodeError, isClaudeCodeError } from './claude-code-error'
import { ClaudeCodeSDK } from './claude-code-sdk'
import type {
  ClaudeCodeModelId,
  ClaudeCodeSettings,
} from './claude-code-settings'
import { convertToClaudeCodePrompt } from './convert-messages'

/**
 * Configuration for the Claude Code Language Model
 */
export interface ClaudeCodeConfig {
  provider: string
  defaultObjectGenerationMode?: 'json' | 'tool'
  supportsStructuredOutputs?: boolean
}

/**
 * Claude Code Language Model implementation
 * Implements LanguageModelV1 for integration with Vercel AI SDK
 */
export class ClaudeCodeLanguageModel implements LanguageModelV1 {
  readonly specificationVersion = 'v1' as const
  readonly provider: string
  readonly modelId: ClaudeCodeModelId
  readonly settings: ClaudeCodeSettings
  readonly defaultObjectGenerationMode: 'json' | 'tool' | undefined
  readonly supportsStructuredOutputs: boolean = true
  readonly supportsImageUrls: boolean = true

  constructor(
    modelId: ClaudeCodeModelId,
    settings: ClaudeCodeSettings,
    config: ClaudeCodeConfig,
  ) {
    this.modelId = modelId
    this.settings = settings
    this.provider = config.provider
    this.defaultObjectGenerationMode = config.defaultObjectGenerationMode
    this.supportsStructuredOutputs = config.supportsStructuredOutputs ?? false
  }

  /**
   * Generate text using Claude Code (non-streaming)
   */
  async doGenerate(
    options: LanguageModelV1CallOptions,
  ): Promise<Awaited<ReturnType<LanguageModelV1['doGenerate']>>> {
    const { prompt, abortSignal, mode } = options
    // @ts-ignore mode is deprecated but still needed for object generation
    const warnings: LanguageModelV1CallWarning[] = []

    try {
      // Convert prompt to Claude Code format
      let claudeCodePrompt = convertToClaudeCodePrompt(prompt)

      // Handle object generation mode
      if (mode?.type === 'object-json' || mode?.type === 'object-tool') {
        const schema =
          mode.type === 'object-json' ? mode.schema : mode.tool.parameters
        claudeCodePrompt += `\n\nIMPORTANT: Respond with valid JSON that matches this schema:\n${JSON.stringify(schema, null, 2)}`
        claudeCodePrompt +=
          '\n\nYour response should be ONLY the JSON object, without any additional text, code blocks, or formatting. Do not wrap it in ```json``` blocks.'
      }

      // Prepare process options
      const processOptions = this.buildProcessOptions(claudeCodePrompt, options)

      // Execute Claude Code using official SDK
      const sdk = new ClaudeCodeSDK(processOptions)

      // Handle abort signal
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          sdk.kill()
        })
      }

      const result = await sdk.execute()

      if (!result.success) {
        throw createClaudeCodeError(
          'process_error',
          result.error ?? 'Claude Code execution failed',
          {
            details: result,
          },
        )
      }

      // Extract the final result
      const finalMessage = result.messages.find(
        (msg) => msg.type === 'result' && msg.subtype === 'success',
      )

      if (
        !finalMessage ||
        finalMessage.type !== 'result' ||
        finalMessage.subtype !== 'success'
      ) {
        throw createClaudeCodeError(
          'invalid_response',
          'No valid result found in Claude Code response',
          {
            details: result.messages,
          },
        )
      }

      // Get text from the last assistant message instead of result.result
      const assistantMessages = result.messages.filter(
        (msg) => msg.type === 'assistant',
      )
      const lastAssistantMessage =
        assistantMessages[assistantMessages.length - 1]

      let text = finalMessage.result || ''
      if (
        lastAssistantMessage &&
        typeof lastAssistantMessage.message === 'string'
      ) {
        text = lastAssistantMessage.message
      } else if (lastAssistantMessage?.message) {
        // Handle Claude Code message format (content array)
        try {
          const messageObj =
            typeof lastAssistantMessage.message === 'string'
              ? JSON.parse(lastAssistantMessage.message)
              : lastAssistantMessage.message

          if (messageObj.content && Array.isArray(messageObj.content)) {
            const textContent = messageObj.content.find(
              (c: any) => c.type === 'text',
            )
            if (textContent?.text) {
              text = textContent.text
            }
          }
        } catch (e) {
          // Fallback to result.result or empty string
        }
      }
      const finishReason = this.mapFinishReason('success')

      // Handle object generation response
      let responseObject = undefined
      if (mode?.type === 'object-json' || mode?.type === 'object-tool') {
        try {
          // Try to parse the response as JSON
          const cleanedText = text.trim()
          let jsonText = cleanedText

          // Extract JSON if it's wrapped in code blocks
          const jsonMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
          if (jsonMatch) {
            jsonText = jsonMatch[1]?.trim() || cleanedText
          }

          responseObject = JSON.parse(jsonText)
        } catch (parseError) {
          // If JSON parsing fails, treat as regular text response
          warnings.push({
            type: 'other' as const,
            message: `Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
          })
        }
      }

      const response = {
        text,
        finishReason,
        ...(responseObject && { object: responseObject }),
        usage: {
          promptTokens: Number.NaN, // Claude Code doesn't provide detailed token counts
          completionTokens: Number.NaN,
        },
        rawCall: {
          rawPrompt: claudeCodePrompt,
          rawSettings: this.settings as Record<string, unknown>,
        },
        rawResponse: {
          headers: {},
          body: result,
        },
        response: {
          id: generateId(),
          timestamp: new Date(),
          modelId: this.modelId,
        },
        warnings,
        request: {
          body: JSON.stringify({
            prompt: claudeCodePrompt,
            model: this.modelId,
            ...(this.settings as Record<string, unknown>),
          }),
        },
      }

      return response
    } catch (error) {
      if (isClaudeCodeError(error)) {
        throw error
      }

      throw createClaudeCodeError(
        'process_error',
        'Unexpected error during Claude Code execution',
        {
          details: error,
        },
      )
    }
  }

  /**
   * Generate text using Claude Code (streaming)
   */
  async doStream(
    options: LanguageModelV1CallOptions,
  ): Promise<Awaited<ReturnType<LanguageModelV1['doStream']>>> {
    const { prompt, abortSignal, mode } = options
    // @ts-ignore mode is deprecated but still needed for object generation
    const warnings: LanguageModelV1CallWarning[] = []

    try {
      // Convert prompt to Claude Code format
      let claudeCodePrompt = convertToClaudeCodePrompt(prompt)

      // Handle object generation mode
      if (mode?.type === 'object-json' || mode?.type === 'object-tool') {
        const schema =
          mode.type === 'object-json' ? mode.schema : mode.tool.parameters
        claudeCodePrompt += `\n\nIMPORTANT: Respond with valid JSON that matches this schema:\n${JSON.stringify(schema, null, 2)}`
        claudeCodePrompt +=
          '\n\nYour response should be ONLY the JSON object, without any additional text, code blocks, or formatting. Do not wrap it in ```json``` blocks.'
      }

      // Prepare process options
      const processOptions = this.buildProcessOptions(claudeCodePrompt, options)

      // Force streaming output
      Object.assign(processOptions, { outputFormat: 'stream-json' })

      // Execute Claude Code using official SDK
      const sdk = new ClaudeCodeSDK(processOptions)

      // Handle abort signal
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          sdk.kill()
        })
      }

      const streamGenerator = sdk.executeStreaming()

      // Transform Claude Code stream to LanguageModelV1StreamPart
      const self = this
      const stream = new ReadableStream<LanguageModelV1StreamPart>({
        async start(controller) {
          let hasStarted = false
          let currentText = ''

          try {
            for await (const chunk of streamGenerator) {
              const { data, done } = chunk

              // Send response metadata on first chunk
              if (
                !hasStarted &&
                data.type === 'system' &&
                data.subtype === 'init'
              ) {
                hasStarted = true
                controller.enqueue({
                  type: 'response-metadata',
                  id: generateId(),
                  timestamp: new Date(),
                })
              }

              // Handle assistant messages (text deltas)
              if (data.type === 'assistant') {
                // For streaming, we'll send the entire message as a text delta
                // In a more sophisticated implementation, you might parse incremental updates
                const messageText = JSON.stringify(data.message)
                if (messageText !== currentText) {
                  const delta = messageText.slice(currentText.length)
                  if (delta) {
                    controller.enqueue({
                      type: 'text-delta',
                      textDelta: delta,
                    })
                    currentText = messageText
                  }
                }
              }

              // Handle completion
              if (done || data.type === 'result') {
                const finishReason = self.mapFinishReason(
                  data.type === 'result' && data.subtype === 'success'
                    ? 'success'
                    : 'error',
                )

                controller.enqueue({
                  type: 'finish',
                  finishReason,
                  usage: {
                    promptTokens: Number.NaN,
                    completionTokens: Number.NaN,
                  },
                })
                break
              }
            }
          } catch (error) {
            if (isClaudeCodeError(error)) {
              controller.enqueue({
                type: 'error',
                error: error.message,
              })
            } else {
              controller.enqueue({
                type: 'error',
                error: 'Unexpected error during streaming',
              })
            }
          } finally {
            controller.close()
          }
        },
      })

      return {
        stream,
        rawCall: {
          rawPrompt: claudeCodePrompt,
          rawSettings: this.settings as Record<string, unknown>,
        },
        rawResponse: {
          headers: {},
        },
        warnings,
        request: {
          body: JSON.stringify({
            prompt: claudeCodePrompt,
            model: this.modelId,
            ...(this.settings as Record<string, unknown>),
          }),
        },
      }
    } catch (error) {
      if (isClaudeCodeError(error)) {
        throw error
      }

      throw createClaudeCodeError(
        'process_error',
        'Unexpected error during Claude Code streaming',
        {
          details: error,
        },
      )
    }
  }

  /**
   * Build process options from call options
   */
  private buildProcessOptions(
    prompt: string,
    _callOptions: LanguageModelV1CallOptions,
  ) {
    const args: string[] = []

    // Add model if specified
    if (this.modelId) {
      args.push('--model', this.modelId)
    }

    // Add settings-based arguments
    if (this.settings.maxTurns !== undefined) {
      args.push('--max-turns', this.settings.maxTurns.toString())
    }

    if (this.settings.systemPrompt) {
      args.push('--system-prompt', this.settings.systemPrompt)
    }

    if (this.settings.appendSystemPrompt) {
      args.push('--append-system-prompt', this.settings.appendSystemPrompt)
    }

    if (this.settings.allowedTools && this.settings.allowedTools.length > 0) {
      args.push('--allowedTools', this.settings.allowedTools.join(','))
    }

    if (
      this.settings.disallowedTools &&
      this.settings.disallowedTools.length > 0
    ) {
      args.push('--disallowedTools', this.settings.disallowedTools.join(','))
    }

    if (
      this.settings.permissionMode &&
      this.settings.permissionMode !== 'default'
    ) {
      args.push('--permission-mode', this.settings.permissionMode)
    }

    if (this.settings.mcpConfig) {
      args.push('--mcp-config', this.settings.mcpConfig)
    }

    if (this.settings.permissionPromptTool) {
      args.push('--permission-prompt-tool', this.settings.permissionPromptTool)
    }

    if (this.settings.sessionId) {
      args.push('--resume', this.settings.sessionId)
    }

    if (this.settings.continue) {
      args.push('--continue')
    }

    if (this.settings.verbose) {
      args.push('--verbose')
    }

    // Build options object
    const processOptions = {
      prompt,
      outputFormat: 'text' as const,
      args,
      verbose: this.settings.verbose ?? false,
    }

    // Add optional fields only if they are defined
    if (this.settings.cwd !== undefined) {
      Object.assign(processOptions, { cwd: this.settings.cwd })
    }
    if (this.settings.claudeCodeExecutable !== undefined) {
      Object.assign(processOptions, {
        executable: this.settings.claudeCodeExecutable,
      })
    }
    if (this.settings.env !== undefined) {
      Object.assign(processOptions, { env: this.settings.env })
    }
    if (this.settings.timeout !== undefined) {
      Object.assign(processOptions, { timeout: this.settings.timeout })
    }

    return processOptions
  }

  /**
   * Map Claude Code results to LanguageModelV1FinishReason
   */
  private mapFinishReason(reason: string): LanguageModelV1FinishReason {
    switch (reason) {
      case 'success':
        return 'stop'
      case 'error_max_turns':
        return 'length'
      case 'error_during_execution':
        return 'error'
      default:
        return 'unknown'
    }
  }
}
