import { useTranslation } from 'contexts/LanguageContext';

const getCountText = (events, onlineOnlyEvents, t) => {
  const count = events.length - onlineOnlyEvents.length
  if (count > 0) {
    const plural = count > 1 ? t('event.countPlural') : t('event.count');
    if (onlineOnlyEvents.length > 0) {
        const omittedPlural = onlineOnlyEvents.length > 1 ? t('event.countPlural') : t('event.count');
        return t('event.countWithOmitted')
          .replace('{count}', count)
          .replace('{plural}', plural)
          .replace('{omittedCount}', onlineOnlyEvents.length)
          .replace('{omittedPlural}', omittedPlural);
    }
    return t('event.countOnly')
      .replace('{count}', count)
      .replace('{plural}', plural);
  }
  return t('event.noEvent');
};

const EventCount = ({events, isMap}) => {
  const { t } = useTranslation();
  if (isMap) {
      const onlineOnlyEvents = events.filter((e) => e.location === "Online");
      return <p className="eventCount">{getCountText(events, onlineOnlyEvents, t)}</p>;
  }
  return <p className="eventCount">{getCountText(events, [], t)}</p>;
};
export default EventCount;
