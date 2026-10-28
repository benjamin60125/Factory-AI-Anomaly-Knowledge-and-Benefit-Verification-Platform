/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Case, AISuggestion, SimilarCaseResult, StructuredAiResponse } from '../types';
import { fetchAiSuggestion } from '../utils/aiMatcher';
import {
  Cpu,
  Search,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Bookmark,
  CheckCircle,
  HelpCircle,
  FileQuestion,
  Layers,
  Wrench,
  Loader2,
  Send,
  Zap,
} from 'lucide-react';

interface AiAssistantTabProps {
  cases: Case[];
  initialQuery?: {
    line: string;
    equipment: string;
    symptoms: string;
    additionalNotes?: string;
  };
  onSendToReview: (suggestion: AISuggestion) => void;
}

export const AiAssistantTab: React.FC<AiAssistantTabProps> = ({
  cases,
  initialQuery,
  onSendToReview,
}) => {
  const [line, setLine] = useState(initialQuery?.line || '');
  const [equipment, setEquipment] = useState(initialQuery?.equipment || '');
  const [symptoms, setSymptoms] = useState(initialQuery?.symptoms || '');
  const [additionalNotes, setAdditionalNotes] = useState(initialQuery?.additionalNotes || '');

  const [isLoading, setIsLoading] = useState(false);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [similarCases, setSimilarCases] = useState<SimilarCaseResult[]>([]);
  const [structuredResponse, setStructuredResponse] = useState<StructuredAiResponse | null>(null);
  const [isModelGenerated, setIsModelGenerated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Quick preset samples
  const handleApplyPreset = (preset: { line: string; equip: string; symp: string; notes: string }) => {
    setLine(preset.line);
    setEquipment(preset.equip);
    setSymptoms(preset.symp);
    setAdditionalNotes(preset.notes);
    setErrorMessage('');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!line.trim() || !equipment.trim() || !symptoms.trim()) {
      setErrorMessage('請填寫產線、設備與異常徵兆！');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await fetchAiSuggestion(
        {
          line: line.trim(),
          equipment: equipment.trim(),
          symptoms: symptoms.trim(),
          additionalNotes: additionalNotes.trim(),
        },
        cases
      );

      setSimilarCases(result.similarCases);
      setStructuredResponse(result.structuredResponse);
      setIsModelGenerated(result.isModelGenerated);
      setSearchExecuted(true);
    } catch (err: any) {
      setErrorMessage('檢索時發生非預期錯誤，請重新嘗試。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForwardToReview = () => {
    if (!structuredResponse) return;

    const newSuggestion: AISuggestion = {
      id: `SUGG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      inputQuery: {
        line,
        equipment,
        symptoms,
        additionalNotes,
      },
      similarCases,
      structuredResponse,
      isModelGenerated,
      status: '待覆核',
    };

    onSendToReview(newSuggestion);
  };

  return (
    <div className="space-y-6">
      {/* Safety Protocol Banner (Strict Enforcement) */}
      <div className="bg-slate-900 border-l-4 border-l-amber-500 border border-slate-800 rounded-r-lg p-4 text-xs text-slate-300 shadow-sm flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white text-sm">
            現場異常排查 AI 安全準則與免責協定 (Strict Safety Protocol)
          </span>
          <p className="leading-relaxed text-slate-300">
            本 AI 系統旨在檢索歷史案例庫與加速經驗傳承。
            <strong>
              不得宣稱 AI 已確定根因，亦嚴禁自動執行設備控制、停機、復機或品質放行
            </strong>
            。所有步驟僅供排查輔助參考，必須經現場合格師傅與工程人員人工覆核簽核後方可實施。
          </p>
        </div>
      </div>

      {/* Query Form & Presets Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span>現場異常特徵檢索與 AI 處置分析</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              輸入當前機台異音、震動、溫度或警報特徵，AI 自動檢索相似經驗並生成結構化建議
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] mr-1">快捷示範：</span>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  line: 'SMT 高速貼片線 A',
                  equip: '迴焊爐 Reflow-02',
                  symp: '第4溫區溫度劇烈上下波動，出爐後 BGA 出現微量冷焊與虛焊',
                  notes: '鏈條速度與氮氣流量正常，面板顯示加熱功率偶爾跳動',
                })
              }
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 text-[11px]"
            >
              迴焊爐溫控飄移
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  line: '精密加工二廠',
                  equip: 'CNC 五軸銑床 VMC-500',
                  symp: '主軸 12,000 RPM 切削時發出尖銳嘯叫，加工表面出現高頻波浪紋',
                  notes: '刀具剛換裝新銑刀，外伸約 80mm',
                })
              }
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 text-[11px]"
            >
              CNC主軸抖紋
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  line: '射出成型三線',
                  equip: '油電混合射出機 INJ-180',
                  symp: '鏡片模具末端有短射缺陷，射出終點螺桿後退量異常',
                  notes: '射出壓力已達 135 bar，但料管無法保持穩定熔膠峰壓',
                })
              }
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 text-[11px]"
            >
              射出機短射
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  line: '半導體封裝線',
                  equip: '自動固晶機 DB-03',
                  symp: '晶粒高速拾取良率降低，頻繁跳出 Vacuum Low 真空警報',
                  notes: '真空源壓力顯示正常，但吸嘴尖端似乎有些微銀膠殘留',
                })
              }
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 text-[11px]"
            >
              固晶吸嘴真空不足
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                所屬產線 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={line}
                onChange={e => setLine(e.target.value)}
                placeholder="例：SMT 高速貼片線 A"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                異常設備名稱 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={equipment}
                onChange={e => setEquipment(e.target.value)}
                placeholder="例：迴焊爐 Reflow-02"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              現場異常徵兆描述 (現像、警報代碼、感官異狀) <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder="請詳細記錄機台出現之警報代碼、異音頻率、冒煙焦味、尺寸或外觀不良特徵..."
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              現場補充描述 (選填，如：剛剛是否換線、換料、停電重開機或更換刀具)
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              placeholder="例：今日早上剛進行例行保養更換冷卻液，換線後首件試切即發生"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
            />
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI 檢索與處置推論中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>檢索相似案例並產生處置建議</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Display */}
      {searchExecuted && structuredResponse && (
        <div className="space-y-6">
          {/* Top 3 Similar Cases Found */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Bookmark className="w-4 h-4 text-blue-400" />
                <span>
                  案例庫匹配結果 (共檢索出 {similarCases.length} 筆最相似案例)
                </span>
              </h4>
              <span className="text-xs text-slate-400">
                比對基底：共 {cases.length} 筆歷史案例
              </span>
            </div>

            {similarCases.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center space-y-2">
                <FileQuestion className="w-8 h-8 text-amber-500 mx-auto" />
                <h5 className="text-sm font-semibold text-white">案例資料不足，請由現場人員確認</h5>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  案例庫中查無與當前產線/設備或異常特徵關聯度達門檻之案例。為避免捏造，AI 已停止臆測，請依工廠標準 EHS 規範由現場資深人員人工排查。
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {similarCases.map(item => (
                  <div
                    key={item.caseId}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/80">
                          {item.caseId}
                        </span>
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            item.similarity >= 80
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}
                        >
                          相似度 {item.similarity}%
                        </span>
                      </div>

                      {/* Source */}
                      <div className="text-xs text-slate-300 font-medium line-clamp-1">
                        {item.caseSource}
                      </div>

                      {/* Possible Reason */}
                      <div className="text-[11px] text-slate-400 mt-2">
                        <strong className="text-slate-300 block">歷史根本原因：</strong>
                        <p className="line-clamp-2 mt-0.5 text-slate-300">{item.possibleReason}</p>
                      </div>

                      {/* Historical Action */}
                      <div className="text-[11px] text-slate-400 mt-2">
                        <strong className="text-slate-300 block">歷史處置作法：</strong>
                        <p className="line-clamp-2 mt-0.5 text-slate-300">{item.historicalAction}</p>
                      </div>
                    </div>

                    {/* Cautions */}
                    <div className="bg-amber-950/20 border border-amber-900/40 p-2 rounded text-[10px] text-amber-200/90 italic">
                      師傅提醒："{item.cautions.slice(0, 45)}..."
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fixed 5-Section AI Structured Report */}
          <div className="bg-slate-900 border border-blue-900/50 rounded-lg p-6 space-y-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    AI 異常處置建議結構化診斷報告
                  </h4>
                  <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span>
                      生成模式：
                      {isModelGenerated ? (
                        <span className="text-emerald-400 font-mono">Gemini Flash Lite 知識推論</span>
                      ) : (
                        <span className="text-blue-400 font-mono">內建模擬知識比對引擎</span>
                      )}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">固定五大欄位輸出</span>
                  </div>
                </div>
              </div>

              {/* Action to Forward to Human Review */}
              <button
                onClick={handleForwardToReview}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>傳送至「人工覆核」工作台</span>
              </button>
            </div>

            {/* 1.「可能原因」 */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <span>一、可能原因（研判參考，嚴禁宣稱已確定根因）</span>
              </h5>
              <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-1.5 text-xs text-slate-200">
                {structuredResponse.possibleReasons.map((reason, i) => (
                  <p key={i} className="leading-relaxed flex items-start space-x-2">
                    <span className="text-slate-500">•</span>
                    <span>{reason}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* 2.「參考案例」 */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                <span>二、參考案例（嚴格依據案例庫編號引用，不得捏造）</span>
              </h5>
              <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs">
                {structuredResponse.referencedCases.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {structuredResponse.referencedCases.map((id, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono font-medium"
                      >
                        引用案例：{id}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">查無足夠關聯之參考案例編號。</p>
                )}
              </div>
            </div>

            {/* 3.「建議檢查步驟」 */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                <span>三、建議檢查步驟（請按順序落實）</span>
              </h5>
              <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2 text-xs text-slate-200">
                {structuredResponse.recommendedSteps.map((step, i) => (
                  <div key={i} className="flex items-start space-x-2 leading-relaxed">
                    <span className="text-indigo-400 font-bold font-mono">[{i + 1}]</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4.「風險提醒」 */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                <span>四、風險提醒（安全防護與品質損害預防）</span>
              </h5>
              <div className="bg-rose-950/20 p-3.5 rounded border border-rose-900/40 space-y-1.5 text-xs text-rose-200/90">
                {structuredResponse.riskWarnings.map((warning, i) => (
                  <p key={i} className="leading-relaxed flex items-start space-x-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* 5.「需要人工確認的項目」 */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>五、需要人工確認的項目（人工負責，AI 嚴禁自動介入）</span>
              </h5>
              <div className="bg-emerald-950/20 p-3.5 rounded border border-emerald-900/40 space-y-1.5 text-xs text-emerald-200/90">
                {structuredResponse.humanConfirmationRequired.map((item, i) => (
                  <p key={i} className="leading-relaxed flex items-start space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <p>
                本處置診斷已生成完畢，點擊右側按鈕將此診斷推送到「人工覆核」工作台進行簽核與實作。
              </p>
              <button
                onClick={handleForwardToReview}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow transition-colors shrink-0"
              >
                <span>立即傳送至人工覆核</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
