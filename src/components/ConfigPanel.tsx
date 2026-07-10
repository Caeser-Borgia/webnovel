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
  const selectedPreset = MODEL_PRESETS.find(
    (preset) => preset.url === config.apiUrl && preset.model === config.model,
  );

  const updateField = <Key extends keyof WriterConfig>(key: Key, value: WriterConfig[Key]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="panel-strong rounded-[28px] p-6 sm:p-8">
      <div className="mb-6">
        <div className="text-sm uppercase tracking-[0.24em] text-amber-800/70">Step 1</div>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">模型与生成配置</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          这里决定模型接入方式、目标字数和生成参数，都会自动保存在本地浏览器里。
        </p>
      </div>

      <div className="grid gap-6">
        <section className="grid gap-5 rounded-[24px] border border-amber-900/10 bg-white/45 p-5">
          <div>
            <div className="text-sm font-medium text-slate-900">模型接入</div>
            <div className="mt-1 text-sm text-slate-500">先把 API 地址、Key 和模型名配好。</div>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">常用预设</span>
            <select
              className="rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              value={selectedPreset?.label || ""}
              onChange={(event) => {
                if (!event.target.value) {
                  return;
                }

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
              <option value="">选择预设快速填充</option>
              {MODEL_PRESETS.map((preset) => (
                <option key={preset.label} value={preset.label}>
                  {preset.label}
                </option>
              ))}
            </select>
            <div className="text-xs text-slate-500">
              当前预设：{selectedPreset?.label || "自定义"} · {config.model || "未填写模型"}
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">API 地址</span>
            <input
              className="rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              placeholder="https://api.example.com/v1/chat/completions"
              type="url"
              value={config.apiUrl}
              onChange={(event) => updateField("apiUrl", event.target.value)}
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
              onChange={(event) => updateField("apiKey", event.target.value)}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">模型名</span>
            <input
              className="rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              placeholder="deepseek-chat"
              value={config.model}
              onChange={(event) => updateField("model", event.target.value)}
            />
          </label>
        </section>

        <section className="grid gap-5 rounded-[24px] border border-amber-900/10 bg-white/45 p-5">
          <div>
            <div className="text-sm font-medium text-slate-900">生成控制</div>
            <div className="mt-1 text-sm text-slate-500">这里决定目标字数、自动续写和采样风格。</div>
          </div>

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
                    onClick={() => updateField("style", style as NovelStyle)}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">目标字数</span>
              <input
                className="rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
                min={1000}
                step={1000}
                type="number"
                value={config.targetWords}
                onChange={(event) => updateField("targetWords", Number(event.target.value) || 0)}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">max_tokens</span>
              <input
                className="rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
                min={512}
                step={128}
                type="number"
                value={config.maxTokens}
                onChange={(event) => updateField("maxTokens", Number(event.target.value) || 0)}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">temperature</span>
              <input
                className="rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
                max={2}
                min={0}
                step={0.1}
                type="number"
                value={config.temperature}
                onChange={(event) => updateField("temperature", Number(event.target.value) || 0)}
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-amber-900/15 bg-white/80 px-4 py-3 text-sm text-slate-700">
              <input
                checked={config.autoContinueToTarget}
                className="h-4 w-4 accent-amber-500"
                type="checkbox"
                onChange={(event) => updateField("autoContinueToTarget", event.target.checked)}
              />
              自动续写到目标字数
            </label>
          </div>
        </section>

        <section className="grid gap-5 rounded-[24px] border border-amber-900/10 bg-white/45 p-5">
          <div>
            <div className="text-sm font-medium text-slate-900">高级提示</div>
            <div className="mt-1 text-sm text-slate-500">需要时再填，用来约束 system prompt 或补充写作要求。</div>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">可选 system prompt</span>
            <textarea
              className="min-h-24 rounded-[24px] border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              placeholder="例如：你要严格保持第一人称、节奏偏快、避免口水描写。"
              value={config.systemPrompt}
              onChange={(event) => updateField("systemPrompt", event.target.value)}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">附加写作要求</span>
            <textarea
              className="min-h-24 rounded-[24px] border border-amber-900/15 bg-white/80 px-4 py-3 outline-none transition focus:border-amber-500"
              placeholder="例如：本章重点写主角第一次进入宗门后的压迫感和试探。"
              value={config.additionalRequirements}
              onChange={(event) => updateField("additionalRequirements", event.target.value)}
            />
          </label>
        </section>
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
