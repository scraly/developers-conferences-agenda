// Example 1: Simple translation in a component
import { useTranslation } from 'contexts/LanguageContext';

const SimpleExample = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('event.location')}: Paris</p>
    </div>
  );
};

// Example 2: Using current language for conditional logic
import { useTranslation } from 'contexts/LanguageContext';

const ConditionalExample = () => {
  const { language, t } = useTranslation();

  return (
    <div>
      <p>{t('common.loading')}</p>
      {language === 'fr' && <p>Contenu spécifique en français</p>}
    </div>
  );
};

// Example 3: Language switcher button
import { useTranslation } from 'contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useTranslation();

  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('fr')}>Français</button>
      <button onClick={() => changeLanguage('es')}>Español</button>
    </div>
  );
};

// Example 4: Formatting dates based on language
import { useTranslation } from 'contexts/LanguageContext';
import { format } from 'date-fns';
import { fr, es, de, enUS, pt } from 'date-fns/locale';

const locales = {
  en: enUS,
  fr: fr,
  es: es,
  de: de,
  pt: pt,
};

const DateExample = ({ date }) => {
  const { language, t } = useTranslation();

  const formattedDate = format(date, 'PPP', { locale: locales[language] });

  return (
    <div>
      <h3>{t('event.date')}</h3>
      <p>{formattedDate}</p>
    </div>
  );
};

// Example 5: Array of items with translations
import { useTranslation } from 'contexts/LanguageContext';

const MonthsList = () => {
  const { t } = useTranslation();

  const months = [
    'january', 'february', 'march', 'april', 
    'may', 'june', 'july', 'august',
    'september', 'october', 'november', 'december'
  ];

  return (
    <ul>
      {months.map(month => (
        <li key={month}>{t(`months.${month}`)}</li>
      ))}
    </ul>
  );
};

// Example 6: Filter component with translations
import { useTranslation } from 'contexts/LanguageContext';
import Select from 'react-select';

const FilterExample = () => {
  const { t } = useTranslation();

  const continentOptions = [
    { value: 'africa', label: t('continents.africa') },
    { value: 'asia', label: t('continents.asia') },
    { value: 'europe', label: t('continents.europe') },
    { value: 'northAmerica', label: t('continents.northAmerica') },
    { value: 'southAmerica', label: t('continents.southAmerica') },
    { value: 'oceania', label: t('continents.oceania') },
  ];

  return (
    <div>
      <label>{t('filters.continent')}</label>
      <Select
        options={continentOptions}
        placeholder={t('filters.searchPlaceholder')}
      />
    </div>
  );
};

// Example 7: Button with aria-label translation
import { useTranslation } from 'contexts/LanguageContext';

const AccessibleButton = () => {
  const { t } = useTranslation();

  return (
    <button
      aria-label={t('event.addToCalendar')}
      title={t('event.addToCalendar')}
    >
      📅 {t('event.addToCalendar')}
    </button>
  );
};

// Example 8: Dynamic content based on language
import { useTranslation } from 'contexts/LanguageContext';

const EventTypeExample = ({ type }) => {
  const { t } = useTranslation();

  const getEventType = () => {
    switch(type) {
      case 'online': return t('event.online');
      case 'inPerson': return t('event.inPerson');
      case 'hybrid': return t('event.hybrid');
      default: return type;
    }
  };

  return <span className="event-type">{getEventType()}</span>;
};

// Example 9: Form with translated placeholders
import { useTranslation } from 'contexts/LanguageContext';

const EventForm = () => {
  const { t } = useTranslation();

  return (
    <form>
      <input
        type="text"
        placeholder={t('addEvent.eventName')}
        aria-label={t('addEvent.eventName')}
      />
      <input
        type="text"
        placeholder={t('addEvent.eventLocation')}
        aria-label={t('addEvent.eventLocation')}
      />
      <button type="submit">{t('addEvent.submit')}</button>
    </form>
  );
};

// Example 10: Conditional rendering with translations
import { useTranslation } from 'contexts/LanguageContext';

const CfpStatus = ({ cfpOpen, deadline }) => {
  const { t } = useTranslation();

  return (
    <div className="cfp-status">
      {cfpOpen ? (
        <>
          <span className="status-open">{t('event.cfpOpen')}</span>
          <p>{t('cfp.deadline')}: {deadline}</p>
        </>
      ) : (
        <span className="status-closed">{t('event.cfpClosed')}</span>
      )}
    </div>
  );
};

export {
  SimpleExample,
  ConditionalExample,
  LanguageSwitcher,
  DateExample,
  MonthsList,
  FilterExample,
  AccessibleButton,
  EventTypeExample,
  EventForm,
  CfpStatus,
};
