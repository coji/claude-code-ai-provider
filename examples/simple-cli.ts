#!/usr/bin/env tsx

import { generateText } from 'ai'
import { createClaudeCode } from '../dist/index.js'

const claudeCode = createClaudeCode({
  // Optional: configure Claude Code provider settings
  allowedTools: ['Read', 'Write', 'Bash'],
})

async function main(): Promise<void> {
  const prompt = process.argv[2] || 'Hello! What can you help me with today?'

  try {
    console.log('🤖 Calling Claude Code...\n')

    const { text } = await generateText({
      model: claudeCode('sonnet', {
        maxTurns: 3,
      }),
      prompt,
    })

    console.log('📝 Response:')
    console.log(text)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
})
