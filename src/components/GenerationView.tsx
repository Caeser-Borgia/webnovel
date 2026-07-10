"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ChapterData, GenerationMode, GenerationStatus } from "@/types";

interface GenerationViewProps {
  bookTitle: string;
  chapters: ChapterData[];
  activeChapterId: string | null;
  activeChapterTitle: string;
  content: string;
  error: string | null;
  isGenerating: boolean;
  status: GenerationStatus;
  currentMode: GenerationMode;
  targetWords: number;
  wordCount: number;
  autoContinueToTarget: boolean;
  lastStartedAt: string | null;
  lastDeltaWords: number;
  hasSnapshot: boolean;
  onBack: () => void;
  onCreateChapter: () => void;
  onDeleteChapter: (chapterId: string) => void;
  onSelectChapter: (chapterId: string) => void;
  onUpdateChapterTitle: (title: string) => void;
  onToggleAutoContinue: (next: boolean) => void;
  onStart: () => void;
  onContinue: () => void;
  onPause: () => void;
  onRestart: () => void;
  onCopyCurrent: () => Promise<void>;
  onCopyAll: () => Promise<void>;
  onDownloadCurrentTxt: () => void;
  onDownloadAllTxt: () => void;
  onDownloadCurrentDocx: () => Promise<void>;
  onDownloadAllDocx: () => Promise<void>;
  onDownloadCurrentMarkdown: () => void;
  onDownloadAllMarkdown: () => void;
  onSaveSnapshot: () => void;
  onRestoreSnapshot: () => void;
}

function getStatusLabel(status: GenerationStatus) {
  switch (status) {
    case "generating":
      return "生成中";
    case "paused":
      return "已暂停";
    case "completed":
      return "已完成";
    case "error":
      return "出错";
    default:
      return "未开始";
  }
}

function getModeLabel(mode: GenerationMode) {
  switch (mode) {
    case "continue":
      return "续写中";
    case "restart":
      return "重写本章";
    default:
      return "首章生成";
  }
}

function formatTime(value: string | null) {
  if (!value) {
    return "暂无";
  }

  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function buildChapterFallbackTitle(title: string | null | undefined) {
  return title?.trim() || "未命名章节";
}

export function GenerationView({
  bookTitle,
  chapters,
  activeChapterId,
  activeChapterTitle,
  content,
  error,
  isGenerating,
  status,
  currentMode,
  targetWords,
  wordCount,
  autoContinueToTarget,
  lastStartedAt,
  lastDeltaWords,
  hasSnapshot,
  onBack,
  onCreateChapter,
  onDeleteChapter,
  onSelectChapter,
  onUpdateChapterTitle,
  onToggleAutoContinue,
  onStart,
  onContinue,
  onPause,
  onRestart,
  onCopyCurrent,
  onCopyAll,
  onDownloadCurrentTxt,
  onDownloadAllTxt,
  onDownloadCurrentDocx,
  onDownloadAllDocx,
  onDownloadCurrentMarkdown,
  onDownloadAllMarkdown,
  onSaveSnapshot,
  onRestoreSnapshot,
}: GenerationViewProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    contentRef.current.scrollTop = contentRef.current.scrollHeight;
  }, [content]);

  const activeChapter = useMemo(
    () => chapters.find((chapter) => chapter.id === activeChapterId) || null,
    [activeChapterId, chapters],
  );

  const progress = useMemo(() => {
    if (!targetWords) {
      return 0;
    }

    return Math.min((wordCount / targetWords) * 100, 100);
  }, [targetWords, wordCount]);

  const totalBookWords = useMemo(
    () => chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0),
    [chapters],
  );

  if (!chapters.length) {
    return (
      <div className="panel-strong rounded-[28px] p-6 sm:p-8">
        <div className="rounded-[28px] border border-dashed border-amber-900/20 bg-white/55 px-6 py-12 text-center">
          <div className="text-sm uppercase tracking-[0.24em] text-amber-800/70">Step 3</div>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">先创建第一章</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            现在已经进入创作阶段，但还没有章节。先新建一章，再开始生成、续写或导出。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              type="button"
              onClick={onCreateChapter}
            >
              创建第一章
            </button>
            <button
              className="rounded-full border border-amber-900/15 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400"
              type="button"
              onClick={onBack}
            >
              返回设定
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-strong rounded-[28px] p-4 sm:p-6">
      <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <aside className="rounded-[26px] border border-amber-900/10 bg-white/60 p-4 shadow-sm shadow-amber-950/5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-slate-900">章节列表</div>
              <div className="mt-1 text-xs text-slate-500">总字数 {totalBookWords.toLocaleString()}</div>
            </div>
            <button
              className="rounded-full border border-amber-900/15 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isGenerating}
              type="button"
              onClick={onCreateChapter}
            >
              新建章节
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {chapters.map((chapter) => {
              const isActive = chapter.id === activeChapterId;

              return (
                <div
                  key={chapter.id}
                  className={`rounded-[22px] border px-4 py-3 transition ${
                    isActive
                      ? "border-amber-500 bg-amber-50/90 shadow-sm shadow-amber-950/5"
                      : "border-amber-900/10 bg-white/85 hover:border-amber-300"
                  }`}
                >
                  <button
                    className="w-full text-left"
                    disabled={isGenerating}
                    type="button"
                    onClick={() => onSelectChapter(chapter.id)}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {buildChapterFallbackTitle(chapter.title)}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {chapter.wordCount.toLocaleString()} 字 · {getStatusLabel(chapter.status)}
                      </div>
                    </div>
                    <div className="mt-2 max-h-10 overflow-hidden text-xs leading-5 text-slate-500">
                      {chapter.summary.trim() || "暂无摘要，生成后会自动更新。"}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">{formatTime(chapter.updatedAt)}</div>
                  </button>
                  <div className="mt-3 flex justify-end">
                    <button
                      className="rounded-full border border-rose-200 bg-white px-3 py-1 text-[11px] font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isGenerating}
                      type="button"
                      onClick={() => onDeleteChapter(chapter.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="rounded-[26px] border border-amber-900/10 bg-white/55 p-5 sm:p-6">
          <div className="flex flex-col gap-5 border-b border-amber-900/10 pb-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-amber-800/70">Step 3</div>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">{bookTitle || "未命名作品"}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  在这里可以生成、续写、暂停、重写和导出单章或全书；每个章节都会独立保存内容、摘要和状态。
                </p>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-amber-900/10 bg-white/85 px-4 py-3 text-sm text-slate-700">
                <input
                  checked={autoContinueToTarget}
                  className="h-4 w-4 accent-amber-500"
                  type="checkbox"
                  onChange={(event) => onToggleAutoContinue(event.target.checked)}
                />
                自动续写到目标字数
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-amber-900/10 bg-white/85 px-5 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">当前状态</div>
                <div className="mt-2 text-lg font-medium text-slate-900">{getStatusLabel(status)}</div>
                <div className="mt-1 text-xs text-slate-500">本轮模式：{getModeLabel(currentMode)}</div>
              </div>

              <div className="rounded-3xl border border-amber-900/10 bg-white/85 px-5 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">当前字数</div>
                <div className="mt-2 text-lg font-medium text-slate-900">{wordCount.toLocaleString()}</div>
                <div className="mt-1 text-xs text-slate-500">目标字数：{targetWords.toLocaleString()}</div>
              </div>

              <div className="rounded-3xl border border-amber-900/10 bg-white/85 px-5 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">本轮新增</div>
                <div className="mt-2 text-lg font-medium text-slate-900">{lastDeltaWords.toLocaleString()}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {autoContinueToTarget ? "自动续写已开启" : "自动续写已关闭"}
                </div>
              </div>

              <div className="rounded-3xl border border-amber-900/10 bg-white/85 px-5 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">最近启动</div>
                <div className="mt-2 text-sm font-medium text-slate-900">{formatTime(lastStartedAt)}</div>
                <div className="mt-1 text-xs text-slate-500">
                  当前章节：{activeChapter ? buildChapterFallbackTitle(activeChapter.title) : "未命名章节"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">章节标题</span>
              <input
                className="rounded-2xl border border-amber-900/15 bg-white/90 px-4 py-3 outline-none transition focus:border-amber-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                disabled={isGenerating}
                value={activeChapterTitle}
                onChange={(event) => onUpdateChapterTitle(event.target.value)}
              />
            </label>
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
              最近一次错误：{error}
            </div>
          )}

          <div
            ref={contentRef}
            className="mt-6 min-h-[420px] rounded-[28px] border border-amber-900/10 bg-slate-950 px-5 py-5 font-[family-name:var(--font-geist-mono)] text-sm leading-7 text-slate-100"
          >
            <div className="whitespace-pre-wrap">
              {content || "当前章节还没有正文。先点击“开始生成本章”，也可以先调整标题和故事设定。"}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isGenerating || Boolean(content)}
              type="button"
              onClick={onStart}
            >
              开始生成本章
            </button>
            <button
              className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isGenerating || !content}
              type="button"
              onClick={onContinue}
            >
              继续创作
            </button>
            <button
              className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!isGenerating}
              type="button"
              onClick={onPause}
            >
              暂停
            </button>
            <button
              className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isGenerating}
              type="button"
              onClick={onRestart}
            >
              重新开始本章
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-amber-900/10 pt-6">
            <button
              className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!content}
              type="button"
              onClick={() => {
                void onCopyCurrent();
              }}
            >
              复制当前章
            </button>
            <button
              className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!chapters.some((chapter) => chapter.content.trim())}
              type="button"
              onClick={() => {
                void onCopyAll();
              }}
            >
              复制全书
            </button>
            <button
              className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!content}
              type="button"
              onClick={onDownloadCurrentTxt}
            >
              当前章 TXT
            </button>
            <button
              className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!chapters.some((chapter) => chapter.content.trim())}
              type="button"
              onClick={onDownloadAllTxt}
            >
              全书 TXT
            </button>
            <button
              className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!content}
              type="button"
              onClick={() => {
                void onDownloadCurrentDocx();
              }}
            >
              当前章 DOCX
            </button>
            <button
              className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!chapters.some((chapter) => chapter.content.trim())}
              type="button"
              onClick={() => {
                void onDownloadAllDocx();
              }}
            >
              全书 DOCX
            </button>
            <button
              className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!content}
              type="button"
              onClick={onDownloadCurrentMarkdown}
            >
              当前章 Markdown
            </button>
            <button
              className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!chapters.some((chapter) => chapter.content.trim())}
              type="button"
              onClick={onDownloadAllMarkdown}
            >
              全书 Markdown
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-amber-900/10 pt-6">
            <button
              className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!content}
              type="button"
              onClick={onSaveSnapshot}
            >
              保存快照
            </button>
            <button
              className="rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!hasSnapshot || isGenerating}
              type="button"
              onClick={onRestoreSnapshot}
            >
              恢复最近版本
            </button>
            <button
              className="ml-auto rounded-full border border-amber-900/15 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400"
              type="button"
              onClick={onBack}
            >
              返回设定
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
