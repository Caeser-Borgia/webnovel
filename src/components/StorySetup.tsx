"use client";

import { useState } from "react";
import type { StorySetupData } from "@/types";

interface StorySetupProps {
  story: StorySetupData;
  onBack: () => void;
  onChange: (next: StorySetupData) => void;
  onSubmit: () => void;
}

export function StorySetup({ story, onBack, onChange, onSubmit }: StorySetupProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    worldAndCharacters: false,
    narrative: false,
  });

  const isDisabled = !story.bookTitle.trim() || !story.mainCharacter.trim();

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const inputClass = "rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500";
  const textareaClass = "min-h-32 rounded-[24px] border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500";
  const labelClass = "text-sm font-medium text-slate-700";
  const hintClass = "text-xs text-slate-500 mt-1";

  return (
    <div className="panel-strong rounded-[28px] p-6 sm:p-8">
      <div className="mb-6">
        <div className="text-sm uppercase tracking-[0.24em] text-amber-800/70">Step 2</div>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">故事设置</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          补齐故事信息，让 AI 更好地理解你的创意。标注 * 的是必填项。
        </p>
      </div>

      <div className="space-y-4">
        {/* 基础信息区块 */}
        <div className="rounded-[24px] border border-amber-900/10 overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4 bg-white/50 hover:bg-white/70 transition"
            onClick={() => toggleSection("basic")}
            type="button"
          >
            <span className="text-sm font-semibold text-slate-900">📖 基础信息</span>
            <span className="text-sm text-slate-500">{expandedSections.basic ? "▼" : "▶"}</span>
          </button>
          {expandedSections.basic && (
            <div className="px-5 py-4 space-y-5 bg-white/30">
              <label className="grid gap-2">
                <span className={labelClass}>
                  书名 <span className="text-rose-500">*</span>
                </span>
                <input
                  className={inputClass}
                  placeholder="我穿越了，但我不想修仙"
                  value={story.bookTitle}
                  onChange={(event) => onChange({ ...story, bookTitle: event.target.value })}
                />
              </label>

              <label className="grid gap-2">
                <span className={labelClass}>
                  主角名字 <span className="text-rose-500">*</span>
                </span>
                <input
                  className={inputClass}
                  placeholder="李火旺"
                  value={story.mainCharacter}
                  onChange={(event) => onChange({ ...story, mainCharacter: event.target.value })}
                />
              </label>

              <label className="grid gap-2">
                <span className={labelClass}>故事简介</span>
                <textarea
                  className={textareaClass}
                  placeholder="用几句话概括你的故事核心：讲的是什么、发生在哪、主要冲突是什么"
                  value={story.storyIntro}
                  onChange={(event) => onChange({ ...story, storyIntro: event.target.value })}
                />
                <span className={hintClass}>帮助 AI 理解故事的整体框架</span>
              </label>
            </div>
          )}
        </div>

        {/* 世界观与人物区块 */}
        <div className="rounded-[24px] border border-amber-900/10 overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4 bg-white/50 hover:bg-white/70 transition"
            onClick={() => toggleSection("worldAndCharacters")}
            type="button"
          >
            <span className="text-sm font-semibold text-slate-900">🌍 世界观与人物</span>
            <span className="text-sm text-slate-500">{expandedSections.worldAndCharacters ? "▼" : "▶"}</span>
          </button>
          {expandedSections.worldAndCharacters && (
            <div className="px-5 py-4 space-y-5 bg-white/30">
              <label className="grid gap-2">
                <span className={labelClass}>世界观设定</span>
                <textarea
                  className={textareaClass}
                  placeholder="你的故事的背景世界是什么样的？如有多个世界、维度或特殊设定，请简要说明"
                  value={story.worldSetting}
                  onChange={(event) => onChange({ ...story, worldSetting: event.target.value })}
                />
                <span className={hintClass}>包括时代背景、地理、科技水平、超自然元素等</span>
              </label>

              <label className="grid gap-2">
                <span className={labelClass}>主角人设</span>
                <textarea
                  className={textareaClass}
                  placeholder="主角的性格、背景、能力、特殊之处？主角想要什么？"
                  value={story.protagonistProfile}
                  onChange={(event) => onChange({ ...story, protagonistProfile: event.target.value })}
                />
              </label>

              <label className="grid gap-2">
                <span className={labelClass}>主要配角</span>
                <textarea
                  className={textareaClass}
                  placeholder="其他重要角色（爱人、朋友、敌人等）的关键信息，用几句话描述"
                  value={story.supportingCharacters}
                  onChange={(event) => onChange({ ...story, supportingCharacters: event.target.value })}
                />
              </label>

              <label className="grid gap-2">
                <span className={labelClass}>基本设定</span>
                <textarea
                  className={textareaClass}
                  placeholder="主要情节、设定摘要或故事大纲的关键句"
                  value={story.setting}
                  onChange={(event) => onChange({ ...story, setting: event.target.value })}
                />
              </label>
            </div>
          )}
        </div>

        {/* 冲突与创作要求区块 */}
        <div className="rounded-[24px] border border-amber-900/10 overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4 bg-white/50 hover:bg-white/70 transition"
            onClick={() => toggleSection("narrative")}
            type="button"
          >
            <span className="text-sm font-semibold text-slate-900">⚔️ 冲突与创作要求</span>
            <span className="text-sm text-slate-500">{expandedSections.narrative ? "▼" : "▶"}</span>
          </button>
          {expandedSections.narrative && (
            <div className="px-5 py-4 space-y-5 bg-white/30">
              <label className="grid gap-2">
                <span className={labelClass}>核心矛盾</span>
                <textarea
                  className={textareaClass}
                  placeholder="故事中的核心冲突或问题是什么？主角需要解决什么？"
                  value={story.coreConflict}
                  onChange={(event) => onChange({ ...story, coreConflict: event.target.value })}
                />
              </label>

              <label className="grid gap-2">
                <span className={labelClass}>势力与阵营</span>
                <textarea
                  className={textareaClass}
                  placeholder="故事中有哪些势力、派系或阵营？它们的关系如何？"
                  value={story.factions}
                  onChange={(event) => onChange({ ...story, factions: event.target.value })}
                />
              </label>

              <label className="grid gap-2">
                <span className={labelClass}>开篇目标</span>
                <textarea
                  className={textareaClass}
                  placeholder="开局时，主角的目标是什么？故事的第一个关键情节是什么？"
                  value={story.openingGoal}
                  onChange={(event) => onChange({ ...story, openingGoal: event.target.value })}
                />
              </label>

              <label className="grid gap-2">
                <span className={labelClass}>文风补充要求</span>
                <textarea
                  className={textareaClass}
                  placeholder="除了选定的小说风格，还有其他写作要求吗？比如节奏、语气、细节层度等"
                  value={story.styleNotes}
                  onChange={(event) => onChange({ ...story, styleNotes: event.target.value })}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          className="rounded-full border border-amber-900/15 bg-white/70 px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-400"
          type="button"
          onClick={onBack}
        >
          返回
        </button>
        <button
          className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isDisabled}
          type="button"
          onClick={onSubmit}
        >
          开始创作 →
        </button>
      </div>
    </div>
  );
}
