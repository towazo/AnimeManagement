// ローカルストレージのデータを修正するためのスクリプト
// coverImageプロパティをimageUrlに変換します

const STORAGE_KEY = 'anime_archive_data';

interface OldAnime {
  id: string;
  title: string;
  imageUrl?: string;
  coverImage?: string;
  year?: number;
  genres: string[];
  personalRating: number;
  notes?: string;
  watchedDate: string;
}

interface NewAnime {
  id: string;
  title: string;
  imageUrl?: string;
  year?: number;
  genres: string[];
  personalRating: number;
  notes?: string;
  watchedDate: string;
}

// データ移行関数
export const migrateData = (): void => {
  try {
    // 現在のデータを取得
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      console.log('保存されたデータがありません。移行は不要です。');
      return;
    }

    // データをパース
    const animeList = JSON.parse(storedData) as OldAnime[];
    console.log('移行前のデータ:', animeList);

    // データを変換
    const migratedList: NewAnime[] = animeList.map(anime => {
      const newAnime: NewAnime = {
        id: anime.id,
        title: anime.title,
        year: anime.year,
        genres: anime.genres,
        personalRating: anime.personalRating,
        notes: anime.notes,
        watchedDate: anime.watchedDate,
        // coverImageがあればimageUrlに移行、なければ既存のimageUrlを使用
        imageUrl: anime.coverImage || anime.imageUrl
      };
      return newAnime;
    });

    // 変換したデータを保存
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedList));
    console.log('データ移行が完了しました:', migratedList);
  } catch (error) {
    console.error('データ移行中にエラーが発生しました:', error);
  }
};

// 自動実行
migrateData();
