#!/usr/bin/env node

import { streamText } from 'ai'
import { createClaudeCode } from '../dist/index.js'

const claudeCode = createClaudeCode({
  maxTurns: 5,
  allowedTools: ['Read', 'Write', 'Bash', 'Edit'],
  sessionId: 'streaming-session',
})

async function main() {
  const prompt = process.argv[2] || 'Write a simple Python hello world script'

  try {
    console.log('🤖 Streaming from Claude Code...\n')

    const { textStream } = await streamText({
      model: claudeCode('claude-3-5-sonnet-20241022'),
      prompt,
    })

    process.stdout.write('📝 Response: ')
    for await (const textPart of textStream) {
      process.stdout.write(textPart)
    }
    console.log('\n')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
