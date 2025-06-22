// deno_backend/main.ts
// Deno Deploy 用 Cloud Function。エンドポイント:
//   POST /api/chat-optimize    { prompt: string }
//   POST /api/image-identify   { imageBase64: string }
//   GET /api/list-models
// 環境変数 GEMINI_API_KEY に Google Generative AI API キーを設定してください。
// デプロイ方法: Deno Deploy ダッシュボードから新規 Project を作成し、
// GitHub リポジトリ (このディレクトリ) を指定すると自動でデプロイされます。

import { Hono } from "https://deno.land/x/hono@v3.10.4/mod.ts";
import { cors } from "https://deno.land/x/hono@v3.10.4/middleware.ts";

const app = new Hono();
app.use("/*", cors());

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL_BASE = "https://generativelanguage.googleapis.com/v1/models";
const CHAT_MODEL = "gemini-1.5-pro";
const VISION_MODEL = "gemini-1.0-pro-vision-latest";

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set");
}

app.get("/api/list-models", async (c) => {
  try {
    console.log("[/api/list-models] Fetching available models");
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`[/api/list-models] API error: ${resp.status}`, errorText);
      return c.json({ error: "Failed to fetch models", details: errorText }, resp.status);
    }

    const data = await resp.json();
    console.log("[/api/list-models] Available models:", JSON.stringify(data, null, 2));
    return c.json(data);
  } catch (e) {
    console.error("[/api/list-models] Error:", e);
    return c.json({ error: "Internal Server Error", details: e.message }, 500);
  }
});

app.post("/api/chat-optimize", async (c) => {
  try {
    console.log("[/api/chat-optimize] Received request");
    const body = await c.req.json();
    console.log("[/api/chat-optimize] Request body:", JSON.stringify(body));
    const { prompt } = body;

    if (!prompt) {
      console.error("[/api/chat-optimize] Validation failed: prompt is missing.");
      return c.json({ error: "prompt is required" }, 400);
    }

    const resp = await fetch(
      `${GEMINI_URL_BASE}/${CHAT_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
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
      const errorText = await resp.text();
      console.error(`[/api/chat-optimize] Gemini API error: ${resp.status}`, errorText);
      return c.json({ error: "Gemini API request failed", details: errorText }, resp.status);
    }

    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    console.log("[/api/chat-optimize] Successfully processed. Returning text.");
    return c.json({ text });
  } catch (e) {
    console.error("[/api/chat-optimize] Error processing request:", e);
    return c.json({ error: "Internal Server Error", details: e.message }, 500);
  }
});

app.post("/api/image-identify", async (c) => {
  try {
    console.log("[/api/image-identify] Received request");
    const body = await c.req.json();
    console.log("[/api/image-identify] Request body received (size check).");
    const { imageBase64 } = body;

    if (!imageBase64) {
      console.error("[/api/image-identify] Validation failed: imageBase64 is missing.");
      return c.json({ error: "imageBase64 is required" }, 400);
    }
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
      const errorText = await resp.text();
      console.error(`[/api/image-identify] Gemini API error: ${resp.status}`, errorText);
      return c.json({ error: "Gemini API request failed", details: errorText }, resp.status);
    }

    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    console.log("[/api/image-identify] Successfully processed. Returning text.");
    return c.json({ text });
  } catch (e) {
    console.error("[/api/image-identify] Error processing request:", e);
    return c.json({ error: "Internal Server Error", details: e.message }, 500);
  }
});

export default app;
