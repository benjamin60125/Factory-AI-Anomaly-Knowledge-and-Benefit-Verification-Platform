/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, Case, AISuggestion, HumanReview, KPISetting } from './types';
import {
  loadCases,
  saveCases,
  loadReviews,
  saveReviews,
  loadSuggestions,
  saveSuggestions,
  loadKPISettings,
  saveKPISettings,
} from './utils/storage';
import { calculateROI } from './utils/roiCalculator';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { CasesTab } from './components/CasesTab';
import { AiAssistantTab } from './components/AiAssistantTab';
import { ReviewTab } from './components/ReviewTab';
import { RoiTab } from './components/RoiTab';
import { DataModal } from './components/DataModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Core Persistent State
  const [cases, setCases] = useState<Case[]>(() => loadCases());
  const [reviews, setReviews] = useState<HumanReview[]>(() => loadReviews());
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(() => loadSuggestions());
  const [kpiSettings, setKpiSettings] = useState<KPISetting>(() => loadKPISettings());

  // UI state transitions
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [aiAssistantQuery, setAiAssistantQuery] = useState<{
    line: string;
    equipment: string;
    symptoms: string;
    additionalNotes?: string;
  } | undefined>(undefined);
  const [activeReviewSuggestionId, setActiveReviewSuggestionId] = useState<string | undefined>(undefined);

  // Derived ROI state
  const roiResult = calculateROI(kpiSettings);

  // Reload handler from DataModal
  const handleDataReloaded = () => {
    setCases(loadCases());
    setReviews(loadReviews());
    setSuggestions(loadSuggestions());
    setKpiSettings(loadKPISettings());
  };

  // Case Handlers
  const handleSaveCase = (caseItem: Case) => {
    setCases(prev => {
      const existsIndex = prev.findIndex(c => c.id === caseItem.id);
      let updated: Case[];
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = caseItem;
      } else {
        updated = [caseItem, ...prev];
      }
      saveCases(updated);
      return updated;
    });
  };

  const handleDeleteCase = (id: string) => {
    setCases(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveCases(updated);
      return updated;
    });
  };

  const handleLaunchAiAssistantWithCase = (caseItem: Case) => {
    setAiAssistantQuery({
      line: caseItem.line,
      equipment: caseItem.equipment,
      symptoms: caseItem.symptoms,
      additionalNotes: `參考歷史案例 ${caseItem.id}，當時記錄參數：${caseItem.parameters}`,
    });
    setActiveTab('ai_assistant');
  };

  // AI Assistant to Review workflow
  const handleSendToReview = (suggestion: AISuggestion) => {
    setSuggestions(prev => {
      const updated = [suggestion, ...prev];
      saveSuggestions(updated);
      return updated;
    });
    setActiveReviewSuggestionId(suggestion.id);
    setActiveTab('review');
  };

  // Review Handlers
  const handleSaveReview = (review: HumanReview, updatedSuggestion: AISuggestion) => {
    setReviews(prev => {
      const updated = [review, ...prev];
      saveReviews(updated);
      return updated;
    });

    setSuggestions(prev => {
      const updated = prev.map(s => (s.id === updatedSuggestion.id ? updatedSuggestion : s));
      saveSuggestions(updated);
      return updated;
    });
  };

  // Write-Back from Review to Case Library
  const handleWriteBackAsCase = (newCase: Case, reviewId: string) => {
    handleSaveCase(newCase);

    setReviews(prev => {
      const updated = prev.map(r =>
        r.id === reviewId
          ? { ...r, isSavedToKnowledgeBase: true, newCaseId: newCase.id }
          : r
      );
      saveReviews(updated);
      return updated;
    });
  };

  // KPI Settings Handler
  const handleUpdateKpiSettings = (newSettings: KPISetting) => {
    setKpiSettings(newSettings);
    saveKPISettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Fixed Industrial Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cases={cases}
        reviews={reviews}
        suggestions={suggestions}
        isTargetReached={roiResult.isThresholdReached}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            cases={cases}
            suggestions={suggestions}
            reviews={reviews}
            roiResult={roiResult}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'cases' && (
          <CasesTab
            cases={cases}
            onSaveCase={handleSaveCase}
            onDeleteCase={handleDeleteCase}
            onLaunchAiAssistantWithCase={handleLaunchAiAssistantWithCase}
          />
        )}

        {activeTab === 'ai_assistant' && (
          <AiAssistantTab
            cases={cases}
            initialQuery={aiAssistantQuery}
            onSendToReview={handleSendToReview}
          />
        )}

        {activeTab === 'review' && (
          <ReviewTab
            suggestions={suggestions}
            reviews={reviews}
            cases={cases}
            activeSuggestionId={activeReviewSuggestionId}
            onSaveReview={handleSaveReview}
            onWriteBackAsCase={handleWriteBackAsCase}
          />
        )}

        {activeTab === 'roi' && (
          <RoiTab
            kpiSettings={kpiSettings}
            onUpdateKpiSettings={handleUpdateKpiSettings}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            工廠 AI 異常知識與效益驗證平台 • 隱性知識萃取與百萬驗證 • 支援離線 Heuristic 備援推論
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            Human-in-the-Loop Safe Architecture • All Rights Reserved
          </div>
        </div>
      </footer>

      {/* Backup & Data Management Modal */}
      <DataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onDataReloaded={handleDataReloaded}
      />
    </div>
  );
}
