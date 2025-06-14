#!/usr/bin/env tsx

import { generateObject } from 'ai'
import { z } from 'zod'
import { claudeCode } from '../dist/index.js'

async function main() {
  try {
    console.log('🤖 Generating structured object with Claude Code...\n')

    const result = await generateObject({
      model: claudeCode('sonnet'),
      schema: z.object({
        recipe: z.object({
          name: z.string(),
          ingredients: z.array(
            z.object({
              name: z.string(),
              amount: z.string(),
            }),
          ),
          steps: z.array(z.string()),
          cookingTime: z.string(),
          servings: z.number(),
        }),
      }),
      prompt: 'Generate a simple pasta recipe.',
    })

    console.log('📝 Generated Recipe:')
    console.log(JSON.stringify(result.object, null, 2))
    console.log()
    console.log('📊 Usage:', result.usage)
    console.log('🏁 Finish reason:', result.finishReason)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
})
