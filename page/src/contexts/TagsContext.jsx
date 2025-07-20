import React, { createContext, useContext, useState, useEffect } from 'react';

const TagsContext = createContext();

export const useTagsVisibility = () => {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error('useTagsVisibility must be used within a TagsProvider');
  }
  return context;
};

export const TagsProvider = ({ children }) => {
  const [tagsVisible, setTagsVisible] = useState(true);

  useEffect(() => {
    const savedSetting = localStorage.getItem('tagsVisible');
    if (savedSetting !== null) {
      setTagsVisible(JSON.parse(savedSetting));
    }
  }, []);

  const toggleTagsVisibility = () => {
    const newSetting = !tagsVisible;
    setTagsVisible(newSetting);
    localStorage.setItem('tagsVisible', JSON.stringify(newSetting));
  };

  return (
    <TagsContext.Provider value={{ tagsVisible, toggleTagsVisibility }}>
      {children}
    </TagsContext.Provider>
  );
};