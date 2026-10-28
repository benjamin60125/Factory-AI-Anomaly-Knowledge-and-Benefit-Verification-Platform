/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AISuggestion, HumanReview, ReviewDecision, Case, AnomalyType } from '../types';
import {
  UserCheck,
  CheckCircle2,
  Edit3,
  XCircle,
  ShieldCheck,
  History,
  FilePlus2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Send,
  Calendar,
  Layers,
  Check,
  Sparkles,
} from 'lucide-react';

interface ReviewTabProps {
  suggestions: AISuggestion[];
  reviews: HumanReview[];
  cases: Case[];
  activeSuggestionId?: string;
  onSaveReview: (review: HumanReview, updatedSuggestion: AISuggestion) => void;
  onWriteBackAsCase: (newCase: Case, reviewId: string) => void;
}

export const ReviewTab: React.FC<ReviewTabProps> = ({
  suggestions,
  reviews,
  cases,
  activeSuggestionId,
  onSaveReview,
  onWriteBackAsCase,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  // Find currently selected suggestion for review
  const pendingSuggestions = suggestions.filter(s => s.status === '待覆核');
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string>(
    activeSuggestionId || pendingSuggestions[0]?.id || ''
  );

  const selectedSuggestion = suggestions.find(s => s.id === selectedSuggestionId);

  // Review Form States
  const [decision, setDecision] = useState<ReviewDecision>('採用');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [actualRemediation, setActualRemediation] = useState('');
  const [decisionReason, setDecisionReason] = useState('');
  const [reviewer, setReviewer] = useState('蔡師傅 (資深機電維修領班)');
  const [safetyCertified, setSafetyCertified] = useState(true);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Write-back modal state
  const [writeBackReview, setWriteBackReview] = useState<HumanReview | null>(null);
  const [wbLine, setWbLine] = useState('');
  const [wbEquip, setWbEquip] = useState('');
  const [wbType, setWbType] = useState<AnomalyType>('溫度異常');
  const [wbSymptoms, setWbSymptoms] = useState('');
  const [wbParams, setWbParams] = useState('');
  const [wbDowntime, setWbDowntime] = useState(30);
  const [wbScrap, setWbScrap] = useState(5000);
  const [wbHours, setWbHours] = useState(0.8);

  // Sync suggestion default content into form
  React.useEffect(() => {
    if (selectedSuggestion) {
      if (selectedSuggestion.structuredResponse?.possibleReasons?.[0]) {
        setFinalDiagnosis(selectedSuggestion.structuredResponse.possibleReasons[0]);
      }
      if (selectedSuggestion.structuredResponse?.recommendedSteps?.[0]) {
        setActualRemediation(
          selectedSuggestion.structuredResponse.recommendedSteps.join('\n')
        );
      }
      setDecisionReason('經現場資深工程師覆核，此處置方案符合設備規格與安全要求。');
      setFormError('');
      setSuccessMessage('');
    }
  }, [selectedSuggestionId]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuggestion) return;

    if (!finalDiagnosis.trim()) {
      setFormError('請填寫師傅「最終判斷」！');
      return;
    }
    if (!actualRemediation.trim()) {
      setFormError('請填寫現場「實際處置」！');
      return;
    }
    if ((decision === '修改後採用' || decision === '拒絕') && !decisionReason.trim()) {
      setFormError('選擇修改或拒絕時，必須詳細填寫「拒絕或修改原因」！');
      return;
    }
    if (!reviewer.trim()) {
      setFormError('請填寫「覆核人」姓名與身分！');
      return;
    }
    if (!safetyCertified) {
      setFormError('依據工廠安全規範，必須勾選確認現場安全與品質放行由人工負責！');
      return;
    }

    const reviewId = `REV-${Date.now().toString().slice(-6)}`;
    const newReview: HumanReview = {
      id: reviewId,
      suggestionId: selectedSuggestion.id,
      querySummary: `${selectedSuggestion.inputQuery.equipment} - ${selectedSuggestion.inputQuery.symptoms.slice(0, 30)}`,
      decision,
      finalDiagnosis: finalDiagnosis.trim(),
      actualRemediation: actualRemediation.trim(),
      decisionReason: decisionReason.trim(),
      reviewer: reviewer.trim(),
      safetyCertified: true,
      createdAt: new Date().toISOString(),
      isSavedToKnowledgeBase: false,
    };

    const updatedSuggestion: AISuggestion = {
      ...selectedSuggestion,
      status: '已覆核',
      reviewId,
    };

    onSaveReview(newReview, updatedSuggestion);
    setSuccessMessage(`覆核已成功儲存！決定為「${decision}」，安全權責已記錄。`);
    setFormError('');
  };

  // Trigger write-back to case library
  const handleOpenWriteBack = (review: HumanReview) => {
    const parentSuggestion = suggestions.find(s => s.id === review.suggestionId);
    setWriteBackReview(review);
    setWbLine(parentSuggestion?.inputQuery.line || '現場加工線');
    setWbEquip(parentSuggestion?.inputQuery.equipment || '關鍵生產設備');
    setWbType('溫度異常');
    setWbSymptoms(parentSuggestion?.inputQuery.symptoms || '現場異常徵兆');
    setWbParams('現場即時量測參數記錄');
    setWbDowntime(35);
    setWbScrap(6000);
    setWbHours(0.75);
  };

  const handleConfirmWriteBack = () => {
    if (!writeBackReview) return;

    const newId = `CASE-${new Date().getFullYear()}-${String(cases.length + 1).padStart(3, '0')}`;
    const newCase: Case = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      line: wbLine.trim(),
      equipment: wbEquip.trim(),
      anomalyType: wbType,
      symptoms: wbSymptoms.trim(),
      parameters: wbParams.trim(),
      rootCause: writeBackReview.finalDiagnosis,
      actionSteps: writeBackReview.actualRemediation,
      reasoning: writeBackReview.decisionReason || '經人工覆核驗證之有效現場排查路徑。',
      resolutionResult: '經現場師傅覆核並處置完成，運轉指標恢復正常標準。',
      downtimeMinutes: wbDowntime,
      scrapCost: wbScrap,
      troubleshootingHours: wbHours,
      recordedBy: writeBackReview.reviewer,
      keywords: [wbType, wbEquip, '覆核沉澱'],
      reviewStatus: '已覆核',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onWriteBackAsCase(newCase, writeBackReview.id);
    setWriteBackReview(null);
    setSuccessMessage(`已成功將覆核結論回寫至知識庫，生成新案例編號：${newId}！`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Strict Human Authority */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>人工專家覆核工作台</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                人工負責 (Human-in-the-Loop)
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              安全、品質放行、設備停復機決策一律標示為人工負責，保留完整簽核軌跡並沉澱為新知識案例
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-md bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            待覆核隊列 ({pendingSuggestions.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            覆核歷史紀錄 ({reviews.length})
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-emerald-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Pending Suggestions Queue List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold uppercase tracking-wider">待覆核建議隊列</span>
              <span>{pendingSuggestions.length} 筆等待審查</span>
            </div>

            {pendingSuggestions.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p>目前所有 AI 診斷皆已完成覆核！</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  若有新異常，可至「AI 相似案例助手」檢索並轉送覆核。
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {pendingSuggestions.map(sugg => {
                  const isSelected = sugg.id === selectedSuggestionId;
                  return (
                    <div
                      key={sugg.id}
                      onClick={() => setSelectedSuggestionId(sugg.id)}
                      className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-950/40 border-blue-500 text-white shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[11px] font-bold text-blue-400">
                          {sugg.id}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(sugg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-100 line-clamp-1">
                        {sugg.inputQuery.equipment}
                      </div>
                      <div className="text-slate-400 text-[11px] line-clamp-2 mt-1">
                        {sugg.inputQuery.symptoms}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[10px]">
                        <span className="text-slate-400">{sugg.inputQuery.line}</span>
                        <span className="text-amber-400 font-medium">待師傅簽核</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Review Workspace (8 cols) */}
          <div className="lg:col-span-8">
            {!selectedSuggestion ? (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center text-slate-400 text-xs">
                請由左側隊列中選擇一筆待覆核的 AI 建議進行審查。
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 shadow">
                {/* Top Suggestion Summary */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-400">
                      審查建議代號：{selectedSuggestion.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {selectedSuggestion.inputQuery.line}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    設備：{selectedSuggestion.inputQuery.equipment}
                  </h4>
                  <p className="text-xs text-slate-300">
                    <strong>異常徵兆：</strong> {selectedSuggestion.inputQuery.symptoms}
                  </p>
                  {selectedSuggestion.structuredResponse?.referencedCases?.length > 0 && (
                    <div className="text-[11px] text-slate-400 pt-1">
                      <strong>AI 參考案例編號：</strong>{' '}
                      {selectedSuggestion.structuredResponse.referencedCases.join(', ')}
                    </div>
                  )}
                </div>

                {/* Review Action Form */}
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Decision Choice */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      師傅審查決定 <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <label
                        className={`flex items-center justify-center space-x-2 p-3 rounded-lg border cursor-pointer text-xs font-semibold transition-all ${
                          decision === '採用'
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="decision"
                          value="採用"
                          checked={decision === '採用'}
                          onChange={() => setDecision('採用')}
                          className="sr-only"
                        />
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>採用 (Adopt)</span>
                      </label>

                      <label
                        className={`flex items-center justify-center space-x-2 p-3 rounded-lg border cursor-pointer text-xs font-semibold transition-all ${
                          decision === '修改後採用'
                            ? 'bg-blue-950/60 border-blue-500 text-blue-200 ring-1 ring-blue-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="decision"
                          value="修改後採用"
                          checked={decision === '修改後採用'}
                          onChange={() => setDecision('修改後採用')}
                          className="sr-only"
                        />
                        <Edit3 className="w-4 h-4 text-blue-400" />
                        <span>修改後採用</span>
                      </label>

                      <label
                        className={`flex items-center justify-center space-x-2 p-3 rounded-lg border cursor-pointer text-xs font-semibold transition-all ${
                          decision === '拒絕'
                            ? 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="decision"
                          value="拒絕"
                          checked={decision === '拒絕'}
                          onChange={() => setDecision('拒絕')}
                          className="sr-only"
                        />
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>拒絕 (Reject)</span>
                      </label>
                    </div>
                  </div>

                  {/* Final Diagnosis */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      師傅最終判斷 (真實異常物理起因) <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={finalDiagnosis}
                      onChange={e => setFinalDiagnosis(e.target.value)}
                      placeholder="請填寫經師傅現場檢查後確認的真實根本原因..."
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                    />
                  </div>

                  {/* Actual Remediation */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      現場實際處置動作 (實際執行的修復與校驗步驟) <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={actualRemediation}
                      onChange={e => setActualRemediation(e.target.value)}
                      placeholder="請詳述實際執行的處置步驟、更換之零件型號、校準儀器或數值..."
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                    />
                  </div>

                  {/* Reason for Modification or Rejection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      拒絕或修改原因 (對 AI 建議的評語或修正理由)
                      {(decision === '修改後採用' || decision === '拒絕') && (
                        <span className="text-rose-400"> * (修改/拒絕必填)</span>
                      )}
                    </label>
                    <textarea
                      rows={2}
                      value={decisionReason}
                      onChange={e => setDecisionReason(e.target.value)}
                      placeholder="請說明為何修改或拒絕 AI 建議，例如：AI 未考量現場剛換過切削水、或是現場型號不同..."
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                    />
                  </div>

                  {/* Reviewer Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        覆核人姓名與工廠職稱 <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={reviewer}
                        onChange={e => setReviewer(e.target.value)}
                        placeholder="例：蔡文斌 (資深機電領班)"
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                      />
                    </div>

                    <div className="flex items-end pb-1">
                      <div className="text-[11px] text-slate-400">
                        覆核簽章時間：{new Date().toLocaleString('zh-TW')}
                      </div>
                    </div>
                  </div>

                  {/* Mandatory Safety Checkbox (Human-in-the-Loop Authority) */}
                  <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/60">
                    <label className="flex items-start space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={safetyCertified}
                        onChange={e => setSafetyCertified(e.target.checked)}
                        className="mt-0.5 rounded border-emerald-700 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs text-emerald-200">
                        <strong className="block text-emerald-300 mb-0.5">
                          【法規與安全責任聲明】人工負責 (Human-in-the-Loop Authority)
                        </strong>
                        本人確認已依工廠作業守則完成現場斷電 (LOTO)、機械防護與安全巡檢；
                        <strong>
                          安全防護、品質放行、設備停機與復機啟動等所有重大決策，完全由現場合格人員人工負責
                        </strong>
                        ，AI 系統僅為輔助檢索資訊。
                      </div>
                    </label>
                  </div>

                  {formError && (
                    <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>儲存覆核簽核結果</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History Log Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold uppercase tracking-wider">歷史覆核軌跡紀錄</span>
            <span>共 {reviews.length} 筆歷史審查紀錄</span>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center text-slate-400 text-xs">
              目前尚無已完成之覆核紀錄。
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">覆核編號 / 時間</th>
                      <th className="py-3 px-4">決定 (Decision)</th>
                      <th className="py-3 px-4">師傅最終判斷與處置</th>
                      <th className="py-3 px-4">修改/拒絕原因</th>
                      <th className="py-3 px-4">覆核人</th>
                      <th className="py-3 px-4 text-center">責任標章</th>
                      <th className="py-3 px-4 text-right">回寫知識庫</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {reviews.map(rev => (
                      <tr key={rev.id} className="hover:bg-slate-850/60 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-200">{rev.id}</div>
                          <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(rev.createdAt).toLocaleString('zh-TW')}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-bold inline-flex items-center space-x-1 ${
                              rev.decision === '採用'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : rev.decision === '修改後採用'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            <span>{rev.decision}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-medium text-slate-200 line-clamp-1">
                            {rev.finalDiagnosis}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {rev.actualRemediation}
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-xs text-slate-400 text-[11px]">
                          {rev.decisionReason || '—'}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-200">
                          {rev.reviewer}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] inline-flex items-center space-x-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>人工負責</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          {rev.isSavedToKnowledgeBase ? (
                            <span className="text-emerald-400 text-xs font-mono font-medium flex items-center justify-end space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>已回寫 ({rev.newCaseId || 'CASE'})</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenWriteBack(rev)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-medium"
                              title="將本覆核處置沉澱為案例庫的新知識案例"
                            >
                              <FilePlus2 className="w-3.5 h-3.5" />
                              <span>回寫為新案例</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Write-Back Modal */}
      {writeBackReview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <FilePlus2 className="w-5 h-5 text-blue-400" />
              <h4 className="font-bold text-white text-base">沉澱覆核經驗至案例知識庫</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              系統將把覆核人 <strong className="text-white">{writeBackReview.reviewer}</strong>{' '}
              確認的「最終判斷」與「實際處置」自動包裝為新知識案例，讓其他班別與新手工程師在日後遭遇類似異常時能快速檢索！
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">產線名稱</label>
                  <input
                    type="text"
                    value={wbLine}
                    onChange={e => setWbLine(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">設備名稱</label>
                  <input
                    type="text"
                    value={wbEquip}
                    onChange={e => setWbEquip(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">異常徵兆摘要</label>
                <input
                  type="text"
                  value={wbSymptoms}
                  onChange={e => setWbSymptoms(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">停機分鐘</label>
                  <input
                    type="number"
                    value={wbDowntime}
                    onChange={e => setWbDowntime(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">報廢金額 (NT$)</label>
                  <input
                    type="number"
                    value={wbScrap}
                    onChange={e => setWbScrap(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">排查工時 (h)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={wbHours}
                    onChange={e => setWbHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setWriteBackReview(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
              >
                取消
              </button>
              <button
                onClick={handleConfirmWriteBack}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
              >
                確認回寫知識庫
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
