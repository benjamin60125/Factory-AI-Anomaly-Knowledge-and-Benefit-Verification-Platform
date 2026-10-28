import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Shared Gemini client with required User-Agent header
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// AI Case Suggestion endpoint
app.post('/api/ai/suggest', async (req, res) => {
  try {
    const { line, equipment, symptoms, additionalNotes, candidateCases } = req.body;

    if (!line || !equipment || !symptoms) {
      return res.status(400).json({ error: '產線、設備與異常徵兆為必要輸入' });
    }

    if (!aiClient) {
      return res.status(200).json({
        simulated: true,
        reason: 'no_api_key',
        message: '未偵測到 GEMINI_API_KEY，啟動內建知識比對引擎。',
      });
    }

    // Prepare strict prompt
    const prompt = `你是一個嚴謹的製造業專家 AI 異常診斷助手。
當前工廠現場回報異常：
- 產線：${line}
- 設備：${equipment}
- 異常徵兆：${symptoms}
- 現場補充描述：${additionalNotes || '無'}

可參考的歷史知識案例資料如下（僅能引用以下案例，不得捏造不存在的編號）：
${JSON.stringify(candidateCases || [], null, 2)}

【嚴格遵循規則】：
1. 不得宣稱 AI 已確定根本原因，必須表明為「研判可能原因」。
2. 不得自動執行任何設備控制、停機、復機或品質放行指令。
3. 必須且只能引用上述提供的參考案例編號（如 CASE-2026-001），嚴禁捏造不存在的案例編號！
4. 若所提供的參考案例與現場問題關聯度不足，或案例庫資訊不夠，請明確回覆「案例資料不足，請由現場人員確認」，嚴禁胡亂編造！
5. 請以純 JSON 格式回傳，格式欄位必須嚴格包含：
{
  "possibleReasons": ["可能原因1", "可能原因2"],
  "referencedCases": ["CASE-XXXX-XXX"],
  "recommendedSteps": ["步驟1: 先進行斷電安全確認...", "步驟2: ..."],
  "riskWarnings": ["安全風險提醒1", "品質風險提醒2"],
  "humanConfirmationRequired": ["需由現場資深工程師確認項目1", "需放行確認項目2"],
  "insufficientData": false
}
若案例資料不足，將 insufficientData 設為 true，並在 possibleReasons 中註記「案例資料不足，請由現場人員確認」。`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      parsedData = {
        possibleReasons: ['無法解析 AI 模型結構化回傳，啟動保護機制'],
        referencedCases: [],
        recommendedSteps: ['請由現場人員進行手動檢查'],
        riskWarnings: ['切勿在未確認安全狀態下強行重啟機台'],
        humanConfirmationRequired: ['現場主管需親自覆核機台狀況'],
        insufficientData: true,
      };
    }

    return res.json({
      success: true,
      data: parsedData,
      simulated: false,
    });
  } catch (err: any) {
    console.error('Gemini API call failed:', err?.message || err);
    return res.status(200).json({
      simulated: true,
      reason: 'api_error',
      message: err?.message || '呼叫 Gemini API 異常，自動退回模擬推論引擎',
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`工廠 AI 異常知識平台伺服器已啟動: http://0.0.0.0:${PORT}`);
  });
}

startServer();
