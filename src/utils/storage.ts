/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Case, AISuggestion, HumanReview, KPISetting } from '../types';
import { INITIAL_CASES, INITIAL_KPI_SETTINGS, INITIAL_REVIEWS, INITIAL_SUGGESTIONS } from '../data/initialData';

const STORAGE_KEYS = {
  CASES: 'factory_ai_cases_v1',
  REVIEWS: 'factory_ai_reviews_v1',
  SUGGESTIONS: 'factory_ai_suggestions_v1',
  KPI_SETTINGS: 'factory_ai_kpi_settings_v1',
};

export function loadCases(): Case[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CASES);
    if (!raw) {
      saveCases(INITIAL_CASES);
      return INITIAL_CASES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CASES;
  } catch {
    return INITIAL_CASES;
  }
}

export function saveCases(cases: Case[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  } catch (e) {
    console.error('Failed to save cases to localStorage', e);
  }
}

export function loadReviews(): HumanReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (!raw) {
      saveReviews(INITIAL_REVIEWS);
      return INITIAL_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_REVIEWS;
  } catch {
    return INITIAL_REVIEWS;
  }
}

export function saveReviews(reviews: HumanReview[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  } catch (e) {
    console.error('Failed to save reviews to localStorage', e);
  }
}

export function loadSuggestions(): AISuggestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUGGESTIONS);
    if (!raw) {
      saveSuggestions(INITIAL_SUGGESTIONS);
      return INITIAL_SUGGESTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SUGGESTIONS;
  } catch {
    return INITIAL_SUGGESTIONS;
  }
}

export function saveSuggestions(suggestions: AISuggestion[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(suggestions));
  } catch (e) {
    console.error('Failed to save suggestions to localStorage', e);
  }
}

export function loadKPISettings(): KPISetting {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.KPI_SETTINGS);
    if (!raw) {
      saveKPISettings(INITIAL_KPI_SETTINGS);
      return INITIAL_KPI_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? { ...INITIAL_KPI_SETTINGS, ...parsed } : INITIAL_KPI_SETTINGS;
  } catch {
    return INITIAL_KPI_SETTINGS;
  }
}

export function saveKPISettings(settings: KPISetting): void {
  try {
    localStorage.setItem(STORAGE_KEYS.KPI_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save KPI settings to localStorage', e);
  }
}

export interface BackupData {
  version: string;
  exportedAt: string;
  cases: Case[];
  reviews: HumanReview[];
  suggestions: AISuggestion[];
  kpiSettings: KPISetting;
}

export function exportAllData(): string {
  const data: BackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    cases: loadCases(),
    reviews: loadReviews(),
    suggestions: loadSuggestions(),
    kpiSettings: loadKPISettings(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonStr: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'JSON 格式無效，請確認檔案內容。' };
    }

    if (!Array.isArray(parsed.cases)) {
      return { success: false, message: '匯入檔案缺少必要的「cases」案例陣列。' };
    }

    saveCases(parsed.cases);
    if (Array.isArray(parsed.reviews)) saveReviews(parsed.reviews);
    if (Array.isArray(parsed.suggestions)) saveSuggestions(parsed.suggestions);
    if (parsed.kpiSettings && typeof parsed.kpiSettings === 'object') {
      saveKPISettings({ ...INITIAL_KPI_SETTINGS, ...parsed.kpiSettings });
    }

    return { success: true, message: `成功匯入 ${parsed.cases.length} 筆案例與相關設定！` };
  } catch (err: any) {
    return { success: false, message: `解析失敗: ${err?.message || '未知錯誤'}` };
  }
}

export function resetToDemoData(): void {
  saveCases(INITIAL_CASES);
  saveReviews(INITIAL_REVIEWS);
  saveSuggestions(INITIAL_SUGGESTIONS);
  saveKPISettings(INITIAL_KPI_SETTINGS);
}
