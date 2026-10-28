/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Case, AnomalyType, ReviewStatus } from '../types';
import { formatCurrencyNT } from '../utils/roiCalculator';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  AlertCircle,
  Tag,
  Clock,
  Coins,
  Cpu,
  X,
  Check,
  Calendar,
  Layers,
  Wrench,
  FileCheck,
} from 'lucide-react';

interface CasesTabProps {
  cases: Case[];
  onSaveCase: (caseItem: Case) => void;
  onDeleteCase: (id: string) => void;
  onLaunchAiAssistantWithCase: (caseItem: Case) => void;
}

const ANOMALY_TYPES: AnomalyType[] = [
  '溫度異常',
  '震動過大',
  '壓力洩漏',
  '尺寸超差',
  '異音警報',
  '伺服過載',
  '真空不足',
  '表面瑕疵',
  '其他異常',
];

const REVIEW_STATUSES: ReviewStatus[] = ['已覆核', '待覆核', '需補充'];

export const CasesTab: React.FC<CasesTabProps> = ({
  cases,
  onSaveCase,
  onDeleteCase,
  onLaunchAiAssistantWithCase,
}) => {
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLine, setSelectedLine] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'downtime-desc' | 'scrap-desc' | 'hours-desc'>('date-desc');

  // Modal States
  const [viewingCase, setViewingCase] = useState<Case | null>(null);
  const [editingCase, setEditingCase] = useState<Partial<Case> | null>(null);
  const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Unique list of lines for filter
  const uniqueLines = useMemo(() => {
    return Array.from(new Set(cases.map(c => c.line))).filter(Boolean);
  }, [cases]);

  // Filtered & Sorted Cases
  const filteredCases = useMemo(() => {
    return cases
      .filter(c => {
        // Search
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          const matchId = c.id.toLowerCase().includes(s);
          const matchEquip = c.equipment.toLowerCase().includes(s);
          const matchLine = c.line.toLowerCase().includes(s);
          const matchSymptom = c.symptoms.toLowerCase().includes(s);
          const matchCause = c.rootCause.toLowerCase().includes(s);
          const matchRecorded = c.recordedBy.toLowerCase().includes(s);
          const matchKw = c.keywords.some(k => k.toLowerCase().includes(s));
          if (!matchId && !matchEquip && !matchLine && !matchSymptom && !matchCause && !matchRecorded && !matchKw) {
            return false;
          }
        }
        // Filters
        if (selectedLine !== 'ALL' && c.line !== selectedLine) return false;
        if (selectedType !== 'ALL' && c.anomalyType !== selectedType) return false;
        if (selectedStatus !== 'ALL' && c.reviewStatus !== selectedStatus) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'downtime-desc') return b.downtimeMinutes - a.downtimeMinutes;
        if (sortBy === 'scrap-desc') return b.scrapCost - a.scrapCost;
        if (sortBy === 'hours-desc') return b.troubleshootingHours - a.troubleshootingHours;
        return 0;
      });
  }, [cases, searchTerm, selectedLine, selectedType, selectedStatus, sortBy]);

  // Open Form to Create New Case
  const handleAddNewCase = () => {
    const today = new Date().toISOString().split('T')[0];
    const newId = `CASE-${new Date().getFullYear()}-${String(cases.length + 1).padStart(3, '0')}`;
    setEditingCase({
      id: newId,
      date: today,
      line: '',
      equipment: '',
      anomalyType: '溫度異常',
      symptoms: '',
      parameters: '',
      rootCause: '',
      actionSteps: '',
      reasoning: '',
      resolutionResult: '',
      downtimeMinutes: 30,
      scrapCost: 5000,
      troubleshootingHours: 0.8,
      recordedBy: '',
      keywords: [],
      reviewStatus: '待覆核',
    });
    setFormErrors({});
  };

  // Open Form to Edit Existing Case
  const handleEditCase = (c: Case) => {
    setEditingCase({ ...c });
    setFormErrors({});
  };

  // Validate and Save Case
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCase) return;

    const errors: Record<string, string> = {};

    if (!editingCase.id?.trim()) errors.id = '請輸入案例編號';
    if (!editingCase.date?.trim()) errors.date = '請選擇發生日期';
    if (!editingCase.line?.trim()) errors.line = '請輸入所屬產線';
    if (!editingCase.equipment?.trim()) errors.equipment = '請輸入異常設備名稱';
    if (!editingCase.anomalyType) errors.anomalyType = '請選擇異常類型';
    if (!editingCase.symptoms?.trim()) errors.symptoms = '請詳細填寫異常徵兆';
    if (!editingCase.parameters?.trim()) errors.parameters = '請填寫關鍵設備參數';
    if (!editingCase.rootCause?.trim()) errors.rootCause = '請填寫根本原因分析';
    if (!editingCase.actionSteps?.trim()) errors.actionSteps = '請填寫具體處置步驟';
    if (!editingCase.reasoning?.trim()) errors.reasoning = '請填寫老師傅判斷理由（隱性知識關鍵）';
    if (!editingCase.resolutionResult?.trim()) errors.resolutionResult = '請填寫最終處理結果';
    if (!editingCase.recordedBy?.trim()) errors.recordedBy = '請輸入填寫人或師傅姓名';

    if (editingCase.downtimeMinutes === undefined || editingCase.downtimeMinutes < 0) {
      errors.downtimeMinutes = '停機分鐘不可為負數';
    }
    if (editingCase.scrapCost === undefined || editingCase.scrapCost < 0) {
      errors.scrapCost = '報廢金額不可為負數';
    }
    if (editingCase.troubleshootingHours === undefined || editingCase.troubleshootingHours < 0) {
      errors.troubleshootingHours = '排查工時不可為負數';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const now = new Date().toISOString();
    const caseToSave: Case = {
      id: editingCase.id!.trim(),
      date: editingCase.date!,
      line: editingCase.line!.trim(),
      equipment: editingCase.equipment!.trim(),
      anomalyType: editingCase.anomalyType as AnomalyType,
      symptoms: editingCase.symptoms!.trim(),
      parameters: editingCase.parameters!.trim(),
      rootCause: editingCase.rootCause!.trim(),
      actionSteps: editingCase.actionSteps!.trim(),
      reasoning: editingCase.reasoning!.trim(),
      resolutionResult: editingCase.resolutionResult!.trim(),
      downtimeMinutes: Number(editingCase.downtimeMinutes) || 0,
      scrapCost: Number(editingCase.scrapCost) || 0,
      troubleshootingHours: Number(editingCase.troubleshootingHours) || 0,
      recordedBy: editingCase.recordedBy!.trim(),
      keywords: editingCase.keywords || [],
      reviewStatus: (editingCase.reviewStatus as ReviewStatus) || '待覆核',
      createdAt: editingCase.createdAt || now,
      updatedAt: now,
    };

    onSaveCase(caseToSave);
    setEditingCase(null);
    setFormErrors({});
  };

  return (
    <div className="space-y-5">
      {/* Action Bar & Filters Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="搜尋案例編號、設備、產線、徵兆、師傅經驗或關鍵字..."
              className="w-full bg-slate-950 border border-slate-700 rounded-md pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={handleAddNewCase}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>建立異常案例</span>
          </button>
        </div>

        {/* Filter Pills / Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center space-x-1 text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>篩選條件：</span>
          </div>

          {/* Line Filter */}
          <select
            value={selectedLine}
            onChange={e => setSelectedLine(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-300 focus:outline-none"
          >
            <option value="ALL">全部產線 ({uniqueLines.length})</option>
            {uniqueLines.map(line => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>

          {/* Anomaly Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-300 focus:outline-none"
          >
            <option value="ALL">全部異常類型 ({ANOMALY_TYPES.length})</option>
            {ANOMALY_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Review Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-300 focus:outline-none"
          >
            <option value="ALL">全部覆核狀態</option>
            {REVIEW_STATUSES.map(st => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <div className="ml-auto flex items-center space-x-1 text-slate-400">
            <span>排序：</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-300 focus:outline-none"
            >
              <option value="date-desc">日期 (最新優先)</option>
              <option value="date-asc">日期 (最舊優先)</option>
              <option value="downtime-desc">停機時間 (最長優先)</option>
              <option value="scrap-desc">報廢金額 (最高優先)</option>
              <option value="hours-desc">排查工時 (最多優先)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case Count / Status summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          顯示 <strong>{filteredCases.length}</strong> / {cases.length} 筆案例
        </span>
        <span>提示：點擊「AI 診斷」可直接將此案例關鍵特徵帶入 AI 助手比對</span>
      </div>

      {/* Cases Table / Cards */}
      {filteredCases.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-base font-semibold text-slate-300">查無相符之異常案例</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            沒有找到符合當前關鍵字或篩選條件的案例。您可以嘗試清除篩選或建立一筆新的異常案例。
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedLine('ALL');
              setSelectedType('ALL');
              setSelectedStatus('ALL');
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded"
          >
            重設搜尋條件
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">案例編號 / 日期</th>
                  <th className="py-3 px-4">產線 / 設備</th>
                  <th className="py-3 px-4">異常類型</th>
                  <th className="py-3 px-4">異常徵兆與根本原因摘要</th>
                  <th className="py-3 px-4">停機 / 報廢 / 工時</th>
                  <th className="py-3 px-4">填寫人</th>
                  <th className="py-3 px-4">狀態</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCases.map(c => (
                  <tr key={c.id} className="hover:bg-slate-850/60 transition-colors">
                    {/* ID & Date */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-blue-400">{c.id}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{c.date}</span>
                      </div>
                    </td>

                    {/* Line & Equipment */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{c.equipment}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{c.line}</div>
                    </td>

                    {/* Anomaly Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {c.anomalyType}
                      </span>
                    </td>

                    {/* Symptoms & Root Cause */}
                    <td className="py-3 px-4 max-w-xs sm:max-w-md">
                      <div className="font-medium text-slate-200 line-clamp-1">
                        {c.symptoms}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        <strong className="text-slate-300">根因：</strong>
                        {c.rootCause}
                      </div>
                      {c.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.keywords.slice(0, 3).map((kw, i) => (
                            <span key={i} className="text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Downtime / Scrap / Labor */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                      <div className="text-amber-400">{c.downtimeMinutes} 分鐘停機</div>
                      <div className="text-rose-400">{formatCurrencyNT(c.scrapCost)} 報廢</div>
                      <div className="text-sky-400">{c.troubleshootingHours}h 工時</div>
                    </td>

                    {/* Recorded By */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                      {c.recordedBy}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          c.reviewStatus === '已覆核'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : c.reviewStatus === '待覆核'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {c.reviewStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setViewingCase(c)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="查看詳情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditCase(c)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400"
                          title="編輯案例"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onLaunchAiAssistantWithCase(c)}
                          className="p-1.5 rounded hover:bg-blue-950/80 text-blue-400 hover:text-blue-300 border border-blue-900/50"
                          title="使用此案例特徵進行 AI 檢索比對"
                        >
                          <Cpu className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCaseId(c.id)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                          title="刪除案例"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Case Detail Modal */}
      {viewingCase && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-base font-bold text-blue-400">{viewingCase.id}</span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {viewingCase.anomalyType}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    viewingCase.reviewStatus === '已覆核'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {viewingCase.reviewStatus}
                </span>
              </div>
              <button
                onClick={() => setViewingCase(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto text-sm text-slate-200">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-md border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block">發生日期</span>
                  <span className="text-slate-200 font-medium">{viewingCase.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">所屬產線</span>
                  <span className="text-slate-200 font-medium">{viewingCase.line}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">異常設備</span>
                  <span className="text-slate-200 font-medium">{viewingCase.equipment}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">記錄填寫人</span>
                  <span className="text-slate-200 font-medium">{viewingCase.recordedBy}</span>
                </div>
              </div>

              {/* Loss Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/80 border border-slate-800 rounded p-2.5 text-center">
                  <span className="text-[11px] text-slate-400 block">停機時間</span>
                  <span className="text-lg font-mono font-bold text-amber-400">
                    {viewingCase.downtimeMinutes} 分鐘
                  </span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded p-2.5 text-center">
                  <span className="text-[11px] text-slate-400 block">報廢金額</span>
                  <span className="text-lg font-mono font-bold text-rose-400">
                    {formatCurrencyNT(viewingCase.scrapCost)}
                  </span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded p-2.5 text-center">
                  <span className="text-[11px] text-slate-400 block">排查工時</span>
                  <span className="text-lg font-mono font-bold text-sky-400">
                    {viewingCase.troubleshootingHours} 小時
                  </span>
                </div>
              </div>

              {/* Symptoms */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">異常徵兆描述</h5>
                <p className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-200 leading-relaxed">
                  {viewingCase.symptoms}
                </p>
              </div>

              {/* Equipment Parameters */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">設備關鍵參數紀錄</h5>
                <p className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-300 font-mono text-xs leading-relaxed">
                  {viewingCase.parameters}
                </p>
              </div>

              {/* Root Cause */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-rose-400">根本原因 (Root Cause)</h5>
                <p className="bg-rose-950/20 p-3 rounded border border-rose-900/40 text-slate-200 leading-relaxed">
                  {viewingCase.rootCause}
                </p>
              </div>

              {/* Action Steps */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-blue-400">標準處置步驟</h5>
                <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-200 text-xs font-sans whitespace-pre-wrap leading-relaxed">
                  {viewingCase.actionSteps}
                </pre>
              </div>

              {/* Reasoning (Implicit Knowledge) */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  ★ 老師傅判斷理由（隱性知識思維）
                </h5>
                <p className="bg-amber-950/20 p-3.5 rounded border border-amber-900/50 text-amber-200/90 leading-relaxed italic">
                  "{viewingCase.reasoning}"
                </p>
              </div>

              {/* Resolution Result */}
              <div className="space-y-1">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">處理結果與放行狀況</h5>
                <p className="bg-emerald-950/20 p-3 rounded border border-emerald-900/40 text-slate-200 leading-relaxed">
                  {viewingCase.resolutionResult}
                </p>
              </div>

              {/* Keywords */}
              {viewingCase.keywords.length > 0 && (
                <div className="space-y-1">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">檢索關鍵字</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingCase.keywords.map((kw, i) => (
                      <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between">
              <button
                onClick={() => {
                  onLaunchAiAssistantWithCase(viewingCase);
                  setViewingCase(null);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded text-xs"
              >
                <Cpu className="w-4 h-4" />
                <span>以本案例特徵發起 AI 搜尋</span>
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    handleEditCase(viewingCase);
                    setViewingCase(null);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
                >
                  編輯本案例
                </button>
                <button
                  onClick={() => setViewingCase(null)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Case Modal */}
      {editingCase && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <span>
                  {cases.some(c => c.id === editingCase.id) ? '編輯異常知識案例' : '建立新異常案例'}
                </span>
              </h3>
              <button
                onClick={() => setEditingCase(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveForm} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-200">
                {/* Row 1: ID & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      案例編號 <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingCase.id || ''}
                      onChange={e => setEditingCase({ ...editingCase, id: e.target.value })}
                      placeholder="例：CASE-2026-007"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                    />
                    {formErrors.id && <p className="text-rose-400 text-[11px] mt-0.5">{formErrors.id}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      發生日期 <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={editingCase.date || ''}
                      onChange={e => setEditingCase({ ...editingCase, date: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                    />
                    {formErrors.date && <p className="text-rose-400 text-[11px] mt-0.5">{formErrors.date}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      覆核狀態 <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={editingCase.reviewStatus || '待覆核'}
                      onChange={e => setEditingCase({ ...editingCase, reviewStatus: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                    >
                      {REVIEW_STATUSES.map(st => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Line, Equipment, Anomaly Type */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      所屬產線 <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingCase.line || ''}
                      onChange={e => setEditingCase({ ...editingCase, line: e.target.value })}
                      placeholder="例：SMT 高速貼片線 A"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                    />
                    {formErrors.line && <p className="text-rose-400 text-[11px] mt-0.5">{formErrors.line}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      異常設備名稱 <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingCase.equipment || ''}
                      onChange={e => setEditingCase({ ...editingCase, equipment: e.target.value })}
                      placeholder="例：迴焊爐 Reflow-02"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                    />
                    {formErrors.equipment && (
                      <p className="text-rose-400 text-[11px] mt-0.5">{formErrors.equipment}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      異常類型 <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={editingCase.anomalyType || '溫度異常'}
                      onChange={e => setEditingCase({ ...editingCase, anomalyType: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                    >
                      {ANOMALY_TYPES.map(t => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Symptoms */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    異常徵兆描述 (現像、警報代碼、感官現象) <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={editingCase.symptoms || ''}
                    onChange={e => setEditingCase({ ...editingCase, symptoms: e.target.value })}
                    placeholder="請詳細記錄發生時的聲音、震動、溫度跳動、外觀瑕疵、警報訊號等..."
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  />
                  {formErrors.symptoms && <p className="text-rose-400 text-[11px] mt-0.5">{formErrors.symptoms}</p>}
                </div>

                {/* Row 4: Equipment Parameters */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    當時設備參數紀錄 (轉速、溫度、壓力、流速等) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingCase.parameters || ''}
                    onChange={e => setEditingCase({ ...editingCase, parameters: e.target.value })}
                    placeholder="例：預設溫度: 215°C / 鏈速: 0.85m/min / 氧氣濃度: 650ppm"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono text-xs"
                  />
                  {formErrors.parameters && (
                    <p className="text-rose-400 text-[11px] mt-0.5">{formErrors.parameters}</p>
                  )}
                </div>

                {/* Row 5: Root Cause */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    根本原因 (Root Cause 分析) <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={editingCase.rootCause || ''}
                    onChange={e => setEditingCase({ ...editingCase, rootCause: e.target.value })}
                    placeholder="請描述物理或電氣真實原因，如積碳氧化、磨損間隙擴大、熱阻上升等..."
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  />
                  {formErrors.rootCause && (
                    <p className="text-rose-400 text-[11px] mt-0.5">{formErrors.rootCause}</p>
                  )}
                </div>

                {/* Row 6: Action Steps */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    處置步驟 (編號條列清晰的處置流程) <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={editingCase.actionSteps || ''}
                    onChange={e => setEditingCase({ ...editingCase, actionSteps: e.target.value })}
                    placeholder="1. 暫停連線生產並鎖定進板通道&#10;2. 拆卸加熱模組清潔熱電偶探棒&#10;3. 以測溫板實施10點爐溫校驗..."
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  />
                  {formErrors.actionSteps && (
                    <p className="text-rose-400 text-[11px] mt-0.5">{formErrors.actionSteps}</p>
                  )}
                </div>

                {/* Row 7: Reasoning (Craftsman Implicit Knowledge) */}
                <div className="bg-amber-950/20 border border-amber-800/40 p-3 rounded">
                  <label className="block text-amber-300 font-bold mb-1 flex items-center space-x-1">
                    <span>★ 老師傅判斷理由（隱性知識思維精華）</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <p className="text-[11px] text-amber-200/80 mb-2">
                    「為何如此判斷？一般菜鳥可能會走什麼彎路？師傅看見了什麼非直覺特徵？」
                  </p>
                  <textarea
                    rows={2}
                    value={editingCase.reasoning || ''}
                    onChange={e => setEditingCase({ ...editingCase, reasoning: e.target.value })}
                    placeholder="例：傳統觀念常直接加大第4區加熱功率，但師傅依據冷焊集中於單一板側且數值跳動無規律，直接斷定為熱電偶訊號接線端子微阻抗干擾而非電熱管損壞，避免整組加熱棒報廢更換。"
                    className="w-full bg-slate-950 border border-amber-700/60 rounded p-2 text-amber-100"
                  />
                  {formErrors.reasoning && (
                    <p className="text-rose-400 text-[11px] mt-0.5">{formErrors.reasoning}</p>
                  )}
                </div>

                {/* Row 8: Resolution Result & Recorded By */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      處理結果與恢復指標 <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingCase.resolutionResult || ''}
                      onChange={e => setEditingCase({ ...editingCase, resolutionResult: e.target.value })}
                      placeholder="例：爐溫曲線恢復在 ±1.5°C 內，AOI 良率回升至 99.6%"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                    />
                    {formErrors.resolutionResult && (
                      <p className="text-rose-400 text-[11px] mt-0.5">{formErrors.resolutionResult}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      填寫人 / 師傅姓名與職稱 <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingCase.recordedBy || ''}
                      onChange={e => setEditingCase({ ...editingCase, recordedBy: e.target.value })}
                      placeholder="例：陳建宏 (資深SMT主任工)"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                    />
                    {formErrors.recordedBy && (
                      <p className="text-rose-400 text-[11px] mt-0.5">{formErrors.recordedBy}</p>
                    )}
                  </div>
                </div>

                {/* Row 9: Losses & Costs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      停機時間 (分鐘) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingCase.downtimeMinutes ?? 0}
                      onChange={e => setEditingCase({ ...editingCase, downtimeMinutes: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                    />
                    {formErrors.downtimeMinutes && (
                      <p className="text-rose-400 text-[11px] mt-0.5">{formErrors.downtimeMinutes}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      報廢損失金額 (NT$) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingCase.scrapCost ?? 0}
                      onChange={e => setEditingCase({ ...editingCase, scrapCost: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                    />
                    {formErrors.scrapCost && (
                      <p className="text-rose-400 text-[11px] mt-0.5">{formErrors.scrapCost}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      排查工時 (小時) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      value={editingCase.troubleshootingHours ?? 0}
                      onChange={e =>
                        setEditingCase({ ...editingCase, troubleshootingHours: Number(e.target.value) })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                    />
                    {formErrors.troubleshootingHours && (
                      <p className="text-rose-400 text-[11px] mt-0.5">{formErrors.troubleshootingHours}</p>
                    )}
                  </div>
                </div>

                {/* Row 10: Keywords */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    檢索關鍵字 (以逗點或空格分隔)
                  </label>
                  <input
                    type="text"
                    value={(editingCase.keywords || []).join(', ')}
                    onChange={e => {
                      const tags = e.target.value
                        .split(/[,，\s]+/)
                        .map(s => s.trim())
                        .filter(Boolean);
                      setEditingCase({ ...editingCase, keywords: tags });
                    }}
                    placeholder="例：迴焊爐, 冷焊, 熱電偶, 爐溫曲線, SMT"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    關鍵字有助於「AI 相似案例助手」進行快速倒排索引與語義比對。
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingCase(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow"
                >
                  儲存案例資料
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCaseId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h4 className="font-bold text-base text-white">確認刪除案例？</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              您即將刪除案例編號 <strong className="text-white font-mono">{deletingCaseId}</strong>。
              此操作無法復原，並可能影響日後 AI 檢索此類異常的準確度。
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeletingCaseId(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onDeleteCase(deletingCaseId);
                  setDeletingCaseId(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
