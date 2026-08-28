import { describe, expect, it } from 'vitest';

import {
  MAX_EVENT_TAGS,
  validateEventTags,
} from './utils/tagValidation';

describe('event tag validation', () => {
  it('allows up to five tags', () => {
    const tags = Array.from({ length: MAX_EVENT_TAGS }, (_, index) => `tag:${index}`);

    const result = validateEventTags(tags);

    expect(result.valid).toBe(true);
    expect(result.tooMany).toBe(false);
  });

  it('marks over-limit selections invalid without removing tags', () => {
    const tags = Array.from({ length: MAX_EVENT_TAGS + 1 }, (_, index) => `tag:${index}`);

    const result = validateEventTags(tags);

    expect(result.valid).toBe(false);
    expect(result.tooMany).toBe(true);
  });
});
