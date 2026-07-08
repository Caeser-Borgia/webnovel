"use client";

import { MODEL_PRESETS } from "@/utils/api";
import { NOVEL_STYLES, type NovelStyle, type WriterConfig } from "@/types";

interface ConfigPanelProps {
  config: WriterConfig;
  onChange: (next: WriterConfig) => void;
  onSubmit: () => void;
}

export function ConfigPanel({ config, onChange, onSubmit }: ConfigPanelProps) {
  const isDisabled = !config.apiUrl.trim() || !config.apiKey.trim() || !config.model.trim();

  return (
    <div className="panel-strong rounded-[28px] p-6 sm:p-8">
      <div className="mb-6">
        <div className="text-sm uppercase tracking-[0.24em] text-amber-800/70">Step 1</div>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">网文生成工具配置</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          API Key 只保存在浏览器 localStorage 中，提交时仅发送到你本地运行的本站服务。
        </p>
      </div>

      <div className="grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">常用预设</span>
          <select
            className="rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
            defaultValue=""
            onChange={(event) => {
              const preset = MODEL_PRESETS.find((item) => item.label === event.target.value);

              if (!preset) {
                return;
              }

              onChange({
                ...config,
                apiUrl: preset.url || config.apiUrl,
                model: preset.model || config.model,
              });
            }}
          >
            <option value="">选择预设填充地址和模型</option>
            {MODEL_PRESETS.map((preset) => (
              <option key={preset.label} value={preset.label}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">API 地址</span>
          <input
            className="rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
            placeholder="https://api.example.com/v1/chat/completions"
            type="url"
            value={config.apiUrl}
            onChange={(event) => onChange({ ...config, apiUrl: event.target.value })}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">API Key</span>
          <input
            autoComplete="off"
            className="rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
            placeholder="sk-..."
            type="password"
            value={config.apiKey}
            onChange={(event) => onChange({ ...config, apiKey: event.target.value })}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">模型名称</span>
          <input
            className="rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
            placeholder="deepseek-chat"
            value={config.model}
            onChange={(event) => onChange({ ...config, model: event.target.value })}
          />
        </label>

        <div className="grid gap-3">
          <span className="text-sm font-medium text-slate-700">小说风格</span>
          <div className="flex flex-wrap gap-3">
            {NOVEL_STYLES.map((style) => {
              const isActive = config.style === style;

              return (
                <button
                  key={style}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? "border-amber-500 bg-amber-500 text-white"
                      : "border-amber-900/15 bg-white/75 text-slate-700 hover:border-amber-400"
                  }`}
                  type="button"
                  onClick={() => onChange({ ...config, style: style as NovelStyle })}
                >
                  {style}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isDisabled}
          type="button"
          onClick={onSubmit}
        >
          继续
        </button>
      </div>
    </div>
  );
}
