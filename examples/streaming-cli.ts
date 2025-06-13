#!/usr/bin/env tsx

import { streamText } from 'ai'
import { createClaudeCode } from '../dist/index.js'

const claudeCode = createClaudeCode({
  allowedTools: ['Read', 'Write', 'Bash', 'Edit'],
})

async function main(): Promise<void> {
  const prompt = process.argv[2] || 'Write a simple Python hello world script'

  try {
    console.log('🤖 Streaming from Claude Code...\n')

    const { textStream } = await streamText({
      model: claudeCode('sonnet', {
        maxTurns: 5,
      }),
      prompt,
    })

    process.stdout.write('📝 Response: ')
    for await (const textPart of textStream) {
      process.stdout.write(textPart)
    }
    console.log('\n')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
})