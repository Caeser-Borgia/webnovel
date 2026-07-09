"use client";

import { useState } from "react";
import type { CharacterCard } from "@/types";

interface CharacterManagerProps {
  characters: CharacterCard[];
  onChange: (next: CharacterCard[]) => void;
}

export function CharacterManager({ characters, onChange }: CharacterManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addCharacter = () => {
    const newCharacter: CharacterCard = {
      id: `char-${Date.now()}`,
      name: "新角色",
      role: "重要配角",
      description: "",
      status: "",
      relationships: "",
    };
    onChange([...characters, newCharacter]);
    setEditingId(newCharacter.id);
  };

  const updateCharacter = (id: string, updates: Partial<CharacterCard>) => {
    onChange(
      characters.map((char) =>
        char.id === id ? { ...char, ...updates } : char
      )
    );
  };

  const deleteCharacter = (id: string) => {
    onChange(characters.filter((char) => char.id !== id));
  };

  const editingChar = characters.find((c) => c.id === editingId);

  return (
    <div className="rounded-[24px] border border-amber-900/10 bg-white/40 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 bg-white/50 hover:bg-white/70 transition"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <div className="text-left">
          <span className="text-sm font-semibold text-slate-900">👥 角色卡</span>
          <span className="ml-2 text-xs text-slate-500">({characters.length} 个)</span>
        </div>
        <span className="text-sm text-slate-500">{isOpen ? "▼" : "▶"}</span>
      </button>

      {isOpen && (
        <div className="px-5 py-4 space-y-4 bg-white/30">
          {characters.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-sm">
              还没有添加角色卡。建议为重要角色添加档案，确保长篇写作中角色的一致性。
            </div>
          ) : (
            <div className="grid gap-2 max-h-[200px] sm:max-h-[240px] overflow-y-auto">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className={`rounded-lg px-4 py-3 border transition ${
                    editingId === character.id
                      ? "border-amber-500 bg-amber-50"
                      : "border-amber-900/10 bg-white/60 hover:bg-white/80"
                  }`}
                >
                  {editingId === character.id ? (
                    <div className="space-y-3">
                      <input
                        className="w-full rounded-lg border border-amber-900/15 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-amber-500"
                        placeholder="角色名"
                        value={character.name}
                        onChange={(e) =>
                          updateCharacter(character.id, { name: e.target.value })
                        }
                      />
                      <select
                        className="w-full rounded-lg border border-amber-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
                        value={character.role}
                        onChange={(e) =>
                          updateCharacter(character.id, { role: e.target.value as CharacterCard["role"] })
                        }
                      >
                        <option value="主角">主角</option>
                        <option value="主配角">主配角</option>
                        <option value="重要配角">重要配角</option>
                        <option value="其他">其他</option>
                      </select>
                      <textarea
                        className="w-full min-h-16 rounded-lg border border-amber-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
                        placeholder="性格、身份、重要经历等"
                        value={character.description}
                        onChange={(e) =>
                          updateCharacter(character.id, { description: e.target.value })
                        }
                      />
                      <textarea
                        className="w-full min-h-12 rounded-lg border border-amber-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
                        placeholder="当前状态、关系变化、未来走向"
                        value={character.status}
                        onChange={(e) =>
                          updateCharacter(character.id, { status: e.target.value })
                        }
                      />
                      <textarea
                        className="w-full min-h-12 rounded-lg border border-amber-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
                        placeholder="与其他角色的关系"
                        value={character.relationships}
                        onChange={(e) =>
                          updateCharacter(character.id, { relationships: e.target.value })
                        }
                      />
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
                          onClick={() => deleteCharacter(character.id)}
                          type="button"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="w-full text-left"
                      onClick={() => setEditingId(character.id)}
                      type="button"
                    >
                      <div className="font-medium text-slate-900">{character.name}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        {character.role} {character.description.slice(0, 40)}...
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            className="w-full rounded-lg border border-amber-500 bg-amber-50 hover:bg-amber-100 text-amber-900 px-4 py-2 text-sm font-medium transition"
            onClick={addCharacter}
            type="button"
          >
            + 添加角色卡
          </button>
        </div>
      )}
    </div>
  );
}
