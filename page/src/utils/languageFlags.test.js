import { describe, expect, it } from 'vitest';
import { orderTagsForDisplay } from './languageFlags';

describe('orderTagsForDisplay', () => {
  it('puts language flags after the other tags', () => {
    const tags = [
      { key: 'language', value: 'french' },
      'kubernetes',
      { key: 'language', value: 'english' },
      { key: 'type', value: 'conference' },
    ];

    expect(orderTagsForDisplay(tags)).toEqual([
      'kubernetes',
      { key: 'type', value: 'conference' },
      { key: 'language', value: 'french' },
      { key: 'language', value: 'english' },
    ]);
  });

  it('keeps a language without a flag with the other tags', () => {
    const tags = [{ key: 'language', value: 'klingon' }, 'java'];

    expect(orderTagsForDisplay(tags)).toEqual(tags);
  });
});
