import React from 'react';
import { Heart } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'contexts/LanguageContext';
import 'styles/FavoritesToggle.css';

const FavoritesToggle = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const favorites = searchParams.get('favorites') === 'true';
  const { t } = useTranslation();

  const toggleFavorites = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (favorites) {
      newSearchParams.delete('favorites');
    } else {
      newSearchParams.set('favorites', 'true');
    }
    setSearchParams(newSearchParams);
  };

  return (
    <button
      aria-label={favorites ? t('filters.hideFavorites') : t('filters.showOnlyFavorites')}
      className={`favorites-toggle-button ${favorites ? '' : 'strikethrough'}`}
      onClick={toggleFavorites}
      title={favorites ? t('filters.hideFavorites') : t('filters.showOnlyFavorites')}
    >
      <Heart size={20} />
    </button>
  );
};

export default FavoritesToggle;

