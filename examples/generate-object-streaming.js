#!/usr/bin/env node

import { createClaudeCode } from '../dist/index.js'

const claudeCode = createClaudeCode()

async function main() {
  try {
    console.log('🤖 Generating story outline with Claude Code...\n')
    console.log('Note: This example uses non-streaming object generation.')
    console.log('For true streaming, implement custom streaming with doStream method.\n')

    const model = claudeCode('sonnet')
    
    const result = await model.doGenerate({
      prompt: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Create a detailed outline for a short fantasy story about a young wizard discovering their powers.',
            },
          ],
        },
      ],
      mode: {
        type: 'object-json',
        schema: {
          type: 'object',
          properties: {
            story: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                genre: { type: 'string', enum: ['fantasy', 'sci-fi', 'mystery', 'romance', 'thriller'] },
                characters: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      role: { type: 'string', enum: ['protagonist', 'antagonist', 'supporting'] },
                      description: { type: 'string' },
                    },
                    required: ['name', 'role', 'description'],
                  },
                },
                plot: {
                  type: 'object',
                  properties: {
                    setting: { type: 'string' },
                    conflict: { type: 'string' },
                    resolution: { type: 'string' },
                  },
                  required: ['setting', 'conflict', 'resolution'],
                },
                chapters: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      summary: { type: 'string' },
                      wordCount: { type: 'number' },
                    },
                    required: ['title', 'summary', 'wordCount'],
                  },
                },
              },
              required: ['title', 'genre', 'characters', 'plot', 'chapters'],
            },
          },
          required: ['story'],
        },
      },
    })

    console.log('✨ Generated Story Outline:')
    console.log(JSON.stringify(result.object, null, 2))
    console.log()
    console.log('🏁 Finish reason:', result.finishReason)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()