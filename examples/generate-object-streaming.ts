#!/usr/bin/env tsx

import { streamObject } from 'ai'
import { z } from 'zod'
import { createClaudeCode } from '../dist/index.js'

const claudeCode = createClaudeCode()

async function main(): Promise<void> {
  try {
    console.log('🤖 Streaming story outline generation with Claude Code...\n')

    const { partialObjectStream } = await streamObject({
      model: claudeCode('sonnet'),
      schema: z.object({
        story: z.object({
          title: z.string(),
          genre: z.enum([
            'fantasy',
            'sci-fi',
            'mystery',
            'romance',
            'thriller',
          ]),
          characters: z.array(
            z.object({
              name: z.string(),
              role: z.enum(['protagonist', 'antagonist', 'supporting']),
              description: z.string(),
            }),
          ),
          plot: z.object({
            setting: z.string(),
            conflict: z.string(),
            resolution: z.string(),
          }),
          chapters: z.array(
            z.object({
              title: z.string(),
              summary: z.string(),
              wordCount: z.number(),
            }),
          ),
        }),
      }),
      prompt:
        'Create a detailed outline for a short fantasy story about a young wizard discovering their powers.',
    })

    console.log('✨ Streaming Story Outline Generation:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    for await (const partialObject of partialObjectStream) {
      // Clear previous output and show current state
      process.stdout.write('\x1b[2J\x1b[0f') // Clear screen and move cursor to top
      console.log('✨ Streaming Story Outline Generation:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      console.log(JSON.stringify(partialObject, null, 2))
      console.log('\n⏳ Generating...')
    }

    console.log('\n🎉 Story outline generation complete!')
  } catch (error) {
    console.error('❌ Error:', (error as Error).message)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
})