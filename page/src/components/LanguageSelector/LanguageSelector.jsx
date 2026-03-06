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

  return (
    <div className="language-selector">
      <div className="language-selector-trigger">
        <Globe size={18} />
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="language-select"
          aria-label={t('language.select')}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LanguageSelector;
