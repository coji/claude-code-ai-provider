import { generateText, streamText } from 'ai'
import { describe, expect, it } from 'vitest'
import { createClaudeCode } from '../../src/index.js'

const claudeCode = createClaudeCode({
  allowedTools: ['Read', 'Write', 'Bash'],
})

describe('Response Format Integration Tests', () => {
  it('should return text as string in generateText', async () => {
    const result = await generateText({
      model: claudeCode('sonnet'),
      prompt: 'Just say "hello" and nothing else.',
    })

    // Text should be a string, not an array
    expect(typeof result.text).toBe('string')
    expect(result.text).toBeTruthy()
    expect(result.text.toLowerCase()).toContain('hello')

    // Should have proper response structure
    expect(result).toHaveProperty('finishReason')
    expect(result).toHaveProperty('usage')
    expect(result).toHaveProperty('response')

    // finishReason should be 'stop'
    expect(result.finishReason).toBe('stop')
  }, 60000)

  it('should extract text properly from Anthropic content array format', async () => {
    const result = await generateText({
      model: claudeCode('sonnet'),
      prompt: 'Respond with exactly: "Test message for content extraction"',
    })

    expect(typeof result.text).toBe('string')
    expect(result.text).toContain('Test message for content extraction')
  }, 60000)

  it('should handle streaming text properly', async () => {
    const chunks: string[] = []
    let fullText = ''

    const result = streamText({
      model: claudeCode('sonnet'),
      prompt: 'Say "streaming test" and nothing else.',
    })

    for await (const chunk of result.textStream) {
      chunks.push(chunk)
      fullText += chunk
    }

    // Should have received text chunks
    expect(chunks.length).toBeGreaterThan(0)
    expect(fullText).toBeTruthy()
    expect(typeof fullText).toBe('string')
    expect(fullText.toLowerCase()).toContain('streaming')
  }, 60000)

  it('should have consistent format between generateText and streamText', async () => {
    const prompt = 'Say "consistency test"'

    const generateResult = await generateText({
      model: claudeCode('sonnet'),
      prompt,
    })

    const streamResult = streamText({
      model: claudeCode('sonnet'),
      prompt,
    })

    let streamedText = ''
    for await (const chunk of streamResult.textStream) {
      streamedText += chunk
    }

    // Both should return strings
    expect(typeof generateResult.text).toBe('string')
    expect(typeof streamedText).toBe('string')

    // Both should have content
    expect(generateResult.text).toBeTruthy()
    expect(streamedText).toBeTruthy()
  }, 60000)
})
