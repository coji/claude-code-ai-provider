import { describe, expect, it } from 'vitest'
import { claudeCode, createClaudeCode } from '../claude-code-provider'

describe('ClaudeCodeProvider', () => {
  it('should create provider with default settings', () => {
    const provider = createClaudeCode()
    expect(provider).toBeDefined()
    expect(typeof provider).toBe('function')
  })

  it('should create provider with custom settings', () => {
    const provider = createClaudeCode({
      timeout: 60000,
      verbose: true,
    })
    expect(provider).toBeDefined()
    expect(typeof provider).toBe('function')
  })

  it('should create model with default model ID', () => {
    const provider = createClaudeCode()
    const model = provider('sonnet')
    expect(model).toBeDefined()
    expect(model.modelId).toBe('sonnet')
    expect(model.provider).toBe('claude-code')
  })

  it('should create model with custom settings', () => {
    const provider = createClaudeCode()
    const model = provider('opus', {
      maxTurns: 3,
      systemPrompt: 'You are a helpful assistant.',
    })
    expect(model).toBeDefined()
    expect(model.modelId).toBe('opus')
    expect(model.provider).toBe('claude-code')
  })

  it('should export default instance', () => {
    const model = claudeCode('haiku')
    expect(model).toBeDefined()
    expect(model.modelId).toBe('haiku')
    expect(model.provider).toBe('claude-code')
  })

  it('should accept all supported model aliases', () => {
    const provider = createClaudeCode()

    const sonnet = provider('sonnet')
    expect(sonnet.modelId).toBe('sonnet')

    const opus = provider('opus')
    expect(opus.modelId).toBe('opus')

    const haiku = provider('haiku')
    expect(haiku.modelId).toBe('haiku')
  })

  it('should accept specific model names', () => {
    const provider = createClaudeCode()

    const model = provider('claude-sonnet-4-20250514')
    expect(model.modelId).toBe('claude-sonnet-4-20250514')
  })

  it('should accept custom model names', () => {
    const provider = createClaudeCode()

    const model = provider('custom-model-name')
    expect(model.modelId).toBe('custom-model-name')
  })
})
