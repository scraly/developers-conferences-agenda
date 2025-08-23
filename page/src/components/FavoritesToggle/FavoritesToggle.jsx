import React from 'react';
import { Heart } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import 'styles/FavoritesToggle.css';

const FavoritesToggle = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const favorites = searchParams.get('favorites') === 'true';

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
      aria-label={favorites ? 'Hide favorites' : 'Show only favorites'}
      className={`favorites-toggle-button ${favorites ? '' : 'strikethrough'}`}
      onClick={toggleFavorites}
      title={favorites ? 'Hide favorites' : 'Show only favorites'}
    >
      <Heart size={20} />
    </button>
  );
};

export default FavoritesToggle;

