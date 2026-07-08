"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ConfigPanel } from "@/components/ConfigPanel";
import { GenerationView } from "@/components/GenerationView";
import { StorySetup } from "@/components/StorySetup";
import { useNovelGeneration } from "@/hooks/useNovelGeneration";
import {
  buildBookMarkdown,
  buildBookPlainText,
  buildChapterPlainText,
  countWords,
  createChapter,
  createDraftSnapshot,
  createGenerateRequest,
  DEFAULT_STORY_SETUP,
  DEFAULT_WRITER_CONFIG,
  MAX_SNAPSHOTS,
  STORAGE_KEYS,
} from "@/utils/api";
import { buildChapterSummary } from "@/utils/prompts";
import type { AppStep, ChapterData, DraftSnapshot, GenerationMode, StoredProjectData, StorySetupData, WriterConfig } from "@/types";

const steps: Array<{ key: AppStep; label: string }> = [
  { key: "config", label: "配置" },
  { key: "story", label: "设定" },
  { key: "generation", label: "创作" },
];

function normalizeChapter(chapter: Partial<ChapterData>, index: number): ChapterData {
  const fallback = createChapter(index + 1);
  const content = chapter.content || "";

  return {
    ...fallback,
    ...chapter,
    title: chapter.title || fallback.title,
    content,
    summary: chapter.summary || "",
    wordCount: typeof chapter.wordCount === "number" ? chapter.wordCount : countWords(content),
    updatedAt: chapter.updatedAt || fallback.updatedAt,
    status: chapter.status || "idle",
    lastError: chapter.lastError || null,
    lastStartedAt: chapter.lastStartedAt || null,
    lastCompletedAt: chapter.lastCompletedAt || null,
    lastGenerationMode: chapter.lastGenerationMode || "start",
    lastDeltaWords: typeof chapter.lastDeltaWords === "number" ? chapter.lastDeltaWords : 0,
  };
}

function normalizeSnapshot(snapshot: Partial<DraftSnapshot>): DraftSnapshot | null {
  if (!snapshot.chapterId || !snapshot.id) {
    return null;
  }

  return {
    id: snapshot.id,
    chapterId: snapshot.chapterId,
    chapterTitle: snapshot.chapterTitle || "未命名章节",
    content: snapshot.content || "",
    summary: snapshot.summary || "",
    wordCount: typeof snapshot.wordCount === "number" ? snapshot.wordCount : countWords(snapshot.content || ""),
    createdAt: snapshot.createdAt || new Date().toISOString(),
  };
}

export default function Home() {
  const [step, setStep] = useState<AppStep>("config");
  const [config, setConfig] = useState<WriterConfig>(DEFAULT_WRITER_CONFIG);
  const [story, setStory] = useState<StorySetupData>(DEFAULT_STORY_SETUP);
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<DraftSnapshot[]>([]);
  const generation = useNovelGeneration();

  const configRef = useRef(config);
  const storyRef = useRef(story);
  const chaptersRef = useRef(chapters);
  const activeChapterIdRef = useRef(activeChapterId);
  const activeRunIdRef = useRef(0);

  configRef.current = config;
  storyRef.current = story;
  chaptersRef.current = chapters;
  activeChapterIdRef.current = activeChapterId;

  useEffect(() => {
    const savedConfig = window.localStorage.getItem(STORAGE_KEYS.config);
    const savedStory = window.localStorage.getItem(STORAGE_KEYS.story);
    const savedProject = window.localStorage.getItem(STORAGE_KEYS.project);

    if (savedConfig) {
      setConfig((current) => ({ ...current, ...JSON.parse(savedConfig) }));
    }

    if (savedStory) {
      setStory((current) => ({ ...current, ...JSON.parse(savedStory) }));
    }

    if (savedProject) {
      const parsed = JSON.parse(savedProject) as Partial<StoredProjectData>;
      const nextChapters = Array.isArray(parsed.chapters)
        ? parsed.chapters.map((chapter, index) => normalizeChapter(chapter, index))
        : [];
      const nextSnapshots = Array.isArray(parsed.snapshots)
        ? parsed.snapshots.map(normalizeSnapshot).filter(Boolean) as DraftSnapshot[]
        : [];

      setChapters(nextChapters);
      setSnapshots(nextSnapshots);
      setActiveChapterId(parsed.activeChapterId || nextChapters[0]?.id || null);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.story, JSON.stringify(story));
  }, [story]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEYS.project,
      JSON.stringify({
        chapters,
        activeChapterId,
        snapshots,
      } satisfies StoredProjectData),
    );
  }, [activeChapterId, chapters, snapshots]);

  useEffect(() => {
    if (!chapters.length) {
      if (activeChapterId !== null) {
        setActiveChapterId(null);
      }
      return;
    }

    if (!activeChapterId || !chapters.some((chapter) => chapter.id === activeChapterId)) {
      setActiveChapterId(chapters[0].id);
    }
  }, [activeChapterId, chapters]);

  const activeChapter = useMemo(
    () => chapters.find((chapter) => chapter.id === activeChapterId) || null,
    [activeChapterId, chapters],
  );

  const latestSnapshot = useMemo(
    () => snapshots.find((snapshot) => snapshot.chapterId === activeChapterId) || null,
    [activeChapterId, snapshots],
  );

  useEffect(() => {
    if (!activeChapter) {
      return;
    }

    generation.loadChapterState({
      content: activeChapter.content,
      error: activeChapter.lastError,
      status: activeChapter.status,
      lastStartedAt: activeChapter.lastStartedAt,
      lastCompletedAt: activeChapter.lastCompletedAt,
      lastGenerationMode: activeChapter.lastGenerationMode,
      lastDeltaWords: activeChapter.lastDeltaWords,
    });
  }, [activeChapter?.id]);

  useEffect(() => {
    if (!activeChapterIdRef.current) {
      return;
    }

    setChapters((current) =>
      current.map((chapter) => {
        if (chapter.id !== activeChapterIdRef.current) {
          return chapter;
        }

        const nextSummary = buildChapterSummary(
          storyRef.current,
          chapter.title,
          generation.content,
          chapter.summary,
        );
        const nextWordCount = generation.wordCount;
        const changed =
          chapter.content !== generation.content ||
          chapter.wordCount !== nextWordCount ||
          chapter.summary !== nextSummary ||
          chapter.status !== generation.status ||
          chapter.lastError !== generation.error ||
          chapter.lastStartedAt !== generation.lastStartedAt ||
          chapter.lastCompletedAt !== generation.lastCompletedAt ||
          chapter.lastGenerationMode !== generation.currentMode ||
          chapter.lastDeltaWords !== generation.lastDeltaWords;

        if (!changed) {
          return chapter;
        }

        return {
          ...chapter,
          content: generation.content,
          summary: nextSummary,
          wordCount: nextWordCount,
          status: generation.status,
          lastError: generation.error,
          lastStartedAt: generation.lastStartedAt,
          lastCompletedAt: generation.lastCompletedAt,
          lastGenerationMode: generation.currentMode,
          lastDeltaWords: generation.lastDeltaWords,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }, [
    generation.content,
    generation.currentMode,
    generation.error,
    generation.lastCompletedAt,
    generation.lastDeltaWords,
    generation.lastStartedAt,
    generation.status,
    generation.wordCount,
  ]);

  const activeIndex = steps.findIndex((item) => item.key === step);

  const ensureChapter = () => {
    const existing = chaptersRef.current.find((chapter) => chapter.id === activeChapterIdRef.current);

    if (existing) {
      return existing;
    }

    const chapter = createChapter(chaptersRef.current.length + 1);
    setChapters((current) => [...current, chapter]);
    setActiveChapterId(chapter.id);
    return chapter;
  };

  const updateActiveChapter = (updater: (chapter: ChapterData) => ChapterData) => {
    const currentChapterId = activeChapterIdRef.current;

    if (!currentChapterId) {
      return;
    }

    updateChapterById(currentChapterId, updater);
  };

  const updateChapterById = (chapterId: string, updater: (chapter: ChapterData) => ChapterData) => {
    setChapters((current) =>
      current.map((chapter) => (chapter.id === chapterId ? updater(chapter) : chapter)),
    );
  };

  const runGeneration = async (mode: GenerationMode) => {
    const baseChapter = ensureChapter();
    const runId = Date.now();
    activeRunIdRef.current = runId;

    let workingChapter: ChapterData = {
      ...baseChapter,
      content: mode === "continue" ? baseChapter.content : "",
      summary: mode === "continue" ? baseChapter.summary : "",
      wordCount: mode === "continue" ? baseChapter.wordCount : 0,
      status: "idle",
      lastError: null,
      lastGenerationMode: mode,
      lastDeltaWords: 0,
      updatedAt: new Date().toISOString(),
    };

    updateChapterById(workingChapter.id, () => workingChapter);

    let nextMode = mode;

    while (true) {
      const payload = createGenerateRequest(configRef.current, storyRef.current, workingChapter, nextMode);
      const result = await generation.startGeneration(payload, {
        initialContent: workingChapter.content,
        mode: nextMode,
        replaceContent: nextMode !== "continue",
      });

      if (activeRunIdRef.current !== runId) {
        return;
      }

      workingChapter = {
        ...workingChapter,
        content: result.content,
        summary: buildChapterSummary(storyRef.current, workingChapter.title, result.content, workingChapter.summary),
        wordCount: countWords(result.content),
        status: result.status,
        lastError: result.error,
        lastGenerationMode: nextMode,
        lastDeltaWords: result.addedWords,
        updatedAt: new Date().toISOString(),
      };

      updateChapterById(workingChapter.id, () => workingChapter);

      const shouldAutoContinue =
        configRef.current.autoContinueToTarget &&
        result.status === "completed" &&
        workingChapter.wordCount < configRef.current.targetWords &&
        result.addedWords > 0;

      if (!shouldAutoContinue) {
        break;
      }

      nextMode = "continue";
    }
  };

  const handleStorySubmit = async () => {
    const chapter = ensureChapter();
    setStep("generation");
    setActiveChapterId(chapter.id);

    if (!chapter.content.trim()) {
      await runGeneration("start");
    }
  };

  const handleCreateChapter = () => {
    if (generation.isGenerating) {
      return;
    }

    const chapter = createChapter(chaptersRef.current.length + 1);
    setChapters((current) => [...current, chapter]);
    setActiveChapterId(chapter.id);
    setStep("generation");
  };

  const handleSaveSnapshot = () => {
    if (!activeChapter || !activeChapter.content.trim()) {
      return;
    }

    const snapshot = createDraftSnapshot(activeChapter);
    setSnapshots((current) => [snapshot, ...current].slice(0, MAX_SNAPSHOTS));
  };

  const handleRestoreSnapshot = () => {
    if (!latestSnapshot || !activeChapter) {
      return;
    }

    const restoredChapter: ChapterData = {
      ...activeChapter,
      content: latestSnapshot.content,
      summary: latestSnapshot.summary || buildChapterSummary(story, activeChapter.title, latestSnapshot.content),
      wordCount: latestSnapshot.wordCount,
      status: "paused",
      lastError: null,
      lastGenerationMode: "continue",
      lastDeltaWords: 0,
      updatedAt: new Date().toISOString(),
    };

    updateActiveChapter(() => restoredChapter);
    generation.loadChapterState({
      content: restoredChapter.content,
      error: restoredChapter.lastError,
      status: restoredChapter.status,
      lastStartedAt: restoredChapter.lastStartedAt,
      lastCompletedAt: restoredChapter.lastCompletedAt,
      lastGenerationMode: restoredChapter.lastGenerationMode,
      lastDeltaWords: restoredChapter.lastDeltaWords,
    });
  };

  const currentChapterText = activeChapter ? buildChapterPlainText(activeChapter) : "";
  const allBookText = buildBookPlainText(story.bookTitle, chapters);
  const allBookMarkdown = buildBookMarkdown(story.bookTitle, chapters);

  return (
    <main className="min-h-screen px-4 py-8 text-slate-800 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="panel rounded-[28px] p-6 sm:p-8">
          <div className="mb-8 inline-flex rounded-full border border-amber-900/15 bg-white/55 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-amber-900/70">
            WebNovel Writer
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            把灵感变成长篇网文，在本地一边生成一边把故事慢慢写厚。
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            这次改造重点不在一次性生成，而在持续续写、章节管理、草稿保存和长文创作体验。
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {steps.map((item, index) => {
              const isActive = step === item.key;
              const isDone = index < activeIndex;

              return (
                <div
                  key={item.key}
                  className={`rounded-3xl border px-4 py-4 transition ${
                    isActive
                      ? "border-amber-500 bg-amber-50/80 shadow-lg shadow-amber-950/5"
                      : isDone
                        ? "border-emerald-200 bg-emerald-50/80"
                        : "border-amber-900/10 bg-white/55"
                  }`}
                >
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Step {index + 1}
                  </div>
                  <div className="mt-2 text-lg font-medium text-slate-900">{item.label}</div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/80">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        isDone || isActive ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-transparent"
                      }`}
                      style={{ width: isDone ? "100%" : isActive ? "72%" : "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-[28px] border border-amber-900/10 bg-slate-900 px-6 py-6 text-slate-100">
            <div className="text-sm uppercase tracking-[0.24em] text-orange-200/80">当前阶段</div>
            <div className="mt-3 text-2xl font-semibold">
              {step === "config" && "填写模型配置"}
              {step === "story" && "组织故事设定"}
              {step === "generation" && "开始章节创作"}
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {step === "config" && "配置 API、模型、目标字数和自动续写参数。"}
              {step === "story" && "补全世界观、人物、冲突和文风要求，给长篇续写更稳定的上下文。"}
              {step === "generation" &&
                "按章节生成、续写、重写、导出和保存快照，正文会自动保存在本地。"}
            </p>
          </div>
        </section>

        <section className="panel rounded-[28px] p-4 sm:p-6">
          {step === "config" && (
            <ConfigPanel
              config={config}
              onChange={setConfig}
              onSubmit={() => setStep("story")}
            />
          )}

          {step === "story" && (
            <StorySetup
              story={story}
              onBack={() => setStep("config")}
              onChange={setStory}
              onSubmit={() => {
                void handleStorySubmit();
              }}
            />
          )}

          {step === "generation" && (
            <GenerationView
              activeChapterId={activeChapterId}
              activeChapterTitle={activeChapter?.title || ""}
              autoContinueToTarget={config.autoContinueToTarget}
              bookTitle={story.bookTitle}
              chapters={chapters}
              content={generation.content}
              currentMode={generation.currentMode}
              error={generation.error}
              hasSnapshot={Boolean(latestSnapshot)}
              isGenerating={generation.isGenerating}
              lastDeltaWords={generation.lastDeltaWords}
              lastStartedAt={generation.lastStartedAt}
              status={generation.status}
              targetWords={config.targetWords}
              wordCount={generation.wordCount}
              onBack={() => {
                activeRunIdRef.current = Date.now();
                generation.pauseGeneration();
                setStep("story");
              }}
              onContinue={() => {
                void runGeneration("continue");
              }}
              onCopyAll={() => generation.copyText(allBookText)}
              onCopyCurrent={() => generation.copyText(currentChapterText)}
              onCreateChapter={handleCreateChapter}
              onDownloadAllDocx={() =>
                generation.downloadDocx(
                  story.bookTitle || "webnovel-story",
                  chapters.map((chapter) => ({
                    title: chapter.title,
                    content: chapter.content,
                  })),
                )
              }
              onDownloadAllMarkdown={() =>
                generation.downloadMarkdown(story.bookTitle || "webnovel-story", allBookMarkdown)
              }
              onDownloadAllTxt={() =>
                generation.downloadTxt(story.bookTitle || "webnovel-story", allBookText)
              }
              onDownloadCurrentDocx={() =>
                generation.downloadDocx(activeChapter?.title || "current-chapter", [
                  {
                    title: activeChapter?.title || "",
                    content: activeChapter?.content || "",
                  },
                ])
              }
              onDownloadCurrentMarkdown={() =>
                generation.downloadMarkdown(activeChapter?.title || "current-chapter", currentChapterText)
              }
              onDownloadCurrentTxt={() =>
                generation.downloadTxt(activeChapter?.title || "current-chapter", currentChapterText)
              }
              onPause={() => {
                activeRunIdRef.current = Date.now();
                generation.pauseGeneration();
              }}
              onRestart={() => {
                void runGeneration("restart");
              }}
              onRestoreSnapshot={handleRestoreSnapshot}
              onSaveSnapshot={handleSaveSnapshot}
              onSelectChapter={setActiveChapterId}
              onStart={() => {
                void runGeneration("start");
              }}
              onToggleAutoContinue={(next) => setConfig((current) => ({ ...current, autoContinueToTarget: next }))}
              onUpdateChapterTitle={(title) => {
                updateActiveChapter((chapter) => ({
                  ...chapter,
                  title,
                  summary: buildChapterSummary(storyRef.current, title, chapter.content, chapter.summary),
                  updatedAt: new Date().toISOString(),
                }));
              }}
            />
          )}
        </section>
      </div>
    </main>
  );
}
