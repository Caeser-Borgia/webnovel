"use client";

import { useEffect, useMemo, useRef } from "react";
import type { GenerationStatus } from "@/types";

interface GenerationViewProps {
  bookTitle: string;
  content: string;
  error: string | null;
  isGenerating: boolean;
  status: GenerationStatus;
  targetWords: number;
  wordCount: number;
  lastDeltaWords: number;
  lastStartedAt: string | null;
  onBack: () => void;
  onCopy: () => Promise<void>;
  onContinue: () => Promise<void>;
  onDownloadDocx: () => Promise<void>;
  onDownloadTxt: () => void;
  onPause: () => void;
  onRestart: () => void;
}

export function GenerationView({
  bookTitle,
  content,
  error,
  isGenerating,
  status,
  targetWords,
  wordCount,
  lastDeltaWords,
  lastStartedAt,
  onBack,
  onCopy,
  onContinue,
  onDownloadDocx,
  onDownloadTxt,
  onPause,
  onRestart,
}: GenerationViewProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    contentRef.current.scrollTop = contentRef.current.scrollHeight;
  }, [content]);

  const progress = useMemo(() => {
    if (!targetWords) {
      return 0;
    }

    return Math.min((wordCount / targetWords) * 100, 100);
  }, [targetWords, wordCount]);

  const statusText = useMemo(() => {
    if (isGenerating) return "生成中...";
    if (status === "paused") return "已暂停";
    if (status === "completed") return "已完成本轮";
    if (status === "error") return "生成出错";
    return "待生成";
  }, [status, isGenerating]);

  const shouldShowContinue = !isGenerating && wordCount < targetWords && content;
  const hasReachedTarget = wordCount >= targetWords && content;

  return (
    <div className="panel-strong rounded-[28px] p-6 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-amber-900/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.24em] text-amber-800/70">Step 3</div>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            {bookTitle ? `《${bookTitle}》` : "正在创作"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {isGenerating && "流式生成中，请稍候..."}
            {status === "paused" && "已暂停生成，可以继续创作或重新开始"}
            {status === "completed" && !hasReachedTarget && "本轮生成完成，可以继续创作"}
            {hasReachedTarget && "已达目标字数，创作完成"}
            {status === "error" && "生成过程中出现错误"}
            {status === "idle" && !content && "还没有生成任何内容，点击下方按钮开始"}
          </p>
        </div>

        <div className="space-y-2">
          <div className="rounded-3xl border border-amber-900/10 bg-white/70 px-5 py-4 text-sm text-slate-600">
            <div>已生成字数：{wordCount.toLocaleString()}</div>
            <div className="mt-1">目标字数：{targetWords.toLocaleString()}</div>
            {lastDeltaWords > 0 && <div className="mt-1 text-amber-700">本轮新增：{lastDeltaWords.toLocaleString()} 字</div>}
          </div>
          <div className="rounded-3xl border border-amber-900/10 bg-white/70 px-5 py-3 text-xs text-slate-600">
            <div>状态：{statusText}</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between text-sm text-slate-600">
          <span>生成进度</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="h-3 rounded-full bg-white/90">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div
        ref={contentRef}
        className="mt-6 min-h-[420px] rounded-[28px] border border-amber-900/10 bg-slate-950 px-5 py-5 font-[family-name:var(--font-geist-mono)] text-sm leading-7 text-slate-100"
      >
        <div className="whitespace-pre-wrap">
          {content || "生成内容会实时显示在这里。"}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!isGenerating}
          type="button"
          onClick={onPause}
        >
          ⏸ 暂停
        </button>
        {shouldShowContinue && (
          <button
            className="rounded-full border border-amber-500 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isGenerating}
            type="button"
            onClick={() => {
              void onContinue();
            }}
          >
            ▶ 继续创作
          </button>
        )}
        <button
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isGenerating}
          type="button"
          onClick={onRestart}
        >
          🔄 重新开始本章
        </button>
        <button
          className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!content}
          type="button"
          onClick={() => {
            void onCopy();
          }}
        >
          📋 复制
        </button>
        <button
          className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!content}
          type="button"
          onClick={onDownloadTxt}
        >
          📥 TXT
        </button>
        <button
          className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!content}
          type="button"
          onClick={() => {
            void onDownloadDocx();
          }}
        >
          📄 DOCX
        </button>
        <button
          className="ml-auto rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400"
          type="button"
          onClick={onBack}
        >
          ← 返回设定
        </button>
      </div>
    </div>
  );
}
