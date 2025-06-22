// deno_backend/main.ts
// Deno Deploy 用 Cloud Function。エンドポイント:
//   POST /api/chat-optimize    { prompt: string }
//   POST /api/image-identify   { imageBase64: string }
// 環境変数 GEMINI_API_KEY に Google Generative AI API キーを設定してください。
// デプロイ方法: Deno Deploy ダッシュボードから新規 Project を作成し、
// GitHub リポジトリ (このディレクトリ) を指定すると自動でデプロイされます。

import { Hono } from "https://deno.land/x/hono@v3.10.4/mod.ts";
import { cors } from "https://deno.land/x/hono@v3.10.4/middleware.ts";

const app = new Hono();
app.use("/*", cors());

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const CHAT_MODEL = "gemini-pro";
const VISION_MODEL = "gemini-pro-vision";

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set");
}

app.post("/api/chat-optimize", async (c) => {
  const { prompt } = await c.req.json();
  if (!prompt) return c.json({ error: "prompt is required" }, 400);

  const resp = await fetch(
    `${GEMINI_URL_BASE}/${CHAT_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    },
  );
  if (!resp.ok) {
    return c.json({ error: await resp.text() }, 500);
  }
  const data = await resp.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return c.json({ text });
});

app.post("/api/image-identify", async (c) => {
  const { imageBase64 } = await c.req.json();
  if (!imageBase64) return c.json({ error: "imageBase64 is required" }, 400);
  const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  const resp = await fetch(
    `${GEMINI_URL_BASE}/${VISION_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "この画像はどのアニメ作品か特定してください。日本語タイトルのみ返してください。" },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      }),
    },
  );
  if (!resp.ok) {
    return c.json({ error: await resp.text() }, 500);
  }
  const data = await resp.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return c.json({ text });
});

export default app;
