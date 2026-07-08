export const NOVEL_STYLES = ["网文", "科幻", "言情", "悬疑", "奇幻"] as const;

export type NovelStyle = (typeof NOVEL_STYLES)[number];
export type AppStep = "config" | "story" | "generation";
export type GenerationStatus = "idle" | "generating" | "paused" | "completed" | "error";
export type GenerationMode = "start" | "continue" | "restart";

export interface WriterConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  style: NovelStyle;
  targetWords: number;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  additionalRequirements: string;
  autoContinueToTarget: boolean;
}

export interface StorySetupData {
  bookTitle: string;
  mainCharacter: string;
  setting: string;
  storyIntro: string;
  worldSetting: string;
  protagonistProfile: string;
  supportingCharacters: string;
  factions: string;
  coreConflict: string;
  openingGoal: string;
  styleNotes: string;
}

export interface ModelPreset {
  label: string;
  url: string;
  model: string;
}

export interface GenerateRequestBody extends WriterConfig, StorySetupData {
  previousContent: string;
  chapterTitle: string;
  chapterSummary: string;
  currentWordCount: number;
  generationMode: GenerationMode;
}

export interface ChapterData {
  id: string;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  updatedAt: string;
  status: GenerationStatus;
  lastError: string | null;
  lastStartedAt: string | null;
  lastCompletedAt: string | null;
  lastGenerationMode: GenerationMode;
  lastDeltaWords: number;
}

export interface DraftSnapshot {
  id: string;
  chapterId: string;
  chapterTitle: string;
  content: string;
  summary: string;
  wordCount: number;
  createdAt: string;
}

export interface StoredProjectData {
  chapters: ChapterData[];
  activeChapterId: string | null;
  snapshots: DraftSnapshot[];
}
