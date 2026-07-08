"use client";

import type { StorySetupData } from "@/types";

interface StorySetupProps {
  story: StorySetupData;
  onBack: () => void;
  onChange: (next: StorySetupData) => void;
  onSubmit: () => void;
}

export function StorySetup({ story, onBack, onChange, onSubmit }: StorySetupProps) {
  const isDisabled = !story.bookTitle.trim() || !story.mainCharacter.trim();

  return (
    <div className="panel-strong rounded-[28px] p-6 sm:p-8">
      <div className="mb-6">
        <div className="text-sm uppercase tracking-[0.24em] text-amber-800/70">Step 2</div>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">故事设置</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          书名和主角名字会进入提示词，基础设定用于约束剧情方向和世界观。
        </p>
      </div>

      <div className="grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">书名</span>
          <input
            className="rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
            placeholder="我穿越了，但我不想修仙"
            value={story.bookTitle}
            onChange={(event) => onChange({ ...story, bookTitle: event.target.value })}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">主角名字</span>
          <input
            className="rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
            placeholder="李火旺"
            value={story.mainCharacter}
            onChange={(event) => onChange({ ...story, mainCharacter: event.target.value })}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">基本设定</span>
          <textarea
            className="min-h-40 rounded-[24px] border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
            placeholder="主角穿越到修仙世界，但他只想安稳活下去，却被卷入一场不断扩大的诡异风波。"
            value={story.setting}
            onChange={(event) => onChange({ ...story, setting: event.target.value })}
          />
        </label>
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
          开始创作
        </button>
      </div>
    </div>
  );
}
