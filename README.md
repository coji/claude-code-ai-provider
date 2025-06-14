# Claude Code AI Provider

A [Vercel AI SDK](https://github.com/vercel/ai) community provider for [Claude Code](https://claude.ai/code) integration using the official TypeScript SDK.

This provider allows you to use Claude Code as a language model within the Vercel AI SDK ecosystem, powered by the official `@anthropic-ai/claude-code` TypeScript SDK for reliability and maintainability.

## Features

- 🔌 **Vercel AI SDK Compatible**: Drop-in replacement for other AI providers
- 🚀 **Official SDK Integration**: Built on `@anthropic-ai/claude-code` TypeScript SDK
- 📋 **Structured Output**: Generate type-safe JSON objects using schemas
- 📺 **Streaming Support**: Real-time streaming responses
- 🛠️ **Tool Support**: Access to Claude Code's powerful development tools
- ⚙️ **Configurable**: Extensive configuration options
- 🔄 **Session Management**: Support for multi-turn conversations

## Installation

```bash
npm install claude-code-ai-provider @anthropic-ai/claude-code
# or
pnpm add claude-code-ai-provider @anthropic-ai/claude-code
# or
yarn add claude-code-ai-provider @anthropic-ai/claude-code
```

> **Note**: `@anthropic-ai/claude-code` is a peer dependency. This ensures you can always use the latest version of Claude Code SDK without waiting for this provider to update.

## Prerequisites

- Claude Code CLI must be installed and available in your PATH
- Valid Anthropic API key configured for Claude Code
- Node.js 18+

Install Claude Code CLI:

```bash
npm install -g @anthropic-ai/claude-code
```

Configure your API key:

```bash
export ANTHROPIC_API_KEY=your-api-key
```

## Quick Start

### Basic Usage

```typescript
import { createClaudeCode } from 'claude-code-ai-provider'
import { generateText } from 'ai'

const claudeCode = createClaudeCode()

const { text } = await generateText({
  model: claudeCode('sonnet'), // or 'opus', 'haiku', or specific version like 'claude-sonnet-4-20250514'
  prompt: 'Write a function to calculate fibonacci numbers',
})

console.log(text)
```

### Streaming

```typescript
import { createClaudeCode } from 'claude-code-ai-provider'
import { streamText } from 'ai'

const claudeCode = createClaudeCode()

const { textStream } = await streamText({
  model: claudeCode('sonnet'),
  prompt: 'Create a React component for a todo list',
})

for await (const delta of textStream) {
  process.stdout.write(delta)
}
```

### Structured Output (Object Generation)

```typescript
import { generateObject } from 'ai'
import { z } from 'zod'
import { createClaudeCode } from 'claude-code-ai-provider'

const claudeCode = createClaudeCode()

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
      prepTime: z.string(),
      cookTime: z.string(),
      servings: z.number(),
    }),
  }),
  prompt: 'Generate a recipe for chocolate chip cookies',
})

console.log(JSON.stringify(result.object, null, 2))
```

### Streaming Object Generation

```typescript
import { streamObject } from 'ai'
import { z } from 'zod'
import { createClaudeCode } from 'claude-code-ai-provider'

const claudeCode = createClaudeCode()

const { partialObjectStream } = await streamObject({
  model: claudeCode('sonnet'),
  schema: z.object({
    story: z.object({
      title: z.string(),
      characters: z.array(
        z.object({
          name: z.string(),
          role: z.string(),
        }),
      ),
    }),
  }),
  prompt: 'Create a fantasy story outline',
})

for await (const partialObject of partialObjectStream) {
  console.log(JSON.stringify(partialObject, null, 2))
}
```

### Provider Configuration

```typescript
import { createClaudeCode } from 'claude-code-ai-provider'

const claudeCode = createClaudeCode({
  // Path to Claude Code executable (default: 'claude')
  claudeCodeExecutable: '/usr/local/bin/claude',

  // Working directory for Claude Code execution
  cwd: '/path/to/project',

  // Environment variables
  env: {
    ANTHROPIC_API_KEY: 'your-api-key',
  },

  // Timeout in milliseconds (default: 5 minutes)
  timeout: 300000,

  // Enable verbose logging
  verbose: true,

  // Permission mode
  permissionMode: 'acceptEdits',

  // Allowed tools
  allowedTools: ['Read', 'Write', 'Bash'],

  // MCP configuration
  mcpConfig: '/path/to/mcp-config.json',
})
```

### Model-Specific Settings

```typescript
const model = claudeCode('sonnet', {
  // Maximum conversation turns
  maxTurns: 5,

  // Custom system prompt
  systemPrompt:
    'You are a senior software engineer specializing in TypeScript.',

  // Session management
  sessionId: 'my-session-id',
  continue: true,

  // Tool restrictions
  allowedTools: ['Read', 'Write'],
  disallowedTools: ['Bash'],
})
```

## Configuration Options

### Provider Settings

| Option                 | Type                     | Default         | Description                        |
| ---------------------- | ------------------------ | --------------- | ---------------------------------- |
| `claudeCodeExecutable` | `string`                 | `"claude"`      | Path to Claude Code executable     |
| `cwd`                  | `string`                 | `process.cwd()` | Working directory                  |
| `env`                  | `Record<string, string>` | `process.env`   | Environment variables              |
| `timeout`              | `number`                 | `300000`        | Timeout in milliseconds            |
| `verbose`              | `boolean`                | `false`         | Enable verbose logging             |
| `permissionMode`       | `string`                 | `"default"`     | Permission mode for tool execution |
| `mcpConfig`            | `string`                 | -               | MCP configuration file path        |
| `allowedTools`         | `string[]`               | -               | Default allowed tools              |
| `disallowedTools`      | `string[]`               | -               | Default disallowed tools           |

### Model Settings

| Option                 | Type       | Default | Description                              |
| ---------------------- | ---------- | ------- | ---------------------------------------- |
| `maxTurns`             | `number`   | -       | Maximum conversation turns               |
| `systemPrompt`         | `string`   | -       | Custom system prompt                     |
| `appendSystemPrompt`   | `string`   | -       | Additional system prompt                 |
| `sessionId`            | `string`   | -       | Session ID for conversation continuation |
| `continue`             | `boolean`  | `false` | Continue latest conversation             |
| `allowedTools`         | `string[]` | -       | Allowed tools for this model             |
| `disallowedTools`      | `string[]` | -       | Disallowed tools for this model          |
| `permissionPromptTool` | `string`   | -       | MCP tool for permission prompts          |

## Supported Models

### Model Aliases (Latest Versions)

- `sonnet` - Claude Sonnet 4 (latest: `claude-sonnet-4-20250514`)
- `opus` - Claude Opus 4 (latest: `claude-opus-4-20250514`)
- `haiku` - Claude 3.5 Haiku (latest: `claude-3-5-haiku-20241022`)

### Specific Model Versions

- `claude-sonnet-4-20250514` - Claude Sonnet 4 (May 2025)
- `claude-opus-4-20250514` - Claude Opus 4 (May 2025)
- `claude-3-5-sonnet-20241022` - Claude 3.5 Sonnet (October 2024)
- `claude-3-5-haiku-20241022` - Claude 3.5 Haiku (October 2024)

### Custom Models

Any string can be used as a model ID for custom or future models.

## Advanced Usage

### Multi-turn Conversations

```typescript
import { createClaudeCode } from 'claude-code-ai-provider'
import { generateText } from 'ai'

const claudeCode = createClaudeCode()

// First turn
const { text: response1 } = await generateText({
  model: claudeCode('sonnet', {
    sessionId: 'my-project-session',
  }),
  prompt: 'Create a new React project structure',
})

// Continue the same session
const { text: response2 } = await generateText({
  model: claudeCode('sonnet', {
    sessionId: 'my-project-session',
    continue: true,
  }),
  prompt: 'Now add TypeScript configuration',
})
```

### Tool Management

```typescript
const model = claudeCode('sonnet', {
  // Allow specific tools
  allowedTools: [
    'Read',
    'Write',
    'Bash(npm install)', // Allow specific bash commands
    'mcp__filesystem__read_file', // Allow MCP tools
  ],

  // Disallow specific tools
  disallowedTools: [
    'Bash(rm -rf)', // Disallow dangerous commands
  ],

  // Permission mode
  permissionMode: 'acceptEdits',
})
```

### MCP Integration

```typescript
const claudeCode = createClaudeCode({
  mcpConfig: './mcp-servers.json',
  allowedTools: ['mcp__github__create_issue', 'mcp__slack__send_message'],
  permissionPromptTool: 'mcp__permissions__approve',
})
```

## Examples

The `examples/` directory contains complete TypeScript examples:

### Text Generation

- **`generate-text.ts`** - Basic text generation with configuration
- **`stream-text.ts`** - Real-time streaming responses

### Structured Output

- **`generate-object.ts`** - Simple structured output (recipe)
- **`generate-object-complex.ts`** - Complex nested schemas (project config)
- **`stream-object.ts`** - Streaming object generation

Run examples:

```bash
cd examples
pnpm install

# Run TypeScript examples directly
pnpm generate "Write a hello world function"
pnpm stream "Explain async/await"
pnpm generate-object
```

## Error Handling

```typescript
import { createClaudeCode, isClaudeCodeError } from 'claude-code-ai-provider'
import { generateText } from 'ai'

const claudeCode = createClaudeCode()

try {
  const { text } = await generateText({
    model: claudeCode('sonnet'),
    prompt: 'Write some code',
  })
  console.log(text)
} catch (error) {
  if (isClaudeCodeError(error)) {
    console.error(`Claude Code Error (${error.type}): ${error.message}`)
    if (error.sessionId) {
      console.error(`Session ID: ${error.sessionId}`)
    }
  } else {
    console.error('Unexpected error:', error)
  }
}
```

### Error Types

- `timeout_error` - Request exceeded timeout limit
- `process_error` - Claude Code execution failed
- `parsing_error` - Failed to parse response
- `invalid_response` - Invalid response format

## Development

### Building

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

### Linting & Formatting

```bash
pnpm lint       # Run Biome linter
pnpm format     # Check formatting
pnpm format:fix # Fix formatting
```

## Architecture

This provider is built on top of the official `@anthropic-ai/claude-code` TypeScript SDK:

```
claude-code-ai-provider
├── ClaudeCodeLanguageModel (Vercel AI SDK interface)
├── ClaudeCodeSDK (Official SDK wrapper)
├── MessageConverter (SDK ↔ AI SDK conversion)
└── StreamConverter (Streaming support)
```

## Contributing

Contributions are welcome! Please read the contributing guidelines and submit pull requests.

## License

MIT License - see LICENSE file for details.

## Related

- [Vercel AI SDK](https://github.com/vercel/ai) - The AI SDK this provider integrates with
- [Claude Code](https://claude.ai/code) - The Claude Code CLI tool
- [@anthropic-ai/claude-code](https://www.npmjs.com/package/@anthropic-ai/claude-code) - Official TypeScript SDK
- [Anthropic](https://anthropic.com) - The company behind Claude
