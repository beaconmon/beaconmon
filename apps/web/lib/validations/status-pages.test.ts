import { describe, it, expect } from 'vitest';
import { createStatusPageSchema } from './status-pages';

describe('createStatusPageSchema', () => {
  it('accepts a valid slug', () => {
    const result = createStatusPageSchema.safeParse({ name: 'My Status', slug: 'my-status' });
    expect(result.success).toBe(true);
  });

  it('accepts slugs with numbers', () => {
    expect(createStatusPageSchema.safeParse({ name: 'Status 2', slug: 'status-2' }).success).toBe(true);
  });

  it('rejects uppercase letters', () => {
    expect(createStatusPageSchema.safeParse({ name: 'Status', slug: 'MyStatus' }).success).toBe(false);
  });

  it('rejects underscores', () => {
    expect(createStatusPageSchema.safeParse({ name: 'Status', slug: 'my_status' }).success).toBe(false);
  });

  it('rejects special characters', () => {
    expect(createStatusPageSchema.safeParse({ name: 'Status', slug: 'my.status' }).success).toBe(false);
  });

  it('rejects slug shorter than 3 chars', () => {
    expect(createStatusPageSchema.safeParse({ name: 'Status', slug: 'ab' }).success).toBe(false);
  });

  it('rejects slug longer than 50 chars', () => {
    expect(
      createStatusPageSchema.safeParse({ name: 'Status', slug: 'a'.repeat(51) }).success
    ).toBe(false);
  });

  it('rejects empty name', () => {
    expect(createStatusPageSchema.safeParse({ name: '', slug: 'valid-slug' }).success).toBe(false);
  });

  it('rejects name longer than 100 chars', () => {
    expect(
      createStatusPageSchema.safeParse({ name: 'x'.repeat(101), slug: 'valid-slug' }).success
    ).toBe(false);
  });
});
