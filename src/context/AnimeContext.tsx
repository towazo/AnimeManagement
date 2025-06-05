import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Anime, AnimeFilters, Genre, SortOption, ViewMode } from '../types';
import * as storage from '../utils/storage';

interface AnimeContextType {
  animeList: Anime[];
  filters: AnimeFilters;
  viewMode: ViewMode;
  filteredAnimeList: Anime[];
  addAnime: (anime: Omit<Anime, 'id'>) => void;
  updateAnime: (anime: Anime) => void;
  deleteAnime: (id: string) => void;
  markAsRewatched: (id: string) => void;
  setSearchTerm: (term: string) => void;
  setSelectedGenres: (genres: Genre[]) => void;
  setSortBy: (sortOption: SortOption) => void;
  toggleViewMode: () => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

const AnimeContext = createContext<AnimeContextType | undefined>(undefined);

interface AnimeProviderProps {
  children: ReactNode;
}

export const AnimeProvider: React.FC<AnimeProviderProps> = ({ children }) => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [filters, setFilters] = useState<AnimeFilters>({
    searchTerm: '',
    selectedGenres: [],
    sortBy: 'watchedDate_desc'
  });
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  // 初期データの読み込み
  useEffect(() => {
    const data = storage.getAnimeList();
    setAnimeList(data);
  }, []);

  // フィルタリングと並べ替えを適用したアニメリストを取得
  const filteredAnimeList = React.useMemo(() => {
    let result = [...animeList];
    
    // 検索語でフィルタリング
    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      result = result.filter(
        anime => 
          anime.title.toLowerCase().includes(searchTermLower) || 
          (anime.notes && anime.notes.toLowerCase().includes(searchTermLower))
      );
    }
    
    // ジャンルでフィルタリング
    if (filters.selectedGenres.length > 0) {
      result = result.filter(
        anime => filters.selectedGenres.some(genre => anime.genres.includes(genre))
      );
    }
    
    // 並べ替え
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'personalRating_desc':
          return b.personalRating - a.personalRating;
        case 'watchedDate_desc':
        default:
          return new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime();
      }
    });
    
    return result;
  }, [animeList, filters]);

  // アニメを追加
  const addAnime = async (anime: Omit<Anime, 'id'>) => { // async を追加
    // カバー画像が指定されていない場合、Jikan APIで検索して設定
    if (!anime.coverImage && anime.title) {
      try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(anime.title)}&limit=1`);
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.length > 0 && result.data[0].images?.jpg?.image_url) {
            anime.coverImage = result.data[0].images.jpg.image_url;
            console.log(`Jikan APIから画像を取得しました: ${anime.coverImage}`);
          }
        } else {
          console.error('Jikan APIリクエストエラー:', response.status, await response.text());
        }
      } catch (error) {
        console.error('Jikan API呼び出し中にエラーが発生しました:', error);
      }
    }

    const newAnime = storage.addAnime(anime);
    setAnimeList(prev => [...prev, newAnime]);
  };

  // アニメを更新
  const updateAnime = (anime: Anime) => {
    storage.updateAnime(anime);
    setAnimeList(prev => prev.map(item => item.id === anime.id ? anime : item));
  };

  // アニメを削除
  const deleteAnime = (id: string) => {
    storage.deleteAnime(id);
    setAnimeList(prev => prev.filter(anime => anime.id !== id));
  };

  // 再視聴としてマーク
  const markAsRewatched = (id: string) => {
    storage.markAsRewatched(id);
    const today = new Date().toISOString().split('T')[0];
    setAnimeList(prev => 
      prev.map(anime => 
        anime.id === id ? { ...anime, watchedDate: today } : anime
      )
    );
  };

  // 検索語を設定
  const setSearchTerm = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };

  // 選択されたジャンルを設定
  const setSelectedGenres = (genres: Genre[]) => {
    setFilters(prev => ({ ...prev, selectedGenres: genres }));
  };

  // 並べ替えオプションを設定
  const setSortBy = (sortOption: SortOption) => {
    setFilters(prev => ({ ...prev, sortBy: sortOption }));
  };

  // 表示モードを切り替え
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'card' ? 'table' : 'card');
  };

  // データをエクスポート
  const exportData = (): string => {
    return storage.exportData();
  };

  // データをインポート
  const importData = (jsonData: string): boolean => {
    const success = storage.importData(jsonData);
    if (success) {
      const data = storage.getAnimeList();
      setAnimeList(data);
    }
    return success;
  };

  return (
    <AnimeContext.Provider
      value={{
        animeList,
        filters,
        viewMode,
        filteredAnimeList,
        addAnime,
        updateAnime,
        deleteAnime,
        markAsRewatched,
        setSearchTerm,
        setSelectedGenres,
        setSortBy,
        toggleViewMode,
        exportData,
        importData
      }}
    >
      {children}
    </AnimeContext.Provider>
  );
};

export const useAnime = (): AnimeContextType => {
  const context = useContext(AnimeContext);
  if (context === undefined) {
    throw new Error('useAnime must be used within an AnimeProvider');
  }
  return context;
};
