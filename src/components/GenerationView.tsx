"use client";

import { useEffect, useMemo, useRef } from "react";

interface GenerationViewProps {
  bookTitle: string;
  content: string;
  error: string | null;
  isGenerating: boolean;
  targetWords: number;
  wordCount: number;
  onBack: () => void;
  onCopy: () => Promise<void>;
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
  targetWords,
  wordCount,
  onBack,
  onCopy,
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

  return (
    <div className="panel-strong rounded-[28px] p-6 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-amber-900/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.24em] text-amber-800/70">Step 3</div>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            {bookTitle ? `《${bookTitle}》` : "正在创作"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {isGenerating ? "正在流式生成中..." : "当前没有活动生成任务，你可以重新开始。"}
          </p>
        </div>

        <div className="rounded-3xl border border-amber-900/10 bg-white/70 px-5 py-4 text-sm text-slate-600">
          <div>已生成字数：{wordCount.toLocaleString()}</div>
          <div className="mt-1">目标字数：{targetWords.toLocaleString()}</div>
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
          暂停
        </button>
        <button
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          type="button"
          onClick={onRestart}
        >
          重新开始
        </button>
        <button
          className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!content}
          type="button"
          onClick={() => {
            void onCopy();
          }}
        >
          复制
        </button>
        <button
          className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!content}
          type="button"
          onClick={onDownloadTxt}
        >
          下载 TXT
        </button>
        <button
          className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!content}
          type="button"
          onClick={() => {
            void onDownloadDocx();
          }}
        >
          下载 DOCX
        </button>
        <button
          className="ml-auto rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400"
          type="button"
          onClick={onBack}
        >
          返回设定
        </button>
      </div>
    </div>
  );
}
