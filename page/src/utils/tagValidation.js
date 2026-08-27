export const MAX_EVENT_TAGS = 5;

export const normalizeTagsToMax = (tags = []) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.slice(0, MAX_EVENT_TAGS);
};

export const validateEventTags = (tags = []) => {
  const normalizedTags = normalizeTagsToMax(tags);
  const tooMany = Array.isArray(tags) && tags.length > MAX_EVENT_TAGS;

  return {
    valid: !tooMany,
    tooMany,
    normalizedTags,
  };
};
