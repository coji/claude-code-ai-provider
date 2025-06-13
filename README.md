# Claude Code AI Provider

A [Vercel AI SDK](https://github.com/vercel/ai) community provider for [Claude Code](https://claude.ai/code) CLI integration.

This provider allows you to use Claude Code as a language model within the Vercel AI SDK ecosystem, enabling you to leverage Claude Code's powerful coding capabilities programmatically.

## Features

- 🔌 **Vercel AI SDK Compatible**: Drop-in replacement for other AI providers
- 🚀 **Claude Code Integration**: Direct integration with Claude Code CLI
- 📺 **Streaming Support**: Real-time streaming responses
- 🛠️ **Tool Support**: Access to Claude Code's powerful development tools
- ⚙️ **Configurable**: Extensive configuration options for Claude Code CLI
- 🔄 **Session Management**: Support for multi-turn conversations with session continuity

## Installation

```bash
npm install claude-code-ai-provider
# or
pnpm add claude-code-ai-provider
# or
yarn add claude-code-ai-provider
```

## Prerequisites

- Claude Code CLI must be installed and available in your PATH
- Valid Anthropic API key configured for Claude Code

Install Claude Code CLI:

```bash
npm install -g @anthropic-ai/claude-code
```

## Quick Start

### Basic Usage

```typescript
import { createClaudeCode } from 'claude-code-ai-provider'
import { generateText } from 'ai'

const claudeCode = createClaudeCode()

const { text } = await generateText({
  model: claudeCode('claude-3-5-sonnet-20241022'),
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
  model: claudeCode('claude-3-5-sonnet-20241022'),
  prompt: 'Create a React component for a todo list',
})

for await (const delta of textStream) {
  process.stdout.write(delta)
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
const model = claudeCode('claude-3-5-sonnet-20241022', {
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

## Advanced Usage

### Multi-turn Conversations

```typescript
import { createClaudeCode } from 'claude-code-ai-provider'
import { generateText } from 'ai'

const claudeCode = createClaudeCode()

// First turn
const { text: response1 } = await generateText({
  model: claudeCode('claude-3-5-sonnet-20241022', {
    sessionId: 'my-project-session',
  }),
  prompt: 'Create a new React project structure',
})

// Continue the same session
const { text: response2 } = await generateText({
  model: claudeCode('claude-3-5-sonnet-20241022', {
    sessionId: 'my-project-session',
    continue: true,
  }),
  prompt: 'Now add TypeScript configuration',
})
```

### Tool Management

```typescript
const model = claudeCode('claude-3-5-sonnet-20241022', {
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

## Error Handling

```typescript
import { createClaudeCode, isClaudeCodeError } from 'claude-code-ai-provider'
import { generateText } from 'ai'

const claudeCode = createClaudeCode()

try {
  const { text } = await generateText({
    model: claudeCode('claude-3-5-sonnet-20241022'),
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

## Development

### Building

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

### Linting

```bash
pnpm lint
pnpm format
```

## Contributing

Contributions are welcome! Please read the contributing guidelines and submit pull requests.

## License

MIT License - see LICENSE file for details.

## Related

- [Vercel AI SDK](https://github.com/vercel/ai) - The AI SDK this provider integrates with
- [Claude Code](https://claude.ai/code) - The Claude Code CLI tool
- [Anthropic](https://anthropic.com) - The company behind Claude
