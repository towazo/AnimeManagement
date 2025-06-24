/**
 * テキスト処理関連のユーティリティ関数
 */

/**
 * HTMLタグを除去し、作品名を抽出する関数
 */
export const extractAnimeTitle = (text: string): string => {
  // HTMLタグを除去
  const withoutHtml = text.replace(/<[^>]*>/g, '');
  
  // 「」で囲まれた作品名を抽出
  const titleMatch = withoutHtml.match(/「([^」]+)」/);
  if (titleMatch) {
    return titleMatch[1];
  }
  
  // 「」がない場合は、最初の行または短いテキストを返す
  const firstLine = withoutHtml.split('\n')[0];
  return firstLine.length > 50 ? 'アニメ作品' : firstLine;
};

/**
 * テキストが空かどうかを判定
 */
export const isEmpty = (text: string | null | undefined): boolean => {
  return !text || text.trim().length === 0;
};

/**
 * HTMLタグを安全に除去
 */
export const stripHtmlTags = (text: string): string => {
  return text.replace(/<[^>]*>/g, '');
};
