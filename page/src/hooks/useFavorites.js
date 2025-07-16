import { useState, useEffect, useCallback } from 'react';
import { getFavorites, isFavorite as checkIsFavorite } from '../utils/favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [, forceUpdate] = useState({});

  const refresh = useCallback(() => {
    setFavorites(getFavorites());
    forceUpdate({});
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isFavorite = useCallback((eventId) => {
    return checkIsFavorite(eventId);
  }, []);

  return { favorites, isFavorite, refresh };
};

export const useFavoriteStatus = (eventId) => {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(checkIsFavorite(eventId));
  }, [eventId]);

  const updateStatus = useCallback(() => {
    setIsFav(checkIsFavorite(eventId));
  }, [eventId]);

  return { isFav, updateStatus };
};