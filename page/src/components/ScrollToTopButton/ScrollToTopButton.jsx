import React, { useState, useEffect } from 'react';
import { useTranslation } from 'contexts/LanguageContext';
import 'styles/ScrollToTopButton.css';

export const ScrollToTopButton = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    isVisible && (
      <button
        className="scroll-to-top"
        onClick={scrollToTop}
      >
        ↑ {t('common.top')}
      </button>
    )
  );
};
