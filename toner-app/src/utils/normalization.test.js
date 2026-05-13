import { describe, it, expect } from 'vitest';
import { normalizeDescription, normalizeReference, getProductKey } from './normalization';

describe('normalization utilities', () => {
  describe('normalizeDescription', () => {
    it('should lowercase text', () => {
      expect(normalizeDescription('HELLO WORLD')).toBe('hello world');
    });

    it('should remove content in parentheses', () => {
      expect(normalizeDescription('HP CF217A (17A) Black')).toBe('hp cf217a black');
    });

    it('should normalize spaces', () => {
      expect(normalizeDescription('  HP    CF217A   ')).toBe('hp cf217a');
    });

    it('should handle null/undefined', () => {
      expect(normalizeDescription(null)).toBe('');
      expect(normalizeDescription(undefined)).toBe('');
    });
  });

  describe('normalizeReference', () => {
    it('should lowercase and remove non-alphanumeric chars', () => {
      expect(normalizeReference('CF217-A')).toBe('cf217a');
    });

    it('should handle numeric input', () => {
      expect(normalizeReference(12345)).toBe('12345');
    });

    it('should handle null/undefined', () => {
      expect(normalizeReference(null)).toBe('');
      expect(normalizeReference(undefined)).toBe('');
    });
  });

  describe('getProductKey', () => {
    it('should use normalized reference if present', () => {
      const item = { ref: 'CF217-A', desc: 'HP 17A Black' };
      expect(getProductKey(item)).toBe('cf217a');
    });

    it('should use normalized description if reference is missing', () => {
      const item = { ref: '', desc: 'HP 17A Black (NEW)' };
      expect(getProductKey(item)).toBe('hp 17a black');
    });

    it('should handle missing both ref and desc', () => {
      const item = { ref: null, desc: null };
      expect(getProductKey(item)).toBe('');
    });
  });
});
