import { useState } from 'react';
import axios from 'axios';

// デバッグ用に環境変数をログ出力
console.log('環境変数確認:', {
  NODE_ENV: process.env.NODE_ENV,
  PUBLIC_URL: process.env.PUBLIC_URL,
  // APIキーの存在確認（値は表示しない）
  HAS_API_KEY: !!process.env.REACT_APP_GEMINI_API_KEY
});

// APIキーを環境変数から取得
// 本番環境では必ずGitHubのSecretsにREACT_APP_GEMINI_API_KEYを設定すること
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// CORS問題を回避するためのプロキシURL
// バックエンドURLを多段で解決
const API_BASE =
  // CRA ビルド時に置換される環境変数
  (process.env.REACT_APP_BACKEND_URL as string | undefined) ||
  // Vite ビルドの場合
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BACKEND_URL) ||
  // ランタイムで window に直接埋め込んだ場合
  (typeof window !== 'undefined' && (window as any).REACT_APP_BACKEND_URL) ||
  // 最終フォールバック（※固定 URL は必要に応じて書き換えてください）
  'https://fresh-owl-65.deno.dev';
// 旧CORSプロキシは不要になったため削除



export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatOptimize = async (prompt: string): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      console.log('チャット最適化リクエスト送信:', prompt.slice(0, 30) + '...');
      
            // バックエンドAPIを呼び出し
      const apiUrl = `${API_BASE}/api/chat-optimize`;
      console.log('リクエストURL:', apiUrl);
      const response = await axios.post(apiUrl, { prompt });
      
      console.log('チャット最適化レスポンス受信');
      
      // レスポンスからテキストを抽出
      const text = response.data.text || '';
      return text;
    } catch (err: any) {
      console.error('チャット最適化エラー:', err.response?.data || err.message);
      setError(err.response?.data?.error?.message || err.message || 'API error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const imageIdentify = async (imageBase64: string): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      console.log('画像識別リクエスト送信: 画像サイズ', Math.round(imageBase64.length / 1024), 'KB');
      
      // 画像データからBase64ヘッダーを削除（もしあれば）
      const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
      
            // バックエンドAPIを呼び出し
      const apiUrl = `${API_BASE}/api/image-identify`;
      console.log('画像識別リクエストURL:', apiUrl);
      const response = await axios.post(apiUrl, { imageBase64: base64Data });
      
      console.log('画像識別レスポンス受信');
      
      // レスポンスからテキストを抽出
      const text = response.data.text || '';
      return text;
    } catch (err: any) {
      console.error('画像識別エラー:', err.response?.data || err.message);
      setError(err.response?.data?.error?.message || err.message || 'API error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, chatOptimize, imageIdentify };
};
