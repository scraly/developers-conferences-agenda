import React from 'react';
import { Heart } from 'lucide-react';
import { useFavoritesContext } from '../../contexts/FavoritesContext';
import './FavoriteButton.css';

const FavoriteButton = ({ event }) => {
  const eventId = `${event.name}-${event.date[0]}`;
  const { isFavorite, toggleEventFavorite } = useFavoritesContext();
  const isFav = isFavorite(eventId);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleEventFavorite(eventId);
  };

  return (
    <button 
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      className={`favorite-button ${isFav ? 'favorite' : ''}`}
      onClick={handleToggle}
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
      type="button"
    >
      <Heart fill={isFav ? '#ff4757' : 'none'} size={16} stroke={isFav ? '#ff4757' : 'currentColor'} />
    </button>
  );
};

export default FavoriteButton;