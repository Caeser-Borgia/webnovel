import type { GenerateRequestBody, ModelPreset, StorySetupData, WriterConfig } from "@/types";

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
};

export const DEFAULT_STORY_SETUP: StorySetupData = {
  bookTitle: "",
  mainCharacter: "",
  setting: "",
};

export const STORAGE_KEYS = {
  config: "webnovel-writer-config",
  story: "webnovel-writer-story",
};

export function createGenerateRequest(
  config: WriterConfig,
  story: StorySetupData,
  previousContent: string,
): GenerateRequestBody {
  return {
    ...config,
    ...story,
    previousContent,
  };
}

export function sanitizeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim() || "webnovel-story";
}
