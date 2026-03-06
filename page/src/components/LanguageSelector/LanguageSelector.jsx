import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import './LanguageSelector.css';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

export const LanguageSelector = () => {
  const { language, changeLanguage, t } = useTranslation();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="language-selector">
      <div className="language-selector-trigger">
        <Globe size={18} className="globe-icon" />
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="language-select"
          aria-label={t('language.select')}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {isMobile ? lang.flag : `${lang.flag} ${lang.name}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LanguageSelector;
