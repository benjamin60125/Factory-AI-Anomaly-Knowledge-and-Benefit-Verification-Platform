/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Case, AISuggestion, HumanReview, ROIResult, TabType } from '../types';
import { formatCurrencyNT } from '../utils/roiCalculator';
import {
  FileText,
  ClockAlert,
  Percent,
  Clock,
  ShieldCheck,
  Trash2,
  Users,
  Coins,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Cpu,
  UserCheck,
} from 'lucide-react';

interface DashboardTabProps {
  cases: Case[];
  suggestions: AISuggestion[];
  reviews: HumanReview[];
  roiResult: ROIResult;
  setActiveTab: (tab: TabType) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  cases,
  suggestions,
  reviews,
  roiResult,
  setActiveTab,
}) => {
  // 1. 案例總數
  const totalCases = cases.length;

  // 2. 待覆核數
  const pendingReviewsCount = suggestions.filter(s => s.status === '待覆核').length;

  // 3. AI 建議採用率
  const adoptedReviews = reviews.filter(r => r.decision === '採用' || r.decision === '修改後採用').length;
  const totalDecided = reviews.length;
  const adoptionRate = totalDecided > 0 ? Math.round((adoptedReviews / totalDecided) * 1000) / 10 : 0;

  // 4. 平均排查時間
  const avgTroubleshootingHours =
    totalCases > 0
      ? Math.round(
          (cases.reduce((acc, c) => acc + (Number(c.troubleshootingHours) || 0), 0) / totalCases) * 10
        ) / 10
      : 0;

  // Category breakdown for anomaly types
  const anomalyCounts: Record<string, number> = {};
  cases.forEach(c => {
    anomalyCounts[c.anomalyType] = (anomalyCounts[c.anomalyType] || 0) + 1;
  });

  // Benefit breakdown calculations
  const totalSingleBenefit = roiResult.singleImprovementBenefit || 1;
  const downtimeBenefitPercent = Math.round((roiResult.avoidedDowntimeCost / totalSingleBenefit) * 100);
  const scrapBenefitPercent = Math.round((roiResult.avoidedScrapCost / totalSingleBenefit) * 100);
  const laborBenefitPercent = Math.max(0, 100 - downtimeBenefitPercent - scrapBenefitPercent);

  // Threshold progress calculation
  const thresholdProgress = Math.min(100, Math.round((roiResult.annualTotalBenefit / 1000000) * 100));

  return (
    <div className="space-y-6">
      {/* 100 萬驗證門檻 Banner */}
      <div
        className={`rounded-lg border p-5 transition-all shadow-sm ${
          roiResult.isThresholdReached
            ? 'bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-slate-900 border-emerald-600/60'
            : 'bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border-amber-600/60'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-bold tracking-wide uppercase ${
                  roiResult.isThresholdReached
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {roiResult.isThresholdReached ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>達到擴大驗證門檻</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>尚未達標</span>
                  </>
                )}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                目標門檻：{formatCurrencyNT(1000000)} / 年
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              年度推估總效益：{formatCurrencyNT(roiResult.annualTotalBenefit)}
            </h2>
            <p className="text-sm text-slate-300">
              {roiResult.isThresholdReached ? (
                <span className="text-emerald-300">
                  ★ 已超越年度 100 萬元門檻達{' '}
                  <strong className="underline underline-offset-4">{formatCurrencyNT(roiResult.thresholdGap)}</strong>
                  ，經評估具備擴大複製到全廠各產線之經濟效益！
                </span>
              ) : (
                <span className="text-amber-300">
                  ⚠ 距離 100 萬元門檻尚差{' '}
                  <strong className="underline underline-offset-4">{formatCurrencyNT(roiResult.thresholdGap)}</strong>
                  ，請前往「KPI 與 ROI」調校工廠發生頻率或改善停機時間。
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-3 self-end md:self-center">
            <button
              onClick={() => setActiveTab('roi')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>查看 ROI 效益明細</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar towards 100W */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>門檻達成進度：{thresholdProgress}%</span>
            <span>
              {formatCurrencyNT(roiResult.annualTotalBenefit)} / {formatCurrencyNT(1000000)}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                roiResult.isThresholdReached
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400'
              }`}
              style={{ width: `${Math.min(100, (roiResult.annualTotalBenefit / 1000000) * 100)}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] text-slate-400 text-right">
            ＊管理效益推估參考，實際效益受稼動率與排程影響，非保證收益。
          </div>
        </div>
      </div>

      {/* 8 核心指標卡片區 */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
          <span>運作總覽與八大核心指標</span>
          <span className="h-px bg-slate-800 flex-1" />
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 1. 案例總數 */}
          <div
            onClick={() => setActiveTab('cases')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-850"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">案例總數</span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{totalCases} <span className="text-sm font-normal text-slate-400">筆</span></div>
            <p className="text-[11px] text-slate-400 mt-1">累積傳承師傅真實異常處置</p>
          </div>

          {/* 2. 待覆核數 */}
          <div
            onClick={() => setActiveTab('review')}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              pendingReviewsCount > 0
                ? 'bg-amber-950/20 border-amber-800/60 hover:border-amber-600'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">待覆核數</span>
              <ClockAlert className={`w-4 h-4 ${pendingReviewsCount > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              <span className={pendingReviewsCount > 0 ? 'text-amber-400' : 'text-slate-300'}>
                {pendingReviewsCount}
              </span>{' '}
              <span className="text-sm font-normal text-slate-400">筆</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">需資深師傅確認放行與處置</p>
          </div>

          {/* 3. AI 建議採用率 */}
          <div
            onClick={() => setActiveTab('review')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-4 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">AI 建議採用率</span>
              <Percent className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-teal-300 font-mono">
              {adoptionRate}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              覆核採用：{adoptedReviews} / {totalDecided} 筆
            </p>
          </div>

          {/* 4. 平均排查時間 */}
          <div
            onClick={() => setActiveTab('cases')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-4 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">平均排查時間</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {avgTroubleshootingHours} <span className="text-sm font-normal text-slate-400">小時/次</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              約 {Math.round(avgTroubleshootingHours * 60)} 分鐘（導入前基準 2.8h）
            </p>
          </div>

          {/* 5. 避免停機金額 */}
          <div
            onClick={() => setActiveTab('roi')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-4 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">避免停機金額 (單次)</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-300 font-mono">
              {formatCurrencyNT(roiResult.avoidedDowntimeCost)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              省下 {roiResult.savedDowntimeHours} 小時停機損失
            </p>
          </div>

          {/* 6. 避免報廢金額 */}
          <div
            onClick={() => setActiveTab('roi')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-4 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">避免報廢金額 (單次)</span>
              <Trash2 className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-300 font-mono">
              {formatCurrencyNT(roiResult.avoidedScrapCost)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">減少盲調機台產生之材料不良</p>
          </div>

          {/* 7. 節省工時金額 */}
          <div
            onClick={() => setActiveTab('roi')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-4 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">節省工時金額 (單次)</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-sky-300 font-mono">
              {formatCurrencyNT(roiResult.savedLaborCost)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              省下 {roiResult.savedLaborHours} 小時技術員排查工時
            </p>
          </div>

          {/* 8. 投資報酬率 ROI */}
          <div
            onClick={() => setActiveTab('roi')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-4 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">預估投資報酬率 (ROI)</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300 font-mono">
              {roiResult.roiPercentage}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              單次改善效益：{formatCurrencyNT(roiResult.singleImprovementBenefit)}
            </p>
          </div>
        </div>
      </div>

      {/* 視覺化圖表與結構分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 圖表1: 單次改善效益三大構成佔比 */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white">單次效益來源構成比</h4>
            <span className="text-xs text-slate-400 font-mono">
              合計 {formatCurrencyNT(roiResult.singleImprovementBenefit)}
            </span>
          </div>

          {/* Stacked Bar */}
          <div className="w-full h-4 rounded-md overflow-hidden flex bg-slate-800 border border-slate-700">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${downtimeBenefitPercent}%` }}
              title={`避免停機: ${downtimeBenefitPercent}%`}
            />
            <div
              className="bg-rose-500 h-full"
              style={{ width: `${scrapBenefitPercent}%` }}
              title={`避免報廢: ${scrapBenefitPercent}%`}
            />
            <div
              className="bg-sky-500 h-full"
              style={{ width: `${laborBenefitPercent}%` }}
              title={`節省工時: ${laborBenefitPercent}%`}
            />
          </div>

          {/* Legend Details */}
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                <span className="text-slate-300">避免停機金額</span>
              </div>
              <div className="font-mono text-slate-200">
                {formatCurrencyNT(roiResult.avoidedDowntimeCost)} ({downtimeBenefitPercent}%)
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                <span className="text-slate-300">避免報廢金額</span>
              </div>
              <div className="font-mono text-slate-200">
                {formatCurrencyNT(roiResult.avoidedScrapCost)} ({scrapBenefitPercent}%)
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block" />
                <span className="text-slate-300">節省工時金額</span>
              </div>
              <div className="font-mono text-slate-200">
                {formatCurrencyNT(roiResult.savedLaborCost)} ({laborBenefitPercent}%)
              </div>
            </div>
          </div>
        </div>

        {/* 圖表2: 異常類型案例分佈長條圖 */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white">案例庫異常類型分佈</h4>
            <span className="text-xs text-slate-400">共 {cases.length} 筆</span>
          </div>
          <div className="space-y-2.5">
            {Object.entries(anomalyCounts).map(([type, count]) => {
              const pct = Math.round((count / Math.max(1, cases.length)) * 100);
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{type}</span>
                    <span className="text-slate-400 font-mono">
                      {count} 筆 ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 快捷操作與現場指引卡 */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">現場工廠維修流程</h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              標準作業：現場發生異常時，先至「AI 相似案例助手」檢索可能原因；再由資深師傅於「人工覆核」簽核並實施；確認有效後一鍵「回寫新案例」，讓經驗持續累積！
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('ai_assistant')}
              className="w-full flex items-center justify-between px-3 py-2 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>發起現場 AI 相似案例診斷</span>
              </div>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className="w-full flex items-center justify-between px-3 py-2 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
            >
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>覆核待確認處置建議 ({pendingReviewsCount})</span>
              </div>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
