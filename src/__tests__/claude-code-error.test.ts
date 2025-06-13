import { describe, expect, it } from 'vitest'
import {
  ClaudeCodeErrorSchema,
  createClaudeCodeError,
  isClaudeCodeError,
} from '../claude-code-error'

describe('ClaudeCodeError', () => {
  it('should create timeout error', () => {
    const error = createClaudeCodeError('timeout_error', 'Request timed out', {
      details: { timeout: 30000 },
    })

    expect(error.type).toBe('timeout_error')
    expect(error.message).toBe('Request timed out')
    expect((error.details as { timeout: number })?.timeout).toBe(30000)
  })

  it('should create process error', () => {
    const error = createClaudeCodeError(
      'process_error',
      'Claude Code execution failed',
      { sessionId: 'test-session' },
    )

    expect(error.type).toBe('process_error')
    expect(error.message).toBe('Claude Code execution failed')
    expect(error.sessionId).toBe('test-session')
  })

  it('should create parsing error', () => {
    const error = createClaudeCodeError(
      'parsing_error',
      'Invalid JSON response',
    )

    expect(error.type).toBe('parsing_error')
    expect(error.message).toBe('Invalid JSON response')
  })

  it('should create invalid response error', () => {
    const error = createClaudeCodeError(
      'invalid_response',
      'Response format invalid',
    )

    expect(error.type).toBe('invalid_response')
    expect(error.message).toBe('Response format invalid')
  })

  it('should identify claude code errors correctly', () => {
    const claudeCodeError = createClaudeCodeError(
      'timeout_error',
      'Request timed out',
    )
    const regularError = new Error('Regular error')

    expect(isClaudeCodeError(claudeCodeError)).toBe(true)
    expect(isClaudeCodeError(regularError)).toBe(false)
    expect(isClaudeCodeError(null)).toBe(false)
    expect(isClaudeCodeError(undefined)).toBe(false)
  })

  it('should validate error schema', () => {
    const validError = {
      error: {
        type: 'timeout_error',
        message: 'Request timed out',
        details: { timeout: 30000 },
      },
    }

    const result = ClaudeCodeErrorSchema.safeParse(validError)
    expect(result.success).toBe(true)
  })

  it('should reject invalid error schema', () => {
    const invalidError = {
      error: {
        type: 'invalid_type',
        message: 'Test error',
      },
    }

    const result = ClaudeCodeErrorSchema.safeParse(invalidError)
    expect(result.success).toBe(false)
  })

  it('should return ClaudeCodeError object with correct properties', () => {
    const error = createClaudeCodeError('process_error', 'Test error')
    expect(error).toHaveProperty('type')
    expect(error).toHaveProperty('message')
    expect(error.type).toBe('process_error')
    expect(error.message).toBe('Test error')
  })
})
