# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript library project for building a Claude Code AI provider. The project uses modern tooling with pnpm workspaces, Biome for linting, and tsup for building.

## Development Commands

- `pnpm build` - Build the TypeScript library to ESM format with type declarations
- `pnpm lint` - Run Biome linting checks
- `pnpm format` - Check Prettier formatting without making changes
- `pnpm format:fix` - Format code with Prettier (handles import organization and code style)
- `pnpm test` - Run tests (currently placeholder)

## Code Architecture

### Build System

- **tsup**: Builds TypeScript to ESM format in `/dist` directory
- **pnpm**: Package manager with workspace configuration
- **Entry point**: `src/index.ts` exports the main library interface

### Code Quality

- **Biome**: Primary linting with recommended rules, `useAwait` rule set to error, organizeImports disabled
- **Prettier**: Code formatting with specific style preferences:
  - No semicolons (`semi: false`)
  - Single quotes (`singleQuote: true`)
  - Trailing commas everywhere (`trailingComma: "all"`)
  - Line width limit of 80 characters (`printWidth: 80`)
  - Import organization via `prettier-plugin-organize-imports`
- **TypeScript**: Strict configuration with `exactOptionalPropertyTypes` enabled

### Project Structure

- `src/` - Source TypeScript files
- `dist/` - Built output (ESM + type declarations)
- Currently minimal structure with single entry point

## Implementation Details

### Architecture

- **ClaudeCodeProcess**: Manages CLI process execution and communication
- **ClaudeCodeLanguageModel**: Implements LanguageModelV1 interface
- **ClaudeCodeProvider**: Factory for creating model instances
- **Message Conversion**: Converts between Vercel AI SDK and Claude Code formats

### Key Features Implemented

- Non-streaming and streaming text generation
- Claude Code CLI process management
- Session management for multi-turn conversations
- Tool configuration and permission management
- MCP (Model Context Protocol) integration
- Comprehensive error handling

### Development Notes

- Reference code available in `z/` directory
- Follows qwen-ai-provider patterns for community provider structure
- Uses modern ES modules with TypeScript declarations
- Supports all Claude Code CLI features through configuration
