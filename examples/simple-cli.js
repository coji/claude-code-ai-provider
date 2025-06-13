#!/usr/bin/env node

import { generateText } from 'ai'
import { createClaudeCode } from '../dist/index.js'

const claudeCode = createClaudeCode({
  // Optional: configure Claude Code settings
  maxTurns: 3,
  allowedTools: ['Read', 'Write', 'Bash'],
  sessionId: 'example-session',
})

async function main() {
  const prompt = process.argv[2] || 'Hello! What can you help me with today?'

  try {
    console.log('🤖 Calling Claude Code...\n')

    const { text } = await generateText({
      model: claudeCode('claude-3-5-sonnet-20241022'),
      prompt,
    })

    console.log('📝 Response:')
    console.log(text)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
