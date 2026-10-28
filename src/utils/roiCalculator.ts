/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { KPISetting, ROIResult } from '../types';

export const TARGET_BENEFIT_THRESHOLD = 1000000; // 新台幣 100 萬元門檻

export function calculateROI(setting: KPISetting): ROIResult {
  // 1. 減少的停機小時 = 基準停機時間 - 改善後停機時間
  const savedDowntimeHours = Math.max(0, setting.baselineDowntimeHours - setting.improvedDowntimeHours);

  // 2. 避免停機金額 = 減少的停機小時 × 停機每小時成本
  const avoidedDowntimeCost = Math.round(savedDowntimeHours * setting.downtimeCostPerHour);

  // 3. 避免報廢金額 = 基準報廢金額 - 改善後報廢金額
  const avoidedScrapCost = Math.max(0, Math.round(setting.baselineScrapCost - setting.improvedScrapCost));

  // 4. 減少的排查工時 = 基準排查時間 - 改善後排查時間
  const savedLaborHours = Math.max(0, setting.baselineTroubleshootingHours - setting.improvedTroubleshootingHours);

  // 5. 節省工時金額 = 減少的排查工時 × 平均人工時薪
  const savedLaborCost = Math.round(savedLaborHours * setting.averageHourlyLaborRate);

  // 6. 單次改善效益 = 避免停機金額 + 避免報廢金額 + 節省工時金額
  const singleImprovementBenefit = avoidedDowntimeCost + avoidedScrapCost + savedLaborCost;

  // 7. 年度總效益 = 單次改善效益 × 年度預計發生次數
  const annualTotalBenefit = singleImprovementBenefit * setting.annualOccurrences;

  // 8. 系統導入成本
  const implementationCost = setting.implementationCost || 1;

  // 9. 年度淨效益 = 年度總效益 - 導入成本
  const netAnnualBenefit = annualTotalBenefit - implementationCost;

  // 10. ROI = (年度總效益 - 導入成本) ÷ 導入成本 × 100%
  const roiPercentage = implementationCost > 0
    ? Math.round(((annualTotalBenefit - implementationCost) / implementationCost) * 1000) / 10
    : 0;

  // 11. 門檻比較
  const isThresholdReached = annualTotalBenefit >= TARGET_BENEFIT_THRESHOLD;
  const thresholdGap = Math.abs(annualTotalBenefit - TARGET_BENEFIT_THRESHOLD);

  return {
    savedDowntimeHours: Math.round(savedDowntimeHours * 100) / 100,
    avoidedDowntimeCost,
    avoidedScrapCost,
    savedLaborHours: Math.round(savedLaborHours * 100) / 100,
    savedLaborCost,
    singleImprovementBenefit,
    annualTotalBenefit,
    implementationCost,
    netAnnualBenefit,
    roiPercentage,
    targetThreshold: TARGET_BENEFIT_THRESHOLD,
    isThresholdReached,
    thresholdGap,
  };
}

export function formatCurrencyNT(amount: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(amount);
}
