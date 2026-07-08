import type {
  ChapterData,
  DraftSnapshot,
  GenerateRequestBody,
  GenerationMode,
  ModelPreset,
  StorySetupData,
  WriterConfig,
} from "@/types";

export const MODEL_PRESETS: ModelPreset[] = [
  {
    label: "DeepSeek",
    url: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
  },
  {
    label: "Claude 兼容代理",
    url: "https://api.example.com/v1/chat/completions",
    model: "claude-3-5-sonnet",
  },
  {
    label: "通义千问兼容代理",
    url: "https://api.example.com/v1/chat/completions",
    model: "qwen-max",
  },
  {
    label: "自定义",
    url: "",
    model: "",
  },
];

export const DEFAULT_WRITER_CONFIG: WriterConfig = {
  apiUrl: MODEL_PRESETS[0].url,
  apiKey: "",
  model: MODEL_PRESETS[0].model,
  style: "网文",
  targetWords: 100000,
  temperature: 0.9,
  maxTokens: 5000,
  systemPrompt: "",
  additionalRequirements: "",
  autoContinueToTarget: false,
};

export const DEFAULT_STORY_SETUP: StorySetupData = {
  bookTitle: "",
  mainCharacter: "",
  setting: "",
  storyIntro: "",
  worldSetting: "",
  protagonistProfile: "",
  supportingCharacters: "",
  factions: "",
  coreConflict: "",
  openingGoal: "",
  styleNotes: "",
};

export const STORAGE_KEYS = {
  config: "webnovel-writer-config",
  story: "webnovel-writer-story",
  project: "webnovel-writer-project",
};

export const MAX_SNAPSHOTS = 10;

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function countWords(content: string) {
  return content.replace(/\s/g, "").length;
}

export function getDefaultChapterTitle(index: number) {
  return `第${index}章`;
}

export function createChapter(index: number): ChapterData {
  const now = new Date().toISOString();

  return {
    id: createId("chapter"),
    title: getDefaultChapterTitle(index),
    content: "",
    summary: "",
    wordCount: 0,
    updatedAt: now,
    status: "idle",
    lastError: null,
    lastStartedAt: null,
    lastCompletedAt: null,
    lastGenerationMode: "start",
    lastDeltaWords: 0,
  };
}

export function createDraftSnapshot(chapter: ChapterData): DraftSnapshot {
  return {
    id: createId("snapshot"),
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    content: chapter.content,
    summary: chapter.summary,
    wordCount: chapter.wordCount,
    createdAt: new Date().toISOString(),
  };
}

export function createGenerateRequest(
  config: WriterConfig,
  story: StorySetupData,
  chapter: ChapterData,
  generationMode: GenerationMode,
): GenerateRequestBody {
  return {
    ...config,
    ...story,
    chapterTitle: chapter.title || "未命名章节",
    chapterSummary: chapter.summary,
    currentWordCount: chapter.wordCount,
    generationMode,
    previousContent: chapter.content,
  };
}

export function buildChapterPlainText(chapter: Pick<ChapterData, "title" | "content">) {
  return [chapter.title.trim(), chapter.content.trim()].filter(Boolean).join("\n\n");
}

export function buildBookPlainText(bookTitle: string, chapters: ChapterData[]) {
  const chapterText = chapters
    .map((chapter) => buildChapterPlainText(chapter))
    .filter(Boolean)
    .join("\n\n");

  return [bookTitle.trim(), chapterText].filter(Boolean).join("\n\n");
}

export function buildBookMarkdown(bookTitle: string, chapters: ChapterData[]) {
  const lines = [`# ${bookTitle.trim() || "未命名作品"}`];

  chapters.forEach((chapter) => {
    lines.push("");
    lines.push(`## ${chapter.title.trim() || "未命名章节"}`);
    lines.push("");
    lines.push(chapter.content.trim() || "暂无正文");
  });

  return lines.join("\n");
}

export function sanitizeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim() || "webnovel-story";
}
