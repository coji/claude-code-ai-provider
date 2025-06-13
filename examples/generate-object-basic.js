#!/usr/bin/env node

import { generateObject } from 'ai'
import { z } from 'zod'
import { createClaudeCode } from '../dist/index.js'

const claudeCode = createClaudeCode()

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
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
