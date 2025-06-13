# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript library project for building a Claude Code AI provider. The project uses modern tooling with pnpm workspaces, Biome for linting, and tsup for building.

## Development Commands

- `pnpm build` - Build the TypeScript library to ESM format with type declarations
- `pnpm lint` - Run Biome linting checks
- `pnpm format` - Format code with Biome
- `pnpm prettier` - Format code with Prettier (handles import organization)
- `pnpm prettier:check` - Check Prettier formatting without making changes
- `pnpm test` - Run tests (currently placeholder)

## Code Architecture

### Build System

- **tsup**: Builds TypeScript to ESM format in `/dist` directory
- **pnpm**: Package manager with workspace configuration
- **Entry point**: `src/index.ts` exports the main library interface

### Code Quality

- **Biome**: Primary linting with recommended rules, `useAwait` rule set to error
- **Prettier**: Formatting with no semicolons, single quotes, trailing commas
- **Import organization**: Handled by Prettier plugin, not Biome

### Project Structure

- `src/` - Source TypeScript files
- `dist/` - Built output (ESM + type declarations)
- Currently minimal structure with single entry point

## Development Notes

- This project is in early development stages
- No TypeScript configuration file exists yet - may need to be created
- Test framework not yet implemented
- Uses modern ES modules output format
- Reference code will be placed in the `z/` directory for implementation guidance
