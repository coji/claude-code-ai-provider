import { streamText } from 'ai'
import { describe, expect, it } from 'vitest'
import { createClaudeCode } from '../../src/index.js'

const claudeCode = createClaudeCode({
  allowedTools: ['Read', 'Write', 'Bash'],
})

describe('Streaming Format Integration Tests', () => {
  it('should stream plain text chunks, not objects', async () => {
    const chunks: string[] = []
    const chunkTypes: string[] = []
    
    const result = streamText({
      model: claudeCode('sonnet'),
      prompt: 'Say "Hello, streaming!" and nothing else.',
    })

    for await (const chunk of result.textStream) {
      chunks.push(chunk)
      chunkTypes.push(typeof chunk)
    }

    // All chunks should be strings
    expect(chunkTypes.every(type => type === 'string')).toBe(true)
    
    // Should have received actual text chunks
    expect(chunks.length).toBeGreaterThan(0)
    
    // Full text should be a proper string
    const fullText = chunks.join('')
    expect(typeof fullText).toBe('string')
    expect(fullText).toContain('Hello')
    expect(fullText).toContain('streaming')
    
    // No chunk should contain object-like structures
    chunks.forEach(chunk => {
      expect(chunk).not.toContain('[object Object]')
      expect(chunk).not.toContain('"type":')
      expect(chunk).not.toContain('"text":')
      expect(chunk).not.toContain('"content":')
    })
  }, 60000)

  it('should handle multi-line streaming responses as plain text', async () => {
    const chunks: string[] = []
    
    const result = streamText({
      model: claudeCode('sonnet'),
      prompt: 'Write exactly these two lines:\nLine 1: Hello\nLine 2: World',
    })

    for await (const chunk of result.textStream) {
      chunks.push(chunk)
      // Verify each chunk is a string
      expect(typeof chunk).toBe('string')
    }

    const fullText = chunks.join('')
    expect(fullText).toContain('Hello')
    expect(fullText).toContain('World')
    
    // Ensure no JSON structures leaked through
    expect(fullText).not.toMatch(/\{"type":/i)
    expect(fullText).not.toMatch(/\{"content":/i)
  }, 60000)

  it('should stream text incrementally without object wrappers', async () => {
    let previousLength = 0
    const incrementalText: string[] = []
    
    const result = streamText({
      model: claudeCode('sonnet'),
      prompt: 'Count from 1 to 3 like this: "1, 2, 3"',
    })

    for await (const chunk of result.textStream) {
      // Each chunk should be a plain string
      expect(typeof chunk).toBe('string')
      
      // Track incremental building of text
      incrementalText.push(chunk)
      const currentText = incrementalText.join('')
      
      // Text should be building incrementally
      expect(currentText.length).toBeGreaterThanOrEqual(previousLength)
      previousLength = currentText.length
    }

    const finalText = incrementalText.join('')
    expect(finalText).toMatch(/1.*2.*3/s)
  }, 60000)

  it('should not expose internal message structure in streaming', async () => {
    const result = streamText({
      model: claudeCode('sonnet'),
      prompt: 'Say "No objects here!" exactly.',
    })

    const chunks: string[] = []
    for await (const chunk of result.textStream) {
      chunks.push(chunk)
    }

    const fullText = chunks.join('')
    
    // Should contain the expected text
    expect(fullText).toContain('No objects here!')
    
    // Should NOT contain any signs of the internal message structure
    expect(fullText).not.toContain('"role":"assistant"')
    expect(fullText).not.toContain('"content":[')
    expect(fullText).not.toContain('"type":"text"')
    expect(fullText).not.toContain('"text":')
    expect(fullText).not.toContain('"message":')
    expect(fullText).not.toContain('[object Object]')
    
    // Should not contain any JSON-like structures
    expect(fullText).not.toMatch(/\{.*"type".*:.*"text".*\}/s)
  }, 60000)
})