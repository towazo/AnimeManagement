import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// .env.local 優先で読み込む
dotenv.config({ path: './.env.local' });
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY が設定されていません (.env.local を確認してください)');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 無料枠で利用可能なモデル名を定義
// 注意: Google AI Studioでの利用は無料ですが、APIでの利用は日次制限があります
const CHAT_MODEL = 'gemini-1.5-flash-latest'; // 無料枠で利用可能
const VISION_MODEL = 'gemini-1.5-flash'; // 無料枠で利用可能

// Chat optimization endpoint
app.post('/api/chat-optimize', async (req, res) => {
  console.log('[chat-optimize] リクエスト受信');
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });
  try {
    console.log('[chat-optimize] API キー:', process.env.GEMINI_API_KEY ? '設定済み' : '未設定');
    console.log('[chat-optimize] prompt:', prompt.slice(0,100));
    console.log(`[chat-optimize] モデル: ${CHAT_MODEL}`);
    
    const model = genAI.getGenerativeModel({ model: CHAT_MODEL });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('[chat-optimize] 応答成功:', text.slice(0, 50) + '...');
    res.json({ text });
  } catch (err) {
    console.error('[chat-optimize] エラー詳細:', err.message, err.stack);
    res.status(500).json({ error: `Gemini API error: ${err.message}` });
  }
});

// Image identify endpoint
app.post('/api/image-identify', async (req, res) => {
  console.log('[image-identify] リクエスト受信');
  const { imageBase64 } = req.body; // data without data URI header
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });
  try {
    console.log('[image-identify] API キー:', process.env.GEMINI_API_KEY ? '設定済み' : '未設定');
    console.log('[image-identify] bytes length', imageBase64.length);
    console.log(`[image-identify] モデル: ${VISION_MODEL}`);
    
    const model = genAI.getGenerativeModel({ model: VISION_MODEL });
    const result = await model.generateContent([
      { text: 'この画像に描かれているアニメ作品を特定してください。古い作品も含めて考慮してください。「めぞん一刻」「ゆるキャン」「進撃の巨人」などの一般的なアニメ作品を考慮してください。日本語でタイトルを返し、JSON形式で返してください: {title: "日本語のタイトル", confidencePercent: 信頼度の数値}' },
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
    ]);
    const text = result.response.text();
    console.log('[image-identify] 応答成功:', text);
    res.json({ text });
  } catch (err) {
    console.error('[image-identify] エラー詳細:', err.message, err.stack);
    res.status(500).json({ error: `Gemini API error: ${err.message}` });
  }
});

const PORT = process.env.API_PORT || 5001;
app.listen(PORT, () => {
  console.log(`Gemini API server running on http://localhost:${PORT}`);
});
