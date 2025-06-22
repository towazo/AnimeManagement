import { useState } from 'react';
import axios from 'axios';

// デバッグ用に環境変数をログ出力
console.log('環境変数確認:', {
  NODE_ENV: process.env.NODE_ENV,
  PUBLIC_URL: process.env.PUBLIC_URL,
  // APIキーの存在確認（値は表示しない）
  HAS_API_KEY: !!process.env.REACT_APP_GEMINI_API_KEY
});

// APIキーを環境変数から取得（フォールバックとしてデモ用キーを設定）
// 本番環境では必ずGitHubのSecretsにREACT_APP_GEMINI_API_KEYを設定すること
// デモ用キーは制限付きですぐに使用不可になる可能性があります
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyDhGO9FLQmDTKKYX_qY6_-o_-GNJyWS-6c';

// CORS問題を回避するためのプロキシURL
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

// Gemini APIのエンドポイント
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_PRO_MODEL = 'gemini-pro';
const GEMINI_VISION_MODEL = 'gemini-pro-vision';

export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatOptimize = async (prompt: string): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      console.log('チャット最適化リクエスト送信:', prompt.slice(0, 30) + '...');
      
      // デバッグ用にリクエスト情報をログ出力
      console.log(`APIキーの長さ: ${API_KEY.length}文字`);
      
      // Gemini Pro APIを呼び出し（CORSプロキシ経由）
      const apiUrl = `${GEMINI_API_URL}/${GEMINI_PRO_MODEL}:generateContent?key=${API_KEY}`;
      console.log('リクエストURL:', apiUrl);
      
      const response = await axios.post(
        apiUrl,
        {
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        }
      );
      
      console.log('チャット最適化レスポンス受信');
      
      // レスポンスからテキストを抽出
      const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
      
      // デバッグ用にリクエスト情報をログ出力
      console.log(`画像識別: APIキーの長さ: ${API_KEY.length}文字`);
      
      // Gemini Vision APIを呼び出し（CORSプロキシ経由）
      const apiUrl = `${GEMINI_API_URL}/${GEMINI_VISION_MODEL}:generateContent?key=${API_KEY}`;
      console.log('画像識別リクエストURL:', apiUrl);
      
      const response = await axios.post(
        apiUrl,
        {
          contents: [
            {
              parts: [
                {
                  text: "この画像はどのアニメのものか特定してください。アニメのタイトルのみを日本語で返してください。"
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        }
      );
      
      console.log('画像識別レスポンス受信');
      
      // レスポンスからテキストを抽出
      const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
