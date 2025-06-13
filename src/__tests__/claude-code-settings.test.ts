import { describe, expect, it } from 'vitest'
import type {
  ClaudeCodeModelAlias,
  ClaudeCodeModelId,
  ClaudeCodeModelName,
} from '../claude-code-settings'

describe('ClaudeCodeSettings Types', () => {
  it('should accept valid model aliases', () => {
    const aliases: ClaudeCodeModelAlias[] = ['sonnet', 'opus', 'haiku']
    expect(aliases).toEqual(['sonnet', 'opus', 'haiku'])
  })

  it('should accept valid model names', () => {
    const names: ClaudeCodeModelName[] = [
      'claude-sonnet-4-20250514',
      'claude-opus-4-20250514',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
    ]
    expect(names).toHaveLength(4)
  })

  it('should accept model IDs as union type', () => {
    const modelIds: ClaudeCodeModelId[] = [
      'sonnet', // alias
      'claude-sonnet-4-20250514', // specific name
      'custom-model', // custom string
    ]
    expect(modelIds).toHaveLength(3)
  })

  it('should type-check model aliases correctly', () => {
    const checkAlias = (alias: ClaudeCodeModelAlias): boolean => {
      return ['sonnet', 'opus', 'haiku'].includes(alias)
    }

    expect(checkAlias('sonnet')).toBe(true)
    expect(checkAlias('opus')).toBe(true)
    expect(checkAlias('haiku')).toBe(true)
  })

  it('should type-check model names correctly', () => {
    const checkModelName = (name: ClaudeCodeModelName): boolean => {
      return name.startsWith('claude-')
    }

    expect(checkModelName('claude-sonnet-4-20250514')).toBe(true)
    expect(checkModelName('claude-opus-4-20250514')).toBe(true)
    expect(checkModelName('claude-3-5-sonnet-20241022')).toBe(true)
    expect(checkModelName('claude-3-5-haiku-20241022')).toBe(true)
  })
})
