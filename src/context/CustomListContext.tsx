import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { CustomList } from '../types';
import { v4 as uuidv4 } from 'uuid'; // UUIDを生成するために必要

interface CustomListContextType {
  customLists: CustomList[];
  addCustomList: (name: string, description?: string) => void;
  deleteCustomList: (listId: string) => void;
  updateCustomList: (listId: string, updates: Partial<CustomList>) => void;
  addAnimeToCustomList: (listId: string, animeId: string) => void;
  removeAnimeFromCustomList: (listId: string, animeId: string) => void;
}

const CustomListContext = createContext<CustomListContextType | undefined>(undefined);

export const CustomListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customLists, setCustomLists] = useState<CustomList[]>(() => {
    const savedLists = localStorage.getItem('customLists');
    return savedLists ? JSON.parse(savedLists) : [];
  });

  useEffect(() => {
    localStorage.setItem('customLists', JSON.stringify(customLists));
  }, [customLists]);

  const addCustomList = (name: string, description?: string) => {
    const newList: CustomList = { id: uuidv4(), name, description, animeIds: [] };
    setCustomLists(prevLists => [...prevLists, newList]);
  };

  const deleteCustomList = (listId: string) => {
    setCustomLists(prevLists => prevLists.filter(list => list.id !== listId));
  };

  const updateCustomList = (listId: string, updates: Partial<CustomList>) => {
    setCustomLists(prevLists =>
      prevLists.map(list => (list.id === listId ? { ...list, ...updates } : list))
    );
  };

  const addAnimeToCustomList = (listId: string, animeId: string) => {
    setCustomLists(prevLists =>
      prevLists.map(list =>
        list.id === listId
          ? { ...list, animeIds: [...new Set([...list.animeIds, animeId])] } // 重複を避ける
          : list
      )
    );
  };

  const removeAnimeFromCustomList = (listId: string, animeId: string) => {
    setCustomLists(prevLists =>
      prevLists.map(list =>
        list.id === listId
          ? { ...list, animeIds: list.animeIds.filter(id => id !== animeId) }
          : list
      )
    );
  };

  return (
    <CustomListContext.Provider
      value={{
        customLists,
        addCustomList,
        deleteCustomList,
        updateCustomList,
        addAnimeToCustomList,
        removeAnimeFromCustomList,
      }}
    >
      {children}
    </CustomListContext.Provider>
  );
};

export const useCustomLists = () => {
  const context = useContext(CustomListContext);
  if (context === undefined) {
    throw new Error('useCustomLists must be used within a CustomListProvider');
  }
  return context;
};
