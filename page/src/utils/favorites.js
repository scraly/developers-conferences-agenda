const FAVORITES_KEY = 'developer-conferences-favorites';

export const getFavorites = () => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
};

export const saveFavorites = (favorites) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
};

export const addToFavorites = (eventId) => {
  const favorites = getFavorites();
  if (!favorites.includes(eventId)) {
    favorites.push(eventId);
    saveFavorites(favorites);
  }
};

export const removeFromFavorites = (eventId) => {
  const favorites = getFavorites();
  const updatedFavorites = favorites.filter(id => id !== eventId);
  saveFavorites(updatedFavorites);
};

export const isFavorite = (eventId) => {
  const favorites = getFavorites();
  return favorites.includes(eventId);
};

export const toggleFavorite = (eventId) => {
  if (isFavorite(eventId)) {
    removeFromFavorites(eventId);
  } else {
    addToFavorites(eventId);
  }
};