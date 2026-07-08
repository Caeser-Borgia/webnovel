"use client";

import { useState } from "react";
import type { WriterConfig } from "@/types";

interface GenerationParamsProps {
  config: WriterConfig;
  onChange: (next: WriterConfig) => void;
}

export function GenerationParams({ config, onChange }: GenerationParamsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateParam = <K extends keyof WriterConfig>(key: K, value: WriterConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="rounded-[24px] border border-amber-900/10 bg-white/40 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 bg-white/50 hover:bg-white/70 transition"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="text-sm font-semibold text-slate-900">⚙️ 生成参数</span>
        <span className="text-sm text-slate-500">{isOpen ? "▼" : "▶"}</span>
      </button>

      {isOpen && (
        <div className="px-5 py-4 space-y-5 bg-white/30">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="temperature" className="text-sm font-medium text-slate-700">
                Temperature（创意度）
              </label>
              <span className="text-sm text-amber-700 font-medium">{config.temperature.toFixed(1)}</span>
            </div>
            <input
              id="temperature"
              className="h-2 w-full accent-amber-500"
              max="2"
              min="0"
              step="0.1"
              type="range"
              value={config.temperature}
              onChange={(e) => updateParam("temperature", parseFloat(e.target.value))}
            />
            <span className="text-xs text-slate-500">0 = 确定性，2 = 最有创意</span>
          </div>

          <div className="grid gap-2">
            <label htmlFor="maxTokens" className="text-sm font-medium text-slate-700">
              Max Tokens（单次最大生成字数）
            </label>
            <input
              id="maxTokens"
              className="rounded-2xl border border-amber-900/15 bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-amber-500"
              min="500"
              step="500"
              type="number"
              value={config.maxTokens}
              onChange={(e) => updateParam("maxTokens", Math.max(500, parseInt(e.target.value)))}
            />
            <span className="text-xs text-slate-500">单次请求的最大 token 数，影响单轮生成的长度</span>
          </div>

          <div className="grid gap-2">
            <label htmlFor="targetWords" className="text-sm font-medium text-slate-700">
              目标字数（单章）
            </label>
            <input
              id="targetWords"
              className="rounded-2xl border border-amber-900/15 bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-amber-500"
              min="1000"
              step="1000"
              type="number"
              value={config.targetWords}
              onChange={(e) => updateParam("targetWords", Math.max(1000, parseInt(e.target.value)))}
            />
            <span className="text-xs text-slate-500">每个章节的目标字数，用于计算生成进度</span>
          </div>

          <div className="grid gap-2">
            <label htmlFor="systemPrompt" className="text-sm font-medium text-slate-700">
              自定义 System Prompt
            </label>
            <textarea
              id="systemPrompt"
              className="min-h-20 rounded-2xl border border-amber-900/15 bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-amber-500"
              placeholder="留空则使用默认的文风提示词。你可以在这里添加额外的写作要求。"
              value={config.systemPrompt}
              onChange={(e) => updateParam("systemPrompt", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="additionalRequirements" className="text-sm font-medium text-slate-700">
              附加写作要求
            </label>
            <textarea
              id="additionalRequirements"
              className="min-h-20 rounded-2xl border border-amber-900/15 bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-amber-500"
              placeholder="比如：要用第一人称、多对白、克制铺垫、避免某些情节、加强细节等"
              value={config.additionalRequirements}
              onChange={(e) => updateParam("additionalRequirements", e.target.value)}
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-amber-900/10 bg-white/80 px-4 py-3 cursor-pointer">
            <input
              checked={config.autoContinueToTarget}
              className="h-4 w-4 accent-amber-500"
              type="checkbox"
              onChange={(e) => updateParam("autoContinueToTarget", e.target.checked)}
            />
            <span className="text-sm font-medium text-slate-700">生成时自动续写到目标字数</span>
          </label>
        </div>
      )}
    </div>
  );
}
