"use client";

import { useEffect, useState } from "react";
import { ConfigPanel } from "@/components/ConfigPanel";
import { GenerationView } from "@/components/GenerationView";
import { StorySetup } from "@/components/StorySetup";
import { useNovelGeneration } from "@/hooks/useNovelGeneration";
import {
  createGenerateRequest,
  DEFAULT_STORY_SETUP,
  DEFAULT_WRITER_CONFIG,
  STORAGE_KEYS,
} from "@/utils/api";
import type { AppStep, StorySetupData, WriterConfig } from "@/types";

const steps: Array<{ key: AppStep; label: string }> = [
  { key: "config", label: "配置" },
  { key: "story", label: "设定" },
  { key: "generation", label: "创作" },
];

export default function Home() {
  const [step, setStep] = useState<AppStep>("config");
  const [config, setConfig] = useState<WriterConfig>(DEFAULT_WRITER_CONFIG);
  const [story, setStory] = useState<StorySetupData>(DEFAULT_STORY_SETUP);
  const generation = useNovelGeneration();

  useEffect(() => {
    const savedConfig = window.localStorage.getItem(STORAGE_KEYS.config);
    const savedStory = window.localStorage.getItem(STORAGE_KEYS.story);

    if (savedConfig) {
      setConfig((current) => ({ ...current, ...JSON.parse(savedConfig) }));
    }

    if (savedStory) {
      setStory((current) => ({ ...current, ...JSON.parse(savedStory) }));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.story, JSON.stringify(story));
  }, [story]);

  const startGeneration = async () => {
    const payload = createGenerateRequest(config, story, { content: "", title: "", summary: "", wordCount: 0, updatedAt: "" } as any, "start");
    await generation.startGeneration(payload);
  };

  const continueGeneration = async () => {
    const payload = createGenerateRequest(config, story, { content: generation.content, title: "", summary: "", wordCount: generation.wordCount, updatedAt: "" } as any, "continue");
    await generation.continueGeneration(payload);
  };

  const handleStorySubmit = async () => {
    setStep("generation");
    await startGeneration();
  };

  const activeIndex = steps.findIndex((item) => item.key === step);

  return (
    <main className="min-h-screen px-4 py-8 text-slate-800 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="panel rounded-[28px] p-6 sm:p-8">
          <div className="mb-8 inline-flex rounded-full border border-amber-900/15 bg-white/55 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-amber-900/70">
            WebNovel Writer
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            把灵感变成长篇网文，在本地一边生成一边看见它长出来。
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            输入你的 API 地址、Key 和模型名，就能用自定义大模型流式生成小说内容。配置和故事设定会自动保存在浏览器本地。
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
            <div className="text-sm uppercase tracking-[0.24em] text-orange-200/80">当前状态</div>
            <div className="mt-3 text-2xl font-semibold">
              {step === "config" && "填写模型配置"}
              {step === "story" && "补齐故事设定"}
              {step === "generation" && "开始流式创作"}
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {step === "config" && "支持保存 API 地址、Key、模型名和风格；下次打开页面会自动恢复。"}
              {step === "story" && "书名和主角名会进入提示词，基本设定用于约束剧情方向和世界观。"}
              {step === "generation" &&
                "内容会通过本地 API 路由流式返回，你可以随时暂停、重新开始、复制或导出。"}
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
              bookTitle={story.bookTitle}
              content={generation.content}
              error={generation.error}
              isGenerating={generation.isGenerating}
              status={generation.status}
              targetWords={config.targetWords}
              wordCount={generation.wordCount}
              lastDeltaWords={generation.lastDeltaWords}
              lastStartedAt={generation.lastStartedAt}
              onBack={() => {
                generation.pauseGeneration();
                setStep("story");
              }}
              onCopy={generation.copyContent}
              onContinue={continueGeneration}
              onDownloadDocx={() => generation.downloadDocx(story.bookTitle)}
              onDownloadTxt={() => generation.downloadTxt(story.bookTitle)}
              onPause={generation.pauseGeneration}
              onRestart={() => {
                void startGeneration();
              }}
            />
          )}
        </section>
      </div>
    </main>
  );
}
