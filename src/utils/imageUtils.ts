/**
 * 画像URLを高品質版に変換するユーティリティ関数
 */

/**
 * MyAnimeListの画像URLを高品質版に変換します
 * 通常の画像URL（.jpg）を大きいサイズ（l.jpg）に変換します
 * @param url 元の画像URL
 * @returns 高品質版の画像URL
 */
export const getHighQualityImageUrl = (url: string | undefined): string => {
  if (!url) return 'https://via.placeholder.com/300x200?text=No+Image';
  
  // MyAnimeListの画像URLの場合、高品質版に変換
  if (url.includes('myanimelist.net') && url.endsWith('.jpg')) {
    return url.replace(/\.jpg$/, 'l.jpg');
  }
  
  return url;
};

/**
 * 画像の読み込みエラー時に代替画像を表示するためのイベントハンドラ
 * @param event 画像のエラーイベント
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
  event.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image';
};
