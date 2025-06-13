#!/usr/bin/env node

import { createClaudeCode } from '../dist/index.js'

const claudeCode = createClaudeCode()

async function main() {
  try {
    console.log('🤖 Generating structured object with Claude Code...\n')

    const model = claudeCode('sonnet')
    
    // Use direct model call with object generation mode
    const result = await model.doGenerate({
      prompt: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Generate a simple pasta recipe.',
            },
          ],
        },
      ],
      mode: {
        type: 'object-json',
        schema: {
          type: 'object',
          properties: {
            recipe: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                ingredients: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      amount: { type: 'string' },
                    },
                    required: ['name', 'amount'],
                  },
                },
                steps: { type: 'array', items: { type: 'string' } },
                cookingTime: { type: 'string' },
                servings: { type: 'number' },
              },
              required: ['name', 'ingredients', 'steps', 'cookingTime', 'servings'],
            },
          },
          required: ['recipe'],
        },
      },
    })

    console.log('📝 Generated Recipe:')
    console.log(JSON.stringify(result.object, null, 2))
    console.log()
    console.log('🏁 Finish reason:', result.finishReason)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()