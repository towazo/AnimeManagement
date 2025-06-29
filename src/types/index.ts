export type Genre = 
  | 'アクション' 
  | 'コメディ' 
  | 'ドラマ' 
  | 'ファンタジー' 
  | 'SF' 
  | '日常' 
  | '恋愛' 
  | 'スポーツ' 
  | 'ミステリー' 
  | 'ホラー' 
  | 'その他';

export interface Anime {
  id: string;
  title: string;
  imageUrl?: string;
  year?: number;
  genres: Genre[];
  personalRating: number;
  notes?: string;
  watchedDate: string;
}

export type SortOption = 'watchedDate_desc' | 'title_asc' | 'personalRating_desc';

export type ViewMode = 'table' | 'card';

export interface AnimeFilters {
  searchTerm: string;
  selectedGenres: Genre[];
  sortBy: SortOption;
}

export interface CustomList {
  id: string;
  name: string;
  description?: string;
  animeIds: string[];
}
