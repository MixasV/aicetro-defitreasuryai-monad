import { useState, useEffect } from 'react';

const STORAGE_KEY = 'aicetro-favorite-pools';

export const useFavoritePools = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(new Set(parsed));
      }
    } catch (error) {
      console.error('Failed to load favorite pools:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    } catch (error) {
      console.error('Failed to save favorite pools:', error);
    }
  }, [favorites, isLoaded]);

  const toggleFavorite = (poolId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(poolId)) {
        next.delete(poolId);
      } else {
        next.add(poolId);
      }
      return next;
    });
  };

  const isFavorite = (poolId: string) => favorites.has(poolId);

  const addFavorite = (poolId: string) => {
    setFavorites((prev) => new Set(prev).add(poolId));
  };

  const removeFavorite = (poolId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.delete(poolId);
      return next;
    });
  };

  const clearFavorites = () => {
    setFavorites(new Set());
  };

  return {
    favorites: [...favorites],
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    count: favorites.size
  };
};
