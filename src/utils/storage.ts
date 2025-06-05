import { Anime, Genre } from '../types';

const STORAGE_KEY = 'anime_archive_data';

// サンプルデータ
const sampleAnimeData: Anime[] = [
  {
    id: '1',
    title: '進撃の巨人',
    year: 2013,
    genres: ['アクション', 'ドラマ', 'ファンタジー'],
    personalRating: 5,
    notes: '壁の中の人類と巨人との戦い',
    watchedDate: '2023-01-15',
    coverImage: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg'
  },
  {
    id: '2',
    title: 'ヴァイオレット・エヴァーガーデン',
    year: 2018,
    genres: ['ドラマ', 'ファンタジー', '日常'],
    personalRating: 4,
    notes: '元軍人の少女が「愛してる」という言葉の意味を探す旅',
    watchedDate: '2022-11-20',
    coverImage: 'https://cdn.myanimelist.net/images/anime/1329/90618.jpg'
  },
  {
    id: '3',
    title: '鬼滅の刃',
    year: 2019,
    genres: ['アクション', 'ファンタジー'],
    personalRating: 4,
    notes: '家族を鬼に殺された少年が鬼殺隊に入隊',
    watchedDate: '2022-05-10',
    coverImage: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg'
  },
  {
    id: '4',
    title: 'よつばと！',
    year: 2003,
    genres: ['コメディ', '日常'],
    personalRating: 5,
    notes: '5歳の女の子よつばの日常',
    watchedDate: '2023-03-22',
    coverImage: 'https://cdn.myanimelist.net/images/manga/5/259524.jpg'
  },
  {
    id: '5',
    title: 'スパイファミリー',
    year: 2022,
    genres: ['アクション', 'コメディ', '日常'],
    personalRating: 4,
    notes: 'スパイ、殺し屋、超能力者が偽装家族を結成',
    watchedDate: '2023-02-05',
    coverImage: 'https://cdn.myanimelist.net/images/anime/1441/122795.jpg'
  }
];

// アニメデータを取得する
export const getAnimeList = (): Anime[] => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  
  if (!storedData) {
    // 初回起動時はサンプルデータを保存
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleAnimeData));
    return sampleAnimeData;
  }
  
  return JSON.parse(storedData);
};

// アニメデータを保存する
export const saveAnimeList = (animeList: Anime[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(animeList));
};

// 新しいアニメを追加する
export const addAnime = (anime: Omit<Anime, 'id'>): Anime => {
  const animeList = getAnimeList();
  const newAnime = {
    ...anime,
    id: Date.now().toString()
  };
  
  animeList.push(newAnime);
  saveAnimeList(animeList);
  
  return newAnime;
};

// アニメを更新する
export const updateAnime = (updatedAnime: Anime): void => {
  const animeList = getAnimeList();
  const index = animeList.findIndex(anime => anime.id === updatedAnime.id);
  
  if (index !== -1) {
    animeList[index] = updatedAnime;
    saveAnimeList(animeList);
  }
};

// アニメを削除する
export const deleteAnime = (id: string): void => {
  const animeList = getAnimeList();
  const filteredList = animeList.filter(anime => anime.id !== id);
  saveAnimeList(filteredList);
};

// 視聴日を今日に更新する（再視聴機能）
export const markAsRewatched = (id: string): void => {
  const animeList = getAnimeList();
  const index = animeList.findIndex(anime => anime.id === id);
  
  if (index !== -1) {
    const today = new Date().toISOString().split('T')[0];
    animeList[index] = {
      ...animeList[index],
      watchedDate: today
    };
    saveAnimeList(animeList);
  }
};

// データをJSONとしてエクスポート
export const exportData = (): string => {
  return localStorage.getItem(STORAGE_KEY) || '[]';
};

// JSONデータをインポート
export const importData = (jsonData: string): boolean => {
  try {
    const parsedData = JSON.parse(jsonData);
    if (!Array.isArray(parsedData)) {
      return false;
    }
    
    localStorage.setItem(STORAGE_KEY, jsonData);
    return true;
  } catch (e) {
    return false;
  }
};

// ジャンルの使用頻度を取得
export const getGenreFrequency = (): Record<Genre, number> => {
  const animeList = getAnimeList();
  const genreCount: Partial<Record<Genre, number>> = {};
  
  animeList.forEach(anime => {
    anime.genres.forEach(genre => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
  });
  
  return genreCount as Record<Genre, number>;
};

// 評価の分布を取得
export const getRatingDistribution = (): Record<number, number> => {
  const animeList = getAnimeList();
  const ratingCount: Record<number, number> = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
  
  animeList.forEach(anime => {
    ratingCount[anime.personalRating] = (ratingCount[anime.personalRating] || 0) + 1;
  });
  
  return ratingCount;
};
