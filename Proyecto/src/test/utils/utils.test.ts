import { cn } from '@/lib/utils';
import { describe, expect, it } from 'vitest';

describe('Utils', () => {
  describe('cn function', () => {
    it('merges class names correctly', () => {
      const result = cn('bg-red-500', 'text-white');
      expect(result).toContain('bg-red-500');
      expect(result).toContain('text-white');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
    });

    it('handles undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'other-class');
      expect(result).toContain('base-class');
      expect(result).toContain('other-class');
    });

    it('handles empty strings', () => {
      const result = cn('base-class', '', 'other-class');
      expect(result).toContain('base-class');
      expect(result).toContain('other-class');
    });
  });
});
