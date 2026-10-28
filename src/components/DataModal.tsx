/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { exportAllData, importAllData, resetToDemoData } from '../utils/storage';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  X,
  AlertTriangle,
  CheckCircle2,
  FileCode,
} from 'lucide-react';

interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReloaded: () => void;
}

export const DataModal: React.FC<DataModalProps> = ({
  isOpen,
  onClose,
  onDataReloaded,
}) => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle Export
  const handleExport = () => {
    try {
      const jsonStr = exportAllData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `工廠AI異常知識庫備份_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setFeedback({ type: 'success', text: '成功匯出完整資料庫 JSON 檔案！' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: `匯出失敗: ${err?.message || '未知錯誤'}` });
    }
  };

  // Handle Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const result = importAllData(content);
        if (result.success) {
          setFeedback({ type: 'success', text: result.message });
          onDataReloaded();
        } else {
          setFeedback({ type: 'error', text: result.message });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Reset to Demo Data
  const handleReset = () => {
    resetToDemoData();
    setConfirmReset(false);
    setFeedback({
      type: 'success',
      text: '已成功重設為原廠示範資料（包含 6 筆精選工廠真實異常案例與預設設定）！',
    });
    onDataReloaded();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span>資料管理與備份</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          所有案例、AI 診斷、覆核紀錄與 KPI 參數皆保存在您的瀏覽器本機儲存 (localStorage)，重新整理後資料依然存在。您可隨時進行匯出備份或還原。
        </p>

        {feedback && (
          <div
            className={`p-3 rounded text-xs flex items-center space-x-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-800 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="space-y-3 pt-1">
          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between p-3 rounded-md bg-slate-950 border border-slate-700 hover:border-blue-500 text-xs text-slate-200 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Download className="w-4 h-4 text-blue-400" />
              <div className="text-left">
                <span className="font-semibold block text-white">匯出完整資料 (JSON)</span>
                <span className="text-[11px] text-slate-400">
                  下載全部案例、覆核與 KPI 參數設定
                </span>
              </div>
            </div>
            <FileCode className="w-4 h-4 text-slate-500" />
          </button>

          {/* Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between p-3 rounded-md bg-slate-950 border border-slate-700 hover:border-emerald-500 text-xs text-slate-200 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Upload className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <span className="font-semibold block text-white">匯入資料 (JSON)</span>
                <span className="text-[11px] text-slate-400">
                  載入先前匯出備份之 JSON 檔案
                </span>
              </div>
            </div>
            <FileCode className="w-4 h-4 text-slate-500" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          {/* Reset Demo Data */}
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full flex items-center justify-between p-3 rounded-md bg-slate-950 border border-slate-800 hover:border-amber-600 text-xs text-slate-300 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <span className="font-semibold block text-slate-200">重設原廠示範資料</span>
                  <span className="text-[11px] text-slate-500">
                    恢復內建 6 筆製造業異常案例與初始覆核
                  </span>
                </div>
              </div>
            </button>
          ) : (
            <div className="p-3.5 rounded bg-amber-950/30 border border-amber-800 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>確定要清除自訂資料並重設為示範資料嗎？</span>
              </div>
              <p className="text-[11px] text-slate-300">
                此動作將覆蓋當前所有手動新增之案例與覆核記錄。
              </p>
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
                >
                  取消
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs"
                >
                  確認重設
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
