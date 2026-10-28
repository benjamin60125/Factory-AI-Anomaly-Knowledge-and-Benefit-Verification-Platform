/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AnomalyType =
  | '溫度異常'
  | '震動過大'
  | '壓力洩漏'
  | '尺寸超差'
  | '異音警報'
  | '伺服過載'
  | '真空不足'
  | '表面瑕疵'
  | '其他異常';

export type ReviewStatus = '已覆核' | '待覆核' | '需補充';

export interface Case {
  id: string; // 案例編號，例如 CASE-2026-001
  date: string; // YYYY-MM-DD
  line: string; // 產線
  equipment: string; // 設備
  anomalyType: AnomalyType; // 異常類型
  symptoms: string; // 異常徵兆
  parameters: string; // 設備參數
  rootCause: string; // 根本原因
  actionSteps: string; // 處置步驟
  reasoning: string; // 判斷理由 (老師傅經驗思維)
  resolutionResult: string; // 處理結果
  downtimeMinutes: number; // 停機分鐘
  scrapCost: number; // 報廢金額 (NT$)
  troubleshootingHours: number; // 排查工時 (小時)
  recordedBy: string; // 填寫人 / 師傅姓名
  keywords: string[]; // 關鍵字
  reviewStatus: ReviewStatus; // 覆核狀態
  createdAt: string;
  updatedAt: string;
}

export interface SimilarCaseResult {
  caseId: string;
  similarity: number; // 0 - 100%
  caseSource: string; // 產線與設備資訊
  possibleReason: string; // 可能原因
  historicalAction: string; // 歷史處置方式
  cautions: string; // 注意事項
}

export interface StructuredAiResponse {
  possibleReasons: string[]; // 可能原因 (不得宣稱確定根因)
  referencedCases: string[]; // 參考案例 (必須引用有效案例編號)
  recommendedSteps: string[]; // 建議檢查步驟
  riskWarnings: string[]; // 風險提醒
  humanConfirmationRequired: string[]; // 需要人工確認的項目
  insufficientData?: boolean; // 是否案例不足
}

export interface AISuggestion {
  id: string;
  timestamp: string;
  inputQuery: {
    line: string;
    equipment: string;
    symptoms: string;
    additionalNotes?: string;
  };
  similarCases: SimilarCaseResult[];
  structuredResponse: StructuredAiResponse;
  isModelGenerated: boolean;
  status: '待覆核' | '已覆核';
  reviewId?: string;
}

export type ReviewDecision = '採用' | '修改後採用' | '拒絕';

export interface HumanReview {
  id: string;
  suggestionId: string; // 對應的 AI 建議 ID
  querySummary: string; // 查詢摘要
  decision: ReviewDecision; // 採用 / 修改後採用 / 拒絕
  finalDiagnosis: string; // 師傅最終判斷
  actualRemediation: string; // 實際處置
  decisionReason: string; // 拒絕或修改原因
  reviewer: string; // 覆核人 (如：陳建宏 廠務技師)
  safetyCertified: boolean; // 安全與責任確認 (人工負責)
  createdAt: string;
  isSavedToKnowledgeBase: boolean; // 是否已回寫為新知識案例
  newCaseId?: string; // 回寫後產生的案例編號
}

export interface KPISetting {
  downtimeCostPerHour: number; // 停機每小時成本 (NT$/hr)
  averageHourlyLaborRate: number; // 平均人工時薪 (NT$/hr)
  baselineTroubleshootingHours: number; // 基準排查時間 (小時)
  improvedTroubleshootingHours: number; // 改善後排查時間 (小時)
  baselineDowntimeHours: number; // 基準停機時間 (小時)
  improvedDowntimeHours: number; // 改善後停機時間 (小時)
  baselineScrapCost: number; // 基準報廢金額 (NT$)
  improvedScrapCost: number; // 改善後報廢金額 (NT$)
  annualOccurrences: number; // 年度預計發生次數 (次/年)
  implementationCost: number; // 系統導入成本 (NT$)
}

export interface ROIResult {
  savedDowntimeHours: number; // 減少的停機小時
  avoidedDowntimeCost: number; // 避免停機金額 (NT$)
  avoidedScrapCost: number; // 避免報廢金額 (NT$)
  savedLaborHours: number; // 減少的排查工時
  savedLaborCost: number; // 節省工時金額 (NT$)
  singleImprovementBenefit: number; // 單次改善效益 (NT$)
  annualTotalBenefit: number; // 年度總效益 (NT$)
  implementationCost: number; // 導入成本 (NT$)
  netAnnualBenefit: number; // 年度淨效益 (NT$)
  roiPercentage: number; // ROI (%)
  targetThreshold: number; // 門檻: NT$ 1,000,000
  isThresholdReached: boolean; // 是否達標
  thresholdGap: number; // 差額或超越金額 (NT$)
}

export type TabType = 'dashboard' | 'cases' | 'ai_assistant' | 'review' | 'roi';
