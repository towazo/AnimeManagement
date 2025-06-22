import { useState } from 'react';
import axios from 'axios';

export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatOptimize = async (prompt: string): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      console.log('チャット最適化リクエスト送信:', prompt.slice(0, 30) + '...');
      const res = await axios.post<{ text: string }>('/api/chat-optimize', { prompt });
      console.log('チャット最適化レスポンス受信');
      return res.data.text;
    } catch (err: any) {
      console.error('チャット最適化エラー:', err.response?.data || err.message);
      setError(err.response?.data?.error || err.message || 'API error');
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
      const res = await axios.post<{ text: string }>('/api/image-identify', { imageBase64 });
      console.log('画像識別レスポンス受信');
      return res.data.text;
    } catch (err: any) {
      console.error('画像識別エラー:', err.response?.data || err.message);
      setError(err.response?.data?.error || err.message || 'API error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, chatOptimize, imageIdentify };
};
