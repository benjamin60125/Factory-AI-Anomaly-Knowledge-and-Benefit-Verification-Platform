/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TabType, Case, HumanReview, AISuggestion } from '../types';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Cpu,
  UserCheck,
  TrendingUp,
  Database,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  cases: Case[];
  reviews: HumanReview[];
  suggestions: AISuggestion[];
  isTargetReached: boolean;
  onOpenDataModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cases,
  suggestions,
  isTargetReached,
  onOpenDataModal,
}) => {
  const pendingSuggestionsCount = suggestions.filter(s => s.status === '待覆核').length;

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: '總覽儀表板', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'cases', label: '異常案例建檔', icon: <FileSpreadsheet className="w-4 h-4" />, badge: cases.length },
    { id: 'ai_assistant', label: 'AI 相似案例助手', icon: <Cpu className="w-4 h-4" /> },
    {
      id: 'review',
      label: '人工覆核',
      icon: <UserCheck className="w-4 h-4" />,
      badge: pendingSuggestionsCount > 0 ? pendingSuggestionsCount : undefined,
    },
    { id: 'roi', label: 'KPI 與 ROI', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      {/* Top Banner with Platform Brand & Status Indicators */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-inner border border-blue-400/30">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  工廠 AI 異常知識與效益驗證平台
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                  v1.0 MVP
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                隱性經驗知識化 • 相似案例處置 • 人工專家覆核 • 百萬效益 ROI 驗證
              </p>
            </div>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center space-x-3">
            {/* 100 萬驗證狀態 Indicator */}
            <div
              onClick={() => setActiveTab('roi')}
              className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer border transition-colors ${
                isTargetReached
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/60'
                  : 'bg-amber-950/80 text-amber-300 border-amber-700/60 hover:bg-amber-900/60'
              }`}
              title="點擊前往 KPI 與 ROI 效益驗證"
            >
              {isTargetReached ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>百萬門檻：達到擴大驗證門檻</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>百萬門檻：尚未達標</span>
                </>
              )}
            </div>

            {/* Data Management Modal Button */}
            <button
              onClick={onOpenDataModal}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              title="匯出/匯入/重設示範資料"
            >
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>資料管理</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1.5 no-scrollbar">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-1.5 py-0.2 rounded font-mono ${
                        isActive
                          ? 'bg-blue-800 text-white'
                          : item.id === 'review'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
