import { describe, expect, it } from 'vitest';

import {
  MAX_EVENT_TAGS,
  normalizeTagsToMax,
  validateEventTags,
} from './utils/tagValidation';

describe('event tag validation', () => {
  it('allows up to five tags', () => {
    const tags = Array.from({ length: MAX_EVENT_TAGS }, (_, index) => `tag:${index}`);

    const result = validateEventTags(tags);

    expect(result.valid).toBe(true);
    expect(result.normalizedTags).toEqual(tags);
    expect(result.tooMany).toBe(false);
  });

  it('caps selections over the maximum and marks them invalid', () => {
    const tags = Array.from({ length: MAX_EVENT_TAGS + 1 }, (_, index) => `tag:${index}`);

    const result = validateEventTags(tags);

    expect(result.valid).toBe(false);
    expect(result.tooMany).toBe(true);
    expect(result.normalizedTags).toHaveLength(MAX_EVENT_TAGS);
    expect(normalizeTagsToMax(tags)).toHaveLength(MAX_EVENT_TAGS);
  });
});
