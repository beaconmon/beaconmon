import { describe, it, expect } from 'vitest';
import {
  PROSPECT_TAG_PREFIX,
  extractProspectSlug,
  formatProspectTag,
  groupByProspect,
  isValidProspectSlug,
  parseProspectTag,
  slugifyProspect,
} from './prospect-tags';

describe('prospect-tags', () => {
  describe('isValidProspectSlug', () => {
    it('accepts lowercase hyphenated slugs', () => {
      expect(isValidProspectSlug('lumi-skincare')).toBe(true);
      expect(isValidProspectSlug('brand123')).toBe(true);
    });

    it('rejects uppercase, spaces, leading/trailing hyphens, double hyphens', () => {
      expect(isValidProspectSlug('Lumi-Skincare')).toBe(false);
      expect(isValidProspectSlug('lumi skincare')).toBe(false);
      expect(isValidProspectSlug('-lumi')).toBe(false);
      expect(isValidProspectSlug('lumi-')).toBe(false);
      expect(isValidProspectSlug('lumi--skincare')).toBe(false);
      expect(isValidProspectSlug('')).toBe(false);
    });
  });

  describe('format/parse round-trip', () => {
    it('formats with prefix and parses back', () => {
      const tag = formatProspectTag('lumi-skincare');
      expect(tag).toBe(`${PROSPECT_TAG_PREFIX}lumi-skincare`);
      expect(parseProspectTag(tag)).toBe('lumi-skincare');
    });

    it('parseProspectTag returns null for non-prospect tags', () => {
      expect(parseProspectTag('production')).toBeNull();
      expect(parseProspectTag('prospect:')).toBeNull();
      expect(parseProspectTag('prospect:Invalid Slug')).toBeNull();
    });
  });

  describe('extractProspectSlug', () => {
    it('returns the first prospect slug found', () => {
      expect(extractProspectSlug(['production', 'prospect:lumi-skincare', 'us-east'])).toBe('lumi-skincare');
    });

    it('returns null when no prospect tag present', () => {
      expect(extractProspectSlug(['production', 'us-east'])).toBeNull();
      expect(extractProspectSlug([])).toBeNull();
    });
  });

  describe('slugifyProspect', () => {
    it('lowercases and hyphenates free text', () => {
      expect(slugifyProspect('Lumi Skincare')).toBe('lumi-skincare');
      expect(slugifyProspect("Paula's Choice")).toBe('paula-s-choice');
    });

    it('returns null for inputs that cannot be slugified', () => {
      expect(slugifyProspect('   ')).toBeNull();
      expect(slugifyProspect('!!!')).toBeNull();
    });
  });

  describe('groupByProspect', () => {
    it('groups monitors by prospect slug; untagged monitors land under null', () => {
      const monitors = [
        { id: 'm1', tags: ['prospect:lumi-skincare'] },
        { id: 'm2', tags: ['prospect:lumi-skincare', 'production'] },
        { id: 'm3', tags: ['prospect:other-brand'] },
        { id: 'm4', tags: ['production'] },
      ];
      const grouped = groupByProspect(monitors);
      expect(grouped.get('lumi-skincare')?.map((m) => m.id)).toEqual(['m1', 'm2']);
      expect(grouped.get('other-brand')?.map((m) => m.id)).toEqual(['m3']);
      expect(grouped.get(null)?.map((m) => m.id)).toEqual(['m4']);
    });
  });
});
