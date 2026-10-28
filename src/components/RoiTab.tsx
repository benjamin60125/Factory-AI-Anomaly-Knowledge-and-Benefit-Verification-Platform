/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { KPISetting, ROIResult } from '../types';
import { calculateROI, formatCurrencyNT, TARGET_BENEFIT_THRESHOLD } from '../utils/roiCalculator';
import {
  TrendingUp,
  DollarSign,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface RoiTabProps {
  kpiSettings: KPISetting;
  onUpdateKpiSettings: (settings: KPISetting) => void;
}

export const RoiTab: React.FC<RoiTabProps> = ({
  kpiSettings,
  onUpdateKpiSettings,
}) => {
  const roi = calculateROI(kpiSettings);

  const handleInputChange = (field: keyof KPISetting, value: number) => {
    onUpdateKpiSettings({
      ...kpiSettings,
      [field]: value,
    });
  };

  // Quick preset scenarios
  const applyPreset = (preset: Partial<KPISetting>) => {
    onUpdateKpiSettings({
      ...kpiSettings,
      ...preset,
    });
  };

  return (
    <div className="space-y-6">
      {/* 100 萬驗證門檻狀態卡片 (Strict Milestone Header) */}
      <div
        className={`rounded-lg border p-6 transition-all shadow-md ${
          roi.isThresholdReached
            ? 'bg-gradient-to-r from-emerald-950/50 via-emerald-900/30 to-slate-900 border-emerald-600'
            : 'bg-gradient-to-r from-amber-950/50 via-amber-900/30 to-slate-900 border-amber-600'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                  roi.isThresholdReached
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                }`}
              >
                {roi.isThresholdReached ? (
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
                年度驗證門檻目標：NT$ 1,000,000 元
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              年度推估總效益：{formatCurrencyNT(roi.annualTotalBenefit)}
            </h2>

            <div className="text-sm">
              {roi.isThresholdReached ? (
                <div className="text-emerald-200">
                  <span className="font-bold text-emerald-300 text-base">
                    ★ 評估結果已超越年度門檻 {formatCurrencyNT(roi.thresholdGap)}！
                  </span>
                  <p className="text-xs text-emerald-200/80 mt-0.5">
                    本年度預計發生次數 {kpiSettings.annualOccurrences} 次下，具備高度經濟效益，符合全廠擴大驗證與推廣條件。
                  </p>
                </div>
              ) : (
                <div className="text-amber-200">
                  <span className="font-bold text-amber-300 text-base">
                    ⚠ 距離 100 萬元門檻尚差 {formatCurrencyNT(roi.thresholdGap)}
                  </span>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    尚未達到擴大驗證門檻。可藉由提高案例庫覆蓋率、縮短改善後排查時間或檢視年度預計發生次數來推進達標。
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 text-right min-w-[200px]">
            <span className="text-[11px] text-slate-400 block">預估投資報酬率 ROI</span>
            <span className="text-3xl font-extrabold font-mono text-amber-400">
              {roi.roiPercentage}%
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              扣除導入成本後淨效益：{formatCurrencyNT(roi.netAnnualBenefit)}
            </span>
          </div>
        </div>

        {/* Legal / Non-Guaranteed Disclaimer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>免責宣告：</strong>這是管理參考，不可標示為保證收益。實際財務效益仍受各產線排程、訂單稼動率及現場執行紀律影響。
          </span>
        </div>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-300 font-medium">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>快速套用製造業常見情境參數：</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              applyPreset({
                downtimeCostPerHour: 18000,
                averageHourlyLaborRate: 500,
                baselineTroubleshootingHours: 2.8,
                improvedTroubleshootingHours: 0.8,
                baselineDowntimeHours: 3.2,
                improvedDowntimeHours: 1.1,
                baselineScrapCost: 16000,
                improvedScrapCost: 3500,
                annualOccurrences: 36,
                implementationCost: 150000,
              })
            }
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 font-medium"
          >
            標準 SMT / 電子裝配廠 (達標 180 萬)
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                downtimeCostPerHour: 25000,
                averageHourlyLaborRate: 600,
                baselineTroubleshootingHours: 3.5,
                improvedTroubleshootingHours: 1.2,
                baselineDowntimeHours: 4.0,
                improvedDowntimeHours: 1.5,
                baselineScrapCost: 45000,
                improvedScrapCost: 8000,
                annualOccurrences: 20,
                implementationCost: 200000,
              })
            }
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 font-medium"
          >
            重型 CNC 五軸銑削精密機械廠 (達標 200 萬)
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                downtimeCostPerHour: 8000,
                averageHourlyLaborRate: 400,
                baselineTroubleshootingHours: 1.8,
                improvedTroubleshootingHours: 1.0,
                baselineDowntimeHours: 2.0,
                improvedDowntimeHours: 1.2,
                baselineScrapCost: 6000,
                improvedScrapCost: 2500,
                annualOccurrences: 30,
                implementationCost: 100000,
              })
            }
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-medium"
          >
            小型射出成型代工廠 (未達標 30 萬)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: KPI Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>KPI 參數調整面板</span>
            </h3>
            <span className="text-[11px] text-slate-400">即時計算連動</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Cost Rates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  停機每小時成本 (NT$/hr)
                </label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={kpiSettings.downtimeCostPerHour}
                  onChange={e => handleInputChange('downtimeCostPerHour', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  平均人工時薪 (NT$/hr)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={kpiSettings.averageHourlyLaborRate}
                  onChange={e => handleInputChange('averageHourlyLaborRate', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* Troubleshooting Hours */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded border border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1">基準排查時間 (小時)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={kpiSettings.baselineTroubleshootingHours}
                  onChange={e => handleInputChange('baselineTroubleshootingHours', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-emerald-400 font-medium mb-1">改善後排查時間 (小時)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={kpiSettings.improvedTroubleshootingHours}
                  onChange={e => handleInputChange('improvedTroubleshootingHours', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-emerald-700/80 rounded p-2 text-emerald-200 font-mono text-xs"
                />
              </div>
            </div>

            {/* Downtime Hours */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded border border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1">基準停機時間 (小時)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={kpiSettings.baselineDowntimeHours}
                  onChange={e => handleInputChange('baselineDowntimeHours', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-emerald-400 font-medium mb-1">改善後停機時間 (小時)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={kpiSettings.improvedDowntimeHours}
                  onChange={e => handleInputChange('improvedDowntimeHours', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-emerald-700/80 rounded p-2 text-emerald-200 font-mono text-xs"
                />
              </div>
            </div>

            {/* Scrap Cost */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded border border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1">基準報廢金額 (NT$)</label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={kpiSettings.baselineScrapCost}
                  onChange={e => handleInputChange('baselineScrapCost', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-emerald-400 font-medium mb-1">改善後報廢金額 (NT$)</label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={kpiSettings.improvedScrapCost}
                  onChange={e => handleInputChange('improvedScrapCost', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-emerald-700/80 rounded p-2 text-emerald-200 font-mono text-xs"
                />
              </div>
            </div>

            {/* Annual Occurrences & Implementation Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  年度預計發生次數 (次/年)
                </label>
                <input
                  type="number"
                  min={1}
                  value={kpiSettings.annualOccurrences}
                  onChange={e => handleInputChange('annualOccurrences', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  平台導入與建置成本 (NT$)
                </label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={kpiSettings.implementationCost}
                  onChange={e => handleInputChange('implementationCost', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mathematical Formulas & Detailed Step-by-Step Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5 shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>效益公式與逐步計算明細 (Mathematical Breakdown)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              依工廠規格逐項展開
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Step 1: 避免停機金額 */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="text-emerald-400">【項目一】避免停機金額</span>
                <span className="font-mono text-sm text-emerald-300 font-bold">
                  {formatCurrencyNT(roi.avoidedDowntimeCost)}
                </span>
              </div>
              <p className="text-slate-400 font-mono text-[11px]">
                公式：減少的停機小時 × 停機每小時成本
              </p>
              <div className="p-2 rounded bg-slate-900 text-slate-300 font-mono text-[11px] leading-relaxed">
                = (基準停機 {kpiSettings.baselineDowntimeHours}h - 改善後 {kpiSettings.improvedDowntimeHours}h) × {formatCurrencyNT(kpiSettings.downtimeCostPerHour)}
                <br />
                = 減少 {roi.savedDowntimeHours} 小時 × {formatCurrencyNT(kpiSettings.downtimeCostPerHour)} ={' '}
                <strong className="text-emerald-300">{formatCurrencyNT(roi.avoidedDowntimeCost)}</strong>
              </div>
            </div>

            {/* Step 2: 避免報廢金額 */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="text-rose-400">【項目二】避免報廢金額</span>
                <span className="font-mono text-sm text-rose-300 font-bold">
                  {formatCurrencyNT(roi.avoidedScrapCost)}
                </span>
              </div>
              <p className="text-slate-400 font-mono text-[11px]">
                公式：基準報廢金額 － 改善後報廢金額
              </p>
              <div className="p-2 rounded bg-slate-900 text-slate-300 font-mono text-[11px] leading-relaxed">
                = {formatCurrencyNT(kpiSettings.baselineScrapCost)} - {formatCurrencyNT(kpiSettings.improvedScrapCost)} ={' '}
                <strong className="text-rose-300">{formatCurrencyNT(roi.avoidedScrapCost)}</strong>
              </div>
            </div>

            {/* Step 3: 節省工時金額 */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="text-sky-400">【項目三】節省工時金額</span>
                <span className="font-mono text-sm text-sky-300 font-bold">
                  {formatCurrencyNT(roi.savedLaborCost)}
                </span>
              </div>
              <p className="text-slate-400 font-mono text-[11px]">
                公式：減少的排查工時 × 平均人工時薪
              </p>
              <div className="p-2 rounded bg-slate-900 text-slate-300 font-mono text-[11px] leading-relaxed">
                = (基準排查 {kpiSettings.baselineTroubleshootingHours}h - 改善後 {kpiSettings.improvedTroubleshootingHours}h) × {formatCurrencyNT(kpiSettings.averageHourlyLaborRate)}
                <br />
                = 減少 {roi.savedLaborHours} 小時 × {formatCurrencyNT(kpiSettings.averageHourlyLaborRate)} ={' '}
                <strong className="text-sky-300">{formatCurrencyNT(roi.savedLaborCost)}</strong>
              </div>
            </div>

            {/* Step 4: 單次與年度總效益 */}
            <div className="bg-slate-950 p-4 rounded-lg border border-blue-900/40 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="text-blue-400">【項目四】單次改善效益 ＆ 年度總效益</span>
                <span className="font-mono text-base text-blue-300 font-bold">
                  年度：{formatCurrencyNT(roi.annualTotalBenefit)}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 text-slate-300 font-mono text-[11px] space-y-1.5 leading-relaxed">
                <div>
                  <strong>單次改善效益</strong> = 避免停機 ({formatCurrencyNT(roi.avoidedDowntimeCost)}) + 避免報廢 ({formatCurrencyNT(roi.avoidedScrapCost)}) + 節省工時 ({formatCurrencyNT(roi.savedLaborCost)})
                  <br />= <span className="text-yellow-300 font-bold">{formatCurrencyNT(roi.singleImprovementBenefit)} / 次</span>
                </div>
                <div className="pt-1 border-t border-slate-800">
                  <strong>年度總效益</strong> = 單次改善效益 ({formatCurrencyNT(roi.singleImprovementBenefit)}) × 年度預計發生次數 ({kpiSettings.annualOccurrences} 次)
                  <br />= <span className="text-emerald-300 font-bold text-xs">{formatCurrencyNT(roi.annualTotalBenefit)} / 年</span>
                </div>
              </div>
            </div>

            {/* Step 5: ROI 公式 */}
            <div className="bg-slate-950 p-4 rounded-lg border border-amber-900/40 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="text-amber-400">【項目五】投資報酬率 (ROI)</span>
                <span className="font-mono text-base text-amber-300 font-bold">
                  {roi.roiPercentage}%
                </span>
              </div>
              <p className="text-slate-400 font-mono text-[11px]">
                公式：（年度總效益 － 導入成本）÷ 導入成本 × 100%
              </p>
              <div className="p-2.5 rounded bg-slate-900 text-slate-300 font-mono text-[11px] leading-relaxed">
                = ({formatCurrencyNT(roi.annualTotalBenefit)} - {formatCurrencyNT(roi.implementationCost)}) ÷ {formatCurrencyNT(roi.implementationCost)} × 100%
                <br />
                = 淨效益 {formatCurrencyNT(roi.netAnnualBenefit)} ÷ {formatCurrencyNT(roi.implementationCost)} × 100% ={' '}
                <strong className="text-amber-300 text-xs">{roi.roiPercentage}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
