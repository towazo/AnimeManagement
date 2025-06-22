import { useState } from 'react';
import axios from 'axios';

// APIキーを環境変数から取得
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
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
      
      // Gemini Pro APIを直接呼び出し
      const response = await axios.post(
        `${GEMINI_API_URL}/${GEMINI_PRO_MODEL}:generateContent?key=${API_KEY}`,
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
      
      // Gemini Vision APIを直接呼び出し
      const response = await axios.post(
        `${GEMINI_API_URL}/${GEMINI_VISION_MODEL}:generateContent?key=${API_KEY}`,
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
