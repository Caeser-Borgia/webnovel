"use client";

import { useState } from "react";

interface PlotPoint {
  id: string;
  title: string;
  type: "大纲" | "伏笔" | "情节" | "悬念";
  description: string;
  resolved: boolean; // 是否已交代
  chapter: string; // 出现或应该出现的章节
}

interface PlotManagerProps {
  plots: PlotPoint[];
  onChange: (next: PlotPoint[]) => void;
}

export function PlotManager({ plots, onChange }: PlotManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addPlot = () => {
    const newPlot: PlotPoint = {
      id: `plot-${Date.now()}`,
      title: "新情节",
      type: "情节",
      description: "",
      resolved: false,
      chapter: "",
    };
    onChange([...plots, newPlot]);
    setEditingId(newPlot.id);
  };

  const updatePlot = (id: string, updates: Partial<PlotPoint>) => {
    onChange(plots.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePlot = (id: string) => {
    onChange(plots.filter((p) => p.id !== id));
  };

  const unresolved = plots.filter((p) => !p.resolved);
  const editingPlot = plots.find((p) => p.id === editingId);

  const typeColor: Record<string, string> = {
    大纲: "border-blue-200 bg-blue-50 text-blue-700",
    伏笔: "border-purple-200 bg-purple-50 text-purple-700",
    情节: "border-amber-200 bg-amber-50 text-amber-700",
    悬念: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <div className="rounded-[24px] border border-amber-900/10 bg-white/40 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 bg-white/50 hover:bg-white/70 transition"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <div className="text-left">
          <span className="text-sm font-semibold text-slate-900">📋 大纲与伏笔</span>
          <span className="ml-2 text-xs text-slate-500">
            ({unresolved.length}/{plots.length})
          </span>
        </div>
        <span className="text-sm text-slate-500">{isOpen ? "▼" : "▶"}</span>
      </button>

      {isOpen && (
        <div className="px-5 py-4 space-y-4 bg-white/30">
          {plots.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-sm">
              记录故事大纲、伏笔和悬念，确保长篇创作不遗漏关键情节。
            </div>
          ) : (
            <div className="grid gap-2 max-h-72 overflow-y-auto">
              {plots.map((plot) => (
                <div
                  key={plot.id}
                  className={`rounded-lg px-4 py-3 border transition ${
                    editingId === plot.id
                      ? "border-amber-500 bg-amber-50"
                      : "border-amber-900/10 bg-white/60 hover:bg-white/80"
                  }`}
                >
                  {editingId === plot.id ? (
                    <div className="space-y-3">
                      <input
                        className="w-full rounded-lg border border-amber-900/15 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-amber-500"
                        placeholder="标题"
                        value={plot.title}
                        onChange={(e) =>
                          updatePlot(plot.id, { title: e.target.value })
                        }
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="rounded-lg border border-amber-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
                          value={plot.type}
                          onChange={(e) =>
                            updatePlot(plot.id, {
                              type: e.target.value as PlotPoint["type"],
                            })
                          }
                        >
                          <option value="大纲">大纲</option>
                          <option value="伏笔">伏笔</option>
                          <option value="情节">情节</option>
                          <option value="悬念">悬念</option>
                        </select>
                        <input
                          className="rounded-lg border border-amber-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
                          placeholder="应该出现的章节"
                          value={plot.chapter}
                          onChange={(e) =>
                            updatePlot(plot.id, { chapter: e.target.value })
                          }
                        />
                      </div>
                      <textarea
                        className="w-full min-h-16 rounded-lg border border-amber-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
                        placeholder="情节细节或伏笔内容"
                        value={plot.description}
                        onChange={(e) =>
                          updatePlot(plot.id, { description: e.target.value })
                        }
                      />
                      <label className="flex items-center gap-2 rounded-lg border border-amber-900/10 bg-white/80 px-3 py-2 cursor-pointer">
                        <input
                          checked={plot.resolved}
                          className="h-4 w-4 accent-amber-500"
                          type="checkbox"
                          onChange={(e) =>
                            updatePlot(plot.id, { resolved: e.target.checked })
                          }
                        />
                        <span className="text-sm text-slate-700">已交代/已完成</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          className="flex-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 text-sm font-medium transition"
                          onClick={() => setEditingId(null)}
                          type="button"
                        >
                          完成
                        </button>
                        <button
                          className="rounded-lg border border-rose-200 hover:border-rose-400 text-rose-600 px-3 py-2 text-sm font-medium transition"
                          onClick={() => deletePlot(plot.id)}
                          type="button"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="w-full text-left"
                      onClick={() => setEditingId(plot.id)}
                      type="button"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full border ${
                            typeColor[plot.type]
                          }`}
                        >
                          {plot.type}
                        </span>
                        {plot.resolved && (
                          <span className="text-xs text-green-600 font-medium">✓</span>
                        )}
                      </div>
                      <div
                        className={`font-medium ${
                          plot.resolved
                            ? "text-slate-500 line-through"
                            : "text-slate-900"
                        }`}
                      >
                        {plot.title}
                      </div>
                      {plot.chapter && (
                        <div className="text-xs text-slate-500 mt-1">
                          {plot.chapter}
                        </div>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            className="w-full rounded-lg border border-amber-500 bg-amber-50 hover:bg-amber-100 text-amber-900 px-4 py-2 text-sm font-medium transition"
            onClick={addPlot}
            type="button"
          >
            + 添加情节
          </button>
        </div>
      )}
    </div>
  );
}
