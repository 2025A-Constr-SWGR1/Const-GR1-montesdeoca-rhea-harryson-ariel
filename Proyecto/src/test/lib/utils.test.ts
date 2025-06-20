import { cn } from '@/lib/utils';
import { describe, expect, it } from 'vitest';

describe('Utils - cn function', () => {
  it('should merge class names correctly', () => {
    const result = cn('bg-red-500', 'text-white');
    expect(result).toContain('bg-red-500');
    expect(result).toContain('text-white');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toContain('base-class');
    expect(result).toContain('active-class');
  });

  it('should handle conditional classes when false', () => {
    const isActive = false;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toContain('base-class');
    expect(result).not.toContain('active-class');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base-class', undefined, null, 'other-class');
    expect(result).toContain('base-class');
    expect(result).toContain('other-class');
  });

  it('should handle empty strings', () => {
    const result = cn('base-class', '', 'other-class');
    expect(result).toContain('base-class');
    expect(result).toContain('other-class');
  });

  it('should handle Tailwind merge conflicts', () => {
    const result = cn('p-4', 'p-6');
    // Tailwind merge should keep only the last conflicting class
    expect(result).toContain('p-6');
    expect(result).not.toContain('p-4');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['bg-red-500', 'text-white'], 'p-4');
    expect(result).toContain('bg-red-500');
    expect(result).toContain('text-white');
    expect(result).toContain('p-4');
  });

  it('should handle object syntax', () => {
    const result = cn({
      'bg-red-500': true,
      'text-white': true,
      'hidden': false,
    });
    expect(result).toContain('bg-red-500');
    expect(result).toContain('text-white');
    expect(result).not.toContain('hidden');
  });
});
