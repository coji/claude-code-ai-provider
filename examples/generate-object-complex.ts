#!/usr/bin/env tsx

import { generateObject } from 'ai'
import { z } from 'zod'
import { claudeCode } from '../dist/index.js'

async function main() {
  try {
    console.log('🤖 Generating complex structured object with Claude Code...\n')

    const result = await generateObject({
      model: claudeCode('sonnet'),
      schema: z.object({
        project: z.object({
          name: z.string(),
          description: z.string(),
          version: z.string(),
          author: z.object({
            name: z.string(),
            email: z.string().email(),
            website: z.string().url(),
          }),
          repository: z.object({
            type: z.enum(['git', 'svn', 'mercurial']),
            url: z.string().url(),
            branch: z.string().default('main'),
          }),
          dependencies: z.array(
            z.object({
              name: z.string(),
              version: z.string(),
              type: z.enum(['runtime', 'development', 'peer']),
              optional: z.boolean().default(false),
            }),
          ),
          scripts: z.record(z.string()),
          license: z.string(),
          keywords: z.array(z.string()),
          engines: z.object({
            node: z.string(),
            npm: z.string().optional(),
          }),
          config: z.object({
            build: z.object({
              outDir: z.string(),
              target: z.enum(['es5', 'es2015', 'es2020', 'esnext']),
              minify: z.boolean(),
              sourcemap: z.boolean(),
            }),
            test: z.object({
              framework: z.enum(['jest', 'vitest', 'mocha']),
              coverage: z.boolean(),
              watchMode: z.boolean(),
            }),
          }),
        }),
      }),
      prompt:
        'Generate a detailed package.json-like configuration for a modern TypeScript library project called "awesome-utils" that provides utility functions for web development.',
    })

    console.log('📝 Generated Project Configuration:')
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
