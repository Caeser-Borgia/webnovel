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

  const updateField = <Key extends keyof StorySetupData>(key: Key, value: StorySetupData[Key]) => {
    onChange({ ...story, [key]: value });
  };

  return (
    <div className="panel-strong rounded-[28px] p-6 sm:p-8">
      <div className="mb-6">
        <div className="text-sm uppercase tracking-[0.24em] text-amber-800/70">Step 2</div>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">故事设定</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          这里不再只填书名和一句设定，而是把长期创作真正会反复用到的素材组织起来。
        </p>
      </div>

      <div className="grid gap-6">
        <section className="grid gap-5 rounded-[24px] border border-amber-900/10 bg-white/45 p-5">
          <div>
            <div className="text-sm font-medium text-slate-900">基础信息</div>
            <div className="mt-1 text-sm text-slate-500">先把故事的骨架立住。</div>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">书名</span>
            <input
              className="rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              placeholder="我穿越了，但我不想修仙"
              value={story.bookTitle}
              onChange={(event) => updateField("bookTitle", event.target.value)}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">主角名字</span>
            <input
              className="rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              placeholder="李长安"
              value={story.mainCharacter}
              onChange={(event) => updateField("mainCharacter", event.target.value)}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">故事简介</span>
            <textarea
              className="min-h-24 rounded-[24px] border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              placeholder="一句到一段话说明这本书讲什么，最好带出类型和主线。"
              value={story.storyIntro}
              onChange={(event) => updateField("storyIntro", event.target.value)}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">基础设定</span>
            <textarea
              className="min-h-32 rounded-[24px] border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              placeholder="主角所处时代、起点状态、开局遭遇，以及故事最基本的方向。"
              value={story.setting}
              onChange={(event) => updateField("setting", event.target.value)}
            />
          </label>
        </section>

        <section className="grid gap-5 rounded-[24px] border border-amber-900/10 bg-white/45 p-5">
          <div>
            <div className="text-sm font-medium text-slate-900">世界观与人物</div>
            <div className="mt-1 text-sm text-slate-500">控制长篇连续性最有用的就是这部分。</div>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">世界观设定</span>
            <textarea
              className="min-h-28 rounded-[24px] border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              placeholder="世界规则、力量体系、社会结构、时代背景。"
              value={story.worldSetting}
              onChange={(event) => updateField("worldSetting", event.target.value)}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">主角人设</span>
            <textarea
              className="min-h-24 rounded-[24px] border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              placeholder="主角性格、能力、短板、执念、身份标签。"
              value={story.protagonistProfile}
              onChange={(event) => updateField("protagonistProfile", event.target.value)}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">主要配角</span>
            <textarea
              className="min-h-24 rounded-[24px] border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              placeholder="重要配角、关系定位、能制造什么冲突或帮助。"
              value={story.supportingCharacters}
              onChange={(event) => updateField("supportingCharacters", event.target.value)}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">势力 / 阵营</span>
            <textarea
              className="min-h-24 rounded-[24px] border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              placeholder="宗门、组织、国家、学院、公司等关键势力。"
              value={story.factions}
              onChange={(event) => updateField("factions", event.target.value)}
            />
          </label>
        </section>

        <section className="grid gap-5 rounded-[24px] border border-amber-900/10 bg-white/45 p-5">
          <div>
            <div className="text-sm font-medium text-slate-900">冲突与文风</div>
            <div className="mt-1 text-sm text-slate-500">给模型一个稳定的推进方向，而不是让它即兴乱飘。</div>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">核心矛盾</span>
            <textarea
              className="min-h-24 rounded-[24px] border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              placeholder="这本书真正长期驱动剧情的冲突是什么。"
              value={story.coreConflict}
              onChange={(event) => updateField("coreConflict", event.target.value)}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">开篇目标</span>
            <textarea
              className="min-h-24 rounded-[24px] border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              placeholder="主角开篇最直接的任务、欲望或危机。"
              value={story.openingGoal}
              onChange={(event) => updateField("openingGoal", event.target.value)}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">文风补充要求</span>
            <textarea
              className="min-h-24 rounded-[24px] border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              placeholder="比如：第一人称、节奏偏快、对白多、少抒情、克制爽文感。"
              value={story.styleNotes}
              onChange={(event) => updateField("styleNotes", event.target.value)}
            />
          </label>
        </section>
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
          进入创作
        </button>
      </div>
    </div>
  );
}
