"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserPrompt } from "@/lib/types";

const ASPECT_RATIOS = [
  { key: "1:1", label: "1:1 Feed" },
  { key: "9:16", label: "9:16 Story" },
  { key: "16:9", label: "16:9 X Post" },
] as const;

const CATEGORIES = [
  { value: "", label: "なし" },
  { value: "cafe", label: "カフェ" },
  { value: "izakaya", label: "居酒屋" },
  { value: "italian", label: "イタリアン" },
  { value: "sweets", label: "スイーツ" },
  { value: "ramen", label: "ラーメン" },
  { value: "chinese", label: "中華" },
  { value: "japanese", label: "和食" },
  { value: "other", label: "その他" },
];

type Props = {
  onGenerate: (prompt: string, aspectRatio: string) => void;
  isGenerating: boolean;
};

export default function PromptMode({ onGenerate, isGenerating }: Props) {
  const [prompts, setPrompts] = useState<UserPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [promptText, setPromptText] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    try {
      const res = await fetch("/api/prompts/mine");
      if (res.ok) {
        const data = await res.json();
        setPrompts(data.prompts || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleSelectPrompt = (prompt: UserPrompt) => {
    setPromptText(prompt.prompt_text);

    // usage_count をインクリメント（非ブロッキング）
    fetch(`/api/prompts/mine/${prompt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usage_count: prompt.usage_count + 1 }),
    }).then(() => {
      setPrompts((prev) =>
        prev.map((p) =>
          p.id === prompt.id ? { ...p, usage_count: p.usage_count + 1 } : p
        )
      );
    }).catch(() => {});
  };

  const handleGenerate = () => {
    if (!promptText.trim() || isGenerating) return;
    onGenerate(promptText.trim(), aspectRatio);
  };

  const handleStartEdit = (prompt: UserPrompt) => {
    setEditingId(prompt.id);
    setEditName(prompt.name);
    setEditText(prompt.prompt_text);
    setEditCategory(prompt.category || "");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim() || !editText.trim()) return;
    try {
      const res = await fetch(`/api/prompts/mine/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          prompt_text: editText.trim(),
          category: editCategory || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPrompts((prev) =>
          prev.map((p) => (p.id === editingId ? data.prompt : p))
        );
        setEditingId(null);
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/prompts/mine/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPrompts((prev) => prev.filter((p) => p.id !== id));
        setDeleteConfirmId(null);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-7 py-5 md:py-7 flex flex-col gap-5">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-accent-warm uppercase tracking-[1.5px]">
              Prompt Mode
            </span>
            <span className="px-2 py-0.5 rounded-full bg-accent-gold/15 text-accent-gold text-[10px] font-bold tracking-wider">
              PRO
            </span>
          </div>
          <div className="font-semibold text-sm mt-0.5">プロンプトモード</div>
          <div className="text-xs text-text-muted mt-0.5">
            保存済みプロンプトを選択するか、直接入力して画像を生成
          </div>
        </div>
      </div>

      {/* 保存済みプロンプト一覧 */}
      <div>
        <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-[1px] mb-3">
          保存済みプロンプト
        </div>
        {loading ? (
          <div className="text-sm text-text-muted py-4 text-center">読み込み中...</div>
        ) : prompts.length === 0 ? (
          <div className="p-4 bg-bg-secondary rounded-[16px] border border-border-light text-sm text-text-muted text-center">
            保存されたプロンプトはありません。
            <br />
            <span className="text-xs">画像生成後にプレビューパネルから保存できます。</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {prompts.map((prompt) => (
              <div key={prompt.id}>
                {editingId === prompt.id ? (
                  /* 編集モード */
                  <div className="p-4 bg-bg-secondary rounded-[16px] border border-accent-warm/30 flex flex-col gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={100}
                      className="w-full px-3 py-2 rounded-[10px] border border-border-light bg-bg-primary text-sm focus:outline-none focus:border-accent-warm transition-colors"
                      placeholder="プロンプト名"
                    />
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength={2000}
                      rows={4}
                      className="w-full px-3 py-2 rounded-[10px] border border-border-light bg-bg-primary text-sm focus:outline-none focus:border-accent-warm transition-colors resize-y"
                    />
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-[10px] border border-border-light bg-bg-primary text-sm focus:outline-none focus:border-accent-warm transition-colors"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1.5 rounded-full text-xs text-text-secondary border border-border-light bg-transparent hover:bg-bg-primary transition-colors cursor-pointer"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editName.trim() || !editText.trim()}
                        className="px-4 py-1.5 rounded-full text-xs text-white bg-accent-warm hover:bg-accent-warm-hover transition-colors cursor-pointer disabled:opacity-50"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : deleteConfirmId === prompt.id ? (
                  /* 削除確認 */
                  <div className="p-4 bg-red-50 rounded-[16px] border border-red-200 flex items-center justify-between gap-3">
                    <div className="text-sm text-red-700">
                      「{prompt.name}」を削除しますか？
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1.5 rounded-full text-xs text-text-secondary border border-border-light bg-white hover:bg-bg-primary transition-colors cursor-pointer"
                      >
                        戻る
                      </button>
                      <button
                        onClick={() => handleDelete(prompt.id)}
                        className="px-3 py-1.5 rounded-full text-xs text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 通常表示 */
                  <div
                    onClick={() => handleSelectPrompt(prompt)}
                    className="p-4 bg-bg-secondary rounded-[16px] border border-border-light cursor-pointer transition-all duration-300 hover:border-accent-warm/30 hover:shadow-[0_2px_12px_rgba(232,113,58,.08)] group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent-gold opacity-0 group-hover:opacity-40 transition-opacity" />
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm truncate">{prompt.name}</span>
                          {prompt.category && (
                            <span className="px-2 py-0.5 rounded-full bg-accent-olive/15 text-accent-olive text-[10px] font-medium flex-shrink-0">
                              {prompt.category}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-muted line-clamp-2">
                          {prompt.prompt_text}
                        </div>
                        <div className="text-[10px] text-text-muted mt-1.5">
                          使用回数: {prompt.usage_count}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleStartEdit(prompt)}
                          title="編集"
                          className="w-7 h-7 rounded-full border border-border-light bg-bg-primary flex items-center justify-center text-text-muted hover:text-accent-warm hover:border-accent-warm/30 transition-colors cursor-pointer text-xs"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(prompt.id)}
                          title="削除"
                          className="w-7 h-7 rounded-full border border-border-light bg-bg-primary flex items-center justify-center text-text-muted hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* プロンプト入力エリア */}
      <div>
        <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-[1px] mb-3">
          プロンプト入力
        </div>
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          maxLength={2000}
          rows={6}
          placeholder="画像生成プロンプトを入力してください...&#10;例: A professional food photography for a restaurant menu..."
          className="w-full px-4 py-3 rounded-[16px] border border-border-light bg-bg-secondary text-sm leading-relaxed focus:outline-none focus:border-accent-warm transition-colors resize-y"
        />
        <div className="text-xs text-text-muted text-right mt-1">
          {promptText.length}/2000
        </div>
      </div>

      {/* アスペクト比選択 */}
      <div>
        <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-[1px] mb-3">
          アスペクト比
        </div>
        <div className="flex gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.key}
              onClick={() => setAspectRatio(ratio.key)}
              className={`px-4 py-2 rounded-full text-xs font-medium cursor-pointer border transition-all duration-300 ${
                aspectRatio === ratio.key
                  ? "bg-accent-warm text-white border-accent-warm shadow-[0_2px_8px_rgba(232,113,58,.2)]"
                  : "bg-transparent text-text-secondary border-border-light hover:border-accent-warm/30 hover:text-accent-warm"
              }`}
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>

      {/* 生成ボタン */}
      <button
        onClick={handleGenerate}
        disabled={!promptText.trim() || isGenerating}
        className="w-full py-4 rounded-full border-none text-[15px] font-bold bg-accent-warm text-white cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 hover:bg-accent-warm-hover hover:shadow-[0_4px_16px_rgba(232,113,58,.25)] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L11.5 7L17 7.5L13 11.5L14 17L9 14L4 17L5 11.5L1 7.5L6.5 7L9 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            画像を生成する
          </>
        )}
      </button>
    </div>
  );
}
