import { AnimeResult } from './types';
import { convertToTowazoStyle } from '../../shared/utils/towazoSpeech';

/**
 * towazoの口調で画像識別結果のコメントを生成する関数
 */
export const generateTowazoComment = (result: AnimeResult): string => {
  const { title, confidencePercent } = result;
  
  if (!title || title.trim().length === 0) {
    return convertToTowazoStyle('うーん、作品名が分からなかったよ。もう一度画像を試してみて！');
  }
  
  let baseMessage: string;
  
  if (confidencePercent >= 90) {
    baseMessage = `やった！この画像は「${title}」だと思うよ！\n僕の自信度は${confidencePercent}%だから、かなり確信してる。`;
  } else if (confidencePercent >= 70) {
    baseMessage = `うーん、この画像は「${title}」かな？\n${confidencePercent}%くらいの確信度だから、たぶん合ってると思うよ。`;
  } else {
    baseMessage = `ちょっと難しいけど、「${title}」かもしれないね。\n${confidencePercent}%の確信度だから、もしかしたら違うかも...でも頑張って推測したよ！`;
  }
  
  return convertToTowazoStyle(baseMessage);
};

/**
 * ファイルをBase64に変換
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
