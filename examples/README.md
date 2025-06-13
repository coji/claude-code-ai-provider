# Claude Code AI Provider Examples

This directory contains TypeScript examples demonstrating how to use the Claude Code AI Provider with the Vercel AI SDK.

## Setup

1. Build the main package:

   ```bash
   cd ..
   pnpm build
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Available Examples

### Basic Text Generation

- **`generate-text.ts`** - Basic text generation with Claude Code
- **`stream-text.ts`** - Streaming text responses

### Structured Object Generation

- **`generate-object.ts`** - Simple structured output (recipe generation)
- **`generate-object-complex.ts`** - Complex nested schemas (project configuration)
- **`stream-object.ts`** - Streaming object generation with real-time updates

## Running Examples

```bash
# Basic text generation
pnpm generate "Write a hello world function"

# Streaming text
pnpm stream "Explain async/await in JavaScript"

# Basic object generation
pnpm generate-object

# Complex object generation
pnpm generate-complex

# Streaming object generation
pnpm stream-object
```

## Example Features

### Text Generation

- Basic text generation with configurable Claude Code settings
- Real-time streaming responses
- Error handling and session management

### Structured Output

- Type-safe object generation using Zod schemas
- Complex nested data structures
- Real-time streaming object generation with partial updates
- Usage tracking and finish reason reporting

## TypeScript Features

- Full type safety with TypeScript
- Proper error handling with typed exceptions
- ESM-compatible imports
- Direct execution with `tsx` for development

## Configuration

Examples demonstrate various Claude Code configuration options:

- Session management
- Tool restrictions
- Turn limits
- Model selection

See individual example files for specific configuration patterns.
