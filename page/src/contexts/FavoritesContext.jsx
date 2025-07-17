import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getFavorites, isFavorite, toggleFavorite } from '../utils/favorites';

const FavoritesContext = createContext();

export const useFavoritesContext = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const refreshFavorites = useCallback(() => {
    setFavorites(getFavorites());
    setUpdateTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const toggleEventFavorite = useCallback((eventId) => {
    toggleFavorite(eventId);
    refreshFavorites();
  }, [refreshFavorites]);

  const checkIsFavorite = useCallback((eventId) => {
    return isFavorite(eventId);
  }, [updateTrigger]);

  const value = {
    favorites,
    toggleEventFavorite,
    isFavorite: checkIsFavorite,
    refreshFavorites,
    updateTrigger
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};