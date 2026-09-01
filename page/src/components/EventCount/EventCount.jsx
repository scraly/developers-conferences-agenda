import { useTranslation } from 'contexts/LanguageContext';
import { useCfpSpeakerStatusContext } from 'contexts/CfpSpeakerStatusContext';

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

const EventCount = ({events, isMap, view}) => {
  const { t } = useTranslation();
  const { getStatus } = useCfpSpeakerStatusContext();

  if (isMap) {
      const onlineOnlyEvents = events.filter((e) => e.location === "Online");
      return <p className="eventCount">{getCountText(events, onlineOnlyEvents, t)}</p>;
  }

  if (view === 'cfp-companion') {
    const countText = getCountText(events, [], t);
    if (events.length === 0) {
      return <p className="eventCount">{countText}</p>;
    }
    let acceptedCount = 0;
    let rejectedCount = 0;
    events.forEach((e) => {
      const status = getStatus(`${e.name}-${e.date[0]}`);
      if (status.outcome === 'accepted') {
        acceptedCount++;
      } else if (status.outcome === 'rejected') {
        rejectedCount++;
      }
    });
    return (
      <p className="eventCount">
        {`${countText} (${acceptedCount} ✅, ${rejectedCount} ❌)`}
      </p>
    );
  }

  return <p className="eventCount">{getCountText(events, [], t)}</p>;
};
export default EventCount;
