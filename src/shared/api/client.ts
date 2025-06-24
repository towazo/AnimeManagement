import axios from 'axios';

// API ベース URL を多段で解決
export const API_BASE: string =
  // CRA ビルド時に置換される環境変数
  (process.env.REACT_APP_BACKEND_URL as string | undefined) ||
  // Vite ビルドの場合
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BACKEND_URL) ||
  // ランタイムで window に直接埋め込んだ場合
  (typeof window !== 'undefined' && (window as any).REACT_APP_BACKEND_URL) ||
  // 最終フォールバック
  'https://fresh-owl-65.deno.dev';

export const apiClient = axios.create({
  baseURL: `${API_BASE}/api`, // エンドポイントは /api/xxx で統一
  timeout: 15000,
});

// 共通レスポンス処理などを追加したい場合はここに interceptor を設定
// apiClient.interceptors.response.use(
//   (res) => res,
//   (err) => Promise.reject(err)
// );
