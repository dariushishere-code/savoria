import { describe, expect, it } from 'vitest';
import { createCommentSchema, loginSchema, ratingSchema, recipeSearchSchema, registerSchema } from '@savoria/validation';

describe('request validation', () => {
  it('accepts a strong registration payload', () => {
    expect(registerSchema.parse({ email: 'cook@example.com', password: 'Kitchen9', name: 'Home Cook' }).email).toBe('cook@example.com');
  });

  it('rejects weak credentials and invalid ratings', () => {
    expect(() => loginSchema.parse({ email: 'cook@example.com', password: '' })).toThrow();
    expect(() => registerSchema.parse({ email: 'cook@example.com', password: 'password', name: 'Home Cook' })).toThrow();
    expect(() => ratingSchema.parse({ score: 6 })).toThrow();
  });

  it('supports multi-dimensional recipe search filters and trims comments', () => {
    const search = recipeSearchSchema.parse({ q: 'butter chicken', cuisine: ['indian'], ingredient: 'tomato', pageSize: 10 });
    expect(search.q).toBe('butter chicken');
    expect(search.pageSize).toBe(10);
    expect(createCommentSchema.parse({ content: '  Excellent texture.  ' }).content).toBe('Excellent texture.');
  });
});
