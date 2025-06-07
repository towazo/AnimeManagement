import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Anime, AnimeFilters, Genre, SortOption, ViewMode } from '../types';
import * as storage from '../utils/storage';

interface AnimeContextType {
  animeList: Anime[];
  filters: AnimeFilters;
  viewMode: ViewMode;
  filteredAnimeList: Anime[];
  addAnime: (anime: Omit<Anime, 'id'>) => Promise<{ success: boolean; message?: string; anime?: Anime }>;
  addBulkAnime: (animes: Omit<Anime, 'id'>[]) => Promise<void>; // 複数アニメ追加関数
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
  const addAnime = async (anime: Omit<Anime, 'id'>): Promise<{ success: boolean; message?: string; anime?: Anime }> => { // 戻り値の型を変更
    console.log('addAnime関数が呼び出されました', anime);
    
    // 既存のアニメと重複していないか確認
    const isDuplicate = animeList.some(existingAnime => 
      existingAnime.title.toLowerCase() === anime.title.toLowerCase()
    );
    
    if (isDuplicate) {
      console.log('重複するアニメが見つかりました:', anime.title);
      return { 
        success: false, 
        message: `「${anime.title}」はすでにリストに追加されています` 
      };
    }
    
    // タイトルが入力されている場合、Jikan APIで情報を取得
    if (anime.title) {
      console.log('Jikan APIを呼び出します。タイトル:', anime.title);
      try {
        // 特殊文字（!や:など）を含むタイトルの場合、検索精度を上げるために
        // 1. 完全一致検索を試みる
        // 2. 特殊文字を除去した検索を試みる
        // 3. 最初の単語だけで検索を試みる
        let searchTitle = anime.title;
        let apiUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTitle)}&limit=5`;
        console.log('APIリクエストURL (1回目):', apiUrl);
        
        let response = await fetch(apiUrl);
        console.log('APIレスポンスステータス (1回目):', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('APIレスポンスデータ:', result);
          
          // 検索結果から最適なアニメを選択する
          let bestMatch = null;
          
          if (result.data && result.data.length > 0) {
            // 完全一致または最も近い一致を探す
            const exactTitle = anime.title.toLowerCase();
            
            // 完全一致を探す
            // Jikan APIのレスポンスの型を定義
            interface JikanAnimeItem {
              title: string;
              title_english?: string;
              title_japanese?: string;
              images?: {
                jpg?: {
                  image_url?: string;
                }
              };
              aired?: {
                prop?: {
                  from?: {
                    year?: number;
                  }
                }
              };
              genres?: Array<{ name: string }>;
            }
            
            bestMatch = result.data.find((item: JikanAnimeItem) => 
              item.title.toLowerCase() === exactTitle || 
              item.title_english?.toLowerCase() === exactTitle ||
              item.title_japanese?.toLowerCase() === exactTitle
            );
            
            // 完全一致がない場合は、最初の結果を使用
            if (!bestMatch) {
              console.log('完全一致が見つかりません。最初の結果を使用します。');
              bestMatch = result.data[0];
            } else {
              console.log('完全一致または近い一致が見つかりました。');
            }
            
            console.log('選択されたアニメデータ:', bestMatch);
            
            // カバー画像が指定されていない場合、APIから取得
            if (!anime.coverImage && bestMatch.images?.jpg?.image_url) {
              anime.coverImage = bestMatch.images.jpg.image_url;
              console.log(`画像URLを設定しました: ${anime.coverImage}`);
            }
            
            // 放送年が指定されていない場合、APIから取得
            if (!anime.year && bestMatch.aired?.prop?.from?.year) {
              anime.year = bestMatch.aired.prop.from.year;
              console.log(`放送年を設定しました: ${anime.year}`);
            }
            
            // ジャンルが空の場合、APIから取得
            if ((!anime.genres || anime.genres.length === 0) && bestMatch.genres && bestMatch.genres.length > 0) {
              // APIから取得したジャンルを日本語に変換して、アプリで定義されているジャンルに対応させる
              const genreMapping: Record<string, Genre> = {
                'Action': 'アクション',
                'Comedy': 'コメディ',
                'Drama': 'ドラマ',
                'Fantasy': 'ファンタジー',
                'Sci-Fi': 'SF',
                'Slice of Life': '日常',
                'Romance': '恋愛',
                'Sports': 'スポーツ',
                'Mystery': 'ミステリー',
                'Horror': 'ホラー',
                'School': '日常',
                'Music': 'その他',
                'Adventure': 'アクション',
                'Supernatural': 'ファンタジー'
                // その他のジャンルは「その他」にマッピング
              };
              
              const mappedGenres: Genre[] = [];
              
              for (const genre of bestMatch.genres) {
                const mappedGenre = genreMapping[genre.name] as Genre;
                if (mappedGenre && !mappedGenres.includes(mappedGenre)) {
                  mappedGenres.push(mappedGenre);
                }
              }
              
              // マッピングできたジャンルがない場合は「その他」を追加
              if (mappedGenres.length === 0) {
                mappedGenres.push('その他');
              }
              
              anime.genres = mappedGenres;
              console.log(`ジャンルを設定しました: ${anime.genres.join(', ')}`);
            }
          } else {
            console.log(`アニメ情報が見つかりませんでした。タイトル: ${anime.title}`);
          }
        } else {
          console.error('APIエラー:', response.status, await response.text());
        }
      } catch (error) {
        console.error('例外が発生しました:', error);
      }
    } else {
      console.log('タイトルが入力されていないため、API呼び出しをスキップします');
    }

    const newAnime = storage.addAnime(anime);
    setAnimeList(prev => [...prev, newAnime]);
    console.log('アニメが追加されました', newAnime);
    return { success: true, anime: newAnime };
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
  
  // 複数アニメを一度に追加する関数
  const addBulkAnime = async (animes: Omit<Anime, 'id'>[]) => {
    console.log('複数アニメ追加開始:', animes.length, '件');
    
    const results = {
      success: 0,
      duplicates: 0,
      duplicatesList: [] as string[]
    };
    
    // 各アニメを順番に処理するために非同期処理を直列化
    for (const anime of animes) {
      // 各アニメを個別に追加する前に、APIから情報を取得
      const result = await addAnime(anime);
      
      if (result.success) {
        results.success++;
      } else {
        results.duplicates++;
        if (result.message) {
          results.duplicatesList.push(anime.title);
        }
      }
      
      // APIのレート制限を避けるために少し間隔を空ける
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('複数アニメ追加完了', results);
    
    // 結果を返す
    if (results.duplicates > 0) {
      const duplicatesMessage = results.duplicatesList.join('\n');
      throw new Error(`${results.duplicates}件のアニメが重複しています:\n${duplicatesMessage}`);
    }
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
        addBulkAnime,
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
