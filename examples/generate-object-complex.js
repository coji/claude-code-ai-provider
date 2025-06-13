#!/usr/bin/env node

import { createClaudeCode } from '../dist/index.js'

const claudeCode = createClaudeCode()

async function main() {
  try {
    console.log('🤖 Generating complex structured object with Claude Code...\n')

    const model = claudeCode('sonnet')
    
    const result = await model.doGenerate({
      prompt: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Generate a detailed package.json-like configuration for a modern TypeScript library project called "awesome-utils" that provides utility functions for web development.',
            },
          ],
        },
      ],
      mode: {
        type: 'object-json',
      schema: {
        type: 'object',
        properties: {
          project: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              version: { type: 'string' },
              author: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  website: { type: 'string', format: 'uri' },
                },
                required: ['name', 'email'],
              },
              repository: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['git', 'svn', 'mercurial'] },
                  url: { type: 'string', format: 'uri' },
                  branch: { type: 'string', default: 'main' },
                },
                required: ['type', 'url', 'branch'],
              },
              dependencies: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    version: { type: 'string' },
                    type: { type: 'string', enum: ['runtime', 'development', 'peer'] },
                    optional: { type: 'boolean', default: false },
                  },
                  required: ['name', 'version', 'type'],
                },
              },
              scripts: {
                type: 'object',
                additionalProperties: { type: 'string' },
              },
              license: { type: 'string' },
              keywords: {
                type: 'array',
                items: { type: 'string' },
              },
              engines: {
                type: 'object',
                properties: {
                  node: { type: 'string' },
                  npm: { type: 'string' },
                },
                required: ['node'],
              },
              config: {
                type: 'object',
                properties: {
                  build: {
                    type: 'object',
                    properties: {
                      outDir: { type: 'string' },
                      target: { type: 'string', enum: ['es5', 'es2015', 'es2020', 'esnext'] },
                      minify: { type: 'boolean' },
                      sourcemap: { type: 'boolean' },
                    },
                    required: ['outDir', 'target', 'minify', 'sourcemap'],
                  },
                  test: {
                    type: 'object',
                    properties: {
                      framework: { type: 'string', enum: ['jest', 'vitest', 'mocha'] },
                      coverage: { type: 'boolean' },
                      watchMode: { type: 'boolean' },
                    },
                    required: ['framework', 'coverage', 'watchMode'],
                  },
                },
                required: ['build', 'test'],
              },
            },
            required: ['name', 'description', 'version', 'author', 'repository', 'dependencies', 'scripts', 'license', 'keywords', 'engines', 'config'],
          },
        },
        required: ['project'],
      },
      },
    })

    console.log('📝 Generated Project Configuration:')
    console.log(JSON.stringify(result.object, null, 2))
    console.log()
    console.log('🏁 Finish reason:', result.finishReason)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()