export const MAX_EVENT_TAGS = 5;

export const validateEventTags = (tags = []) => {
  const tooMany = Array.isArray(tags) && tags.length > MAX_EVENT_TAGS;

  return {
    valid: !tooMany,
    tooMany,
  };
};
