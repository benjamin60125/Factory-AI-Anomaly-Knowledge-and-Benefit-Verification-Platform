/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Case, SimilarCaseResult, StructuredAiResponse } from '../types';

// Helper to tokenize Chinese text into words/bigrams and terms
function tokenize(text: string): string[] {
  if (!text) return [];
  const clean = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ');
  const words = clean.split(/\s+/).filter(w => w.length > 0);
  const ngrams: string[] = [];
  
  // Also generate 2-char n-grams for Chinese compound matching
  for (let i = 0; i < clean.length - 1; i++) {
    const char1 = clean[i];
    const char2 = clean[i + 1];
    if (/[\u4e00-\u9fa5]/.test(char1) && /[\u4e00-\u9fa5]/.test(char2)) {
      ngrams.push(char1 + char2);
    }
  }
  return Array.from(new Set([...words, ...ngrams]));
}

export function searchSimilarCases(
  allCases: Case[],
  query: { line: string; equipment: string; symptoms: string; additionalNotes?: string },
  limit = 3
): SimilarCaseResult[] {
  if (allCases.length === 0) return [];

  const queryText = `${query.line} ${query.equipment} ${query.symptoms} ${query.additionalNotes || ''}`;
  const queryTokens = tokenize(queryText);

  const scored = allCases.map(c => {
    let score = 0;
    const caseText = `${c.line} ${c.equipment} ${c.anomalyType} ${c.symptoms} ${c.parameters} ${c.rootCause} ${c.keywords.join(' ')}`;
    const caseTokens = tokenize(caseText);

    // 1. Direct equipment/line match
    if (c.equipment && query.equipment && (
      c.equipment.includes(query.equipment) || query.equipment.includes(c.equipment)
    )) {
      score += 35;
    }

    if (c.line && query.line && (
      c.line.includes(query.line) || query.line.includes(c.line)
    )) {
      score += 20;
    }

    // 2. Keyword / symptom token overlaps
    let tokenMatches = 0;
    for (const t of queryTokens) {
      if (t.length >= 2 && caseTokens.includes(t)) {
        tokenMatches += 1;
      }
    }
    const tokenScore = Math.min(40, tokenMatches * 4);
    score += tokenScore;

    // 3. Keywords specific match
    for (const kw of c.keywords) {
      if (queryText.includes(kw)) {
        score += 8;
      }
    }

    // Normalized similarity percentage (cap at 98%, floor at 0)
    const normalizedSimilarity = Math.min(98, Math.max(0, Math.round(score)));

    return {
      case: c,
      similarity: normalizedSimilarity,
    };
  });

  // Sort descending by similarity
  scored.sort((a, b) => b.similarity - a.similarity);

  // Return top matches that have at least some relevance (e.g. >= 20%)
  const qualified = scored.filter(s => s.similarity >= 20).slice(0, limit);

  return qualified.map(item => ({
    caseId: item.case.id,
    similarity: item.similarity,
    caseSource: `${item.case.line} / ${item.case.equipment} (${item.case.anomalyType})`,
    possibleReason: item.case.rootCause,
    historicalAction: item.case.actionSteps.split('\n')[0] || item.case.actionSteps,
    cautions: item.case.reasoning,
  }));
}

export function generateLocalStructuredSuggestion(
  query: { line: string; equipment: string; symptoms: string; additionalNotes?: string },
  matchedCases: SimilarCaseResult[],
  allCases: Case[]
): StructuredAiResponse {
  // If no sufficiently similar cases found
  if (matchedCases.length === 0) {
    return {
      possibleReasons: [
        '案例資料不足，請由現場人員確認',
        '資料庫中查無與當前產線/設備/徵兆顯著相符之歷史案例。',
      ],
      referencedCases: [],
      recommendedSteps: [
        '步驟1【停機斷電安全檢視】：啟動標準停機流程，並實施掛牌上鎖 (LOTO)。',
        '步驟2【現場巡檢】：指派當班資深技工依設備操作手冊實施基礎檢查。',
        '步驟3【知識補充】：待問題排查釐清後，請於本平台「異常案例建檔」回寫新知識。',
      ],
      riskWarnings: [
        '【注意】在缺乏歷史相似案例驗證之情況下，切勿嘗試非標準之調機參數。',
        '【品質風險】若未釐清異常徵兆強行重啟，可能衍生連鎖次級故障與嚴重報廢。',
      ],
      humanConfirmationRequired: [
        '必須由現場生產線主管及資深維修工程師現場雙人確認。',
        '設備停機、復機與產品放行皆屬人工決策責任，AI 嚴禁自動介入。',
      ],
      insufficientData: true,
    };
  }

  // Look up full case records for the matched IDs
  const referencedCasesIds = matchedCases.map(m => m.caseId);
  const referencedCaseObjects = allCases.filter(c => referencedCasesIds.includes(c.id));

  const possibleReasons: string[] = [
    `【研判可能原因一（參考 ${matchedCases[0].caseId}）】：${matchedCases[0].possibleReason}`,
  ];

  if (matchedCases.length > 1) {
    possibleReasons.push(
      `【研判可能原因二（參考 ${matchedCases[1].caseId}）】：${matchedCases[1].possibleReason}`
    );
  }

  // Build recommended steps based on actual historical actions
  const recommendedSteps: string[] = [
    '步驟1【安全確認】：由合格操作員依廠內 EHS 規定檢驗安全防護裝置，切勿在運動狀態下徒手檢修。',
  ];

  referencedCaseObjects.forEach((c, idx) => {
    const rawSteps = c.actionSteps
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    const primaryStep = rawSteps[1] || rawSteps[0] || '依設備標準作業程序排查';
    recommendedSteps.push(`步驟${idx + 2}【歷史處置參考 ${c.id}】：${primaryStep}`);
  });

  recommendedSteps.push('步驟最後【校準與驗證】：執行首件檢驗，經品保檢測數據合格後方得申請放行復機。');

  const riskWarnings: string[] = [
    '【安全提醒】：嚴禁在未確定電氣、液壓或氣壓釋放完畢前進行內部拆檢。',
    `【處置經驗戒示】：根據歷史師傅經驗（${matchedCases[0].caseId}），「${matchedCases[0].cautions.slice(0, 50)}...」，避免盲目更換昂貴大模組。`,
    '【法律與品質責任】：本 AI 建議僅供工程師診斷參考，不得宣稱已確定真實根因。',
  ];

  const humanConfirmationRequired: string[] = [
    '現場設備主管需親自覆核本次排查步驟並填寫人工覆核紀錄表。',
    '關鍵安全互鎖開關、接地阻抗與安全光柵功能確認（人工負責）。',
    '品質首件檢驗數據與產品公差公簽放行，AI 不得逕自放行。',
    '設備停機、開機與復機啟動操作必須由具備合格證照之現場人員手動執行。',
  ];

  return {
    possibleReasons,
    referencedCases: referencedCasesIds,
    recommendedSteps,
    riskWarnings,
    humanConfirmationRequired,
    insufficientData: false,
  };
}

export async function fetchAiSuggestion(
  query: { line: string; equipment: string; symptoms: string; additionalNotes?: string },
  allCases: Case[]
): Promise<{
  similarCases: SimilarCaseResult[];
  structuredResponse: StructuredAiResponse;
  isModelGenerated: boolean;
}> {
  // 1. Search for top similar cases from database
  const similarCases = searchSimilarCases(allCases, query, 3);

  // If no cases match well enough
  if (similarCases.length === 0) {
    return {
      similarCases: [],
      structuredResponse: generateLocalStructuredSuggestion(query, [], allCases),
      isModelGenerated: false,
    };
  }

  // 2. Try calling backend Gemini API
  try {
    const topCasesDetails = allCases.filter(c =>
      similarCases.some(s => s.caseId === c.id)
    ).map(c => ({
      id: c.id,
      line: c.line,
      equipment: c.equipment,
      anomalyType: c.anomalyType,
      symptoms: c.symptoms,
      parameters: c.parameters,
      rootCause: c.rootCause,
      actionSteps: c.actionSteps,
      reasoning: c.reasoning,
    }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const resp = await fetch('/api/ai/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        line: query.line,
        equipment: query.equipment,
        symptoms: query.symptoms,
        additionalNotes: query.additionalNotes,
        candidateCases: topCasesDetails,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (resp.ok) {
      const result = await resp.json();
      if (result.success && result.data) {
        // Enforce referenced cases exist in actual similarCases
        const safeReferenced = (result.data.referencedCases || []).filter((id: string) =>
          similarCases.some(s => s.caseId === id)
        );

        return {
          similarCases,
          structuredResponse: {
            possibleReasons: result.data.possibleReasons || ['請參照現場排查指引'],
            referencedCases: safeReferenced.length > 0 ? safeReferenced : [similarCases[0].caseId],
            recommendedSteps: result.data.recommendedSteps || ['請由現場人員手動檢查'],
            riskWarnings: result.data.riskWarnings || ['遵守安全操作標準作業程序'],
            humanConfirmationRequired: result.data.humanConfirmationRequired || ['需由資深工程師覆核確認'],
            insufficientData: !!result.data.insufficientData,
          },
          isModelGenerated: true,
        };
      }
    }
  } catch (err) {
    console.warn('Backend AI call skipped or failed, fallback to local engine:', err);
  }

  // 3. Fallback to local heuristic engine
  return {
    similarCases,
    structuredResponse: generateLocalStructuredSuggestion(query, similarCases, allCases),
    isModelGenerated: false,
  };
}
