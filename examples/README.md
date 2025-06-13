# Examples

Simple CLI examples showing how to use the Claude Code AI Provider.

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

## Usage

### Simple Text Generation

```bash
# Default prompt
pnpm run simple

# Custom prompt
pnpm run simple "Help me write a TypeScript function"
```

### Streaming Text Generation

```bash
# Default prompt
pnpm run streaming

# Custom prompt
pnpm run streaming "Create a React component with TypeScript"
```

### Direct Node.js

```bash
node simple-cli.js "What files are in this directory?"
node streaming-cli.js "Explain this code and suggest improvements"
```

## Examples

- `simple-cli.js` - Basic text generation
- `streaming-cli.js` - Streaming text generation with real-time output
