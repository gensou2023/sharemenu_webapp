"use client";

import { useState, useEffect } from "react";

type PromptTemplate = {
  id: string;
  name: string;
  content: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPrompts = () => {
    setLoading(true);
    fetch("/api/admin/prompts")
      .then((r) => r.json())
      .then((data) => setPrompts(data.prompts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPrompts(); }, []);

  const activePrompts = prompts.filter((p) => p.is_active);
  const historyPrompts = prompts.filter((p) => !p.is_active);

  const startEdit = (prompt: PromptTemplate) => {
    setEditingName(prompt.name);
    setEditContent(prompt.content);
  };

  const cancelEdit = () => {
    setEditingName(null);
    setEditContent("");
  };

  const savePrompt = async () => {
    if (!editingName || !editContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName, content: editContent }),
      });
      if (res.ok) {
        cancelEdit();
        fetchPrompts();
      }
    } catch {
      // エラー無視
    } finally {
      setSaving(false);
    }
  };

  const promptLabel = (name: string) => {
    switch (name) {
      case "chat_system": return "チャット システムプロンプト";
      case "image_gen": return "画像生成プロンプト";
      default: return name;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">プロンプト管理</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-border-light rounded-[12px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {activePrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-bg-secondary rounded-[12px] border border-border-light overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-border-light flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm">{promptLabel(prompt.name)}</span>
                  <span className="ml-3 text-xs text-text-muted">
                    v{prompt.version} ・ {new Date(prompt.updated_at).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                {editingName !== prompt.name && (
                  <button
                    onClick={() => startEdit(prompt)}
                    className="px-4 py-1.5 text-xs font-semibold rounded-[8px] bg-accent-warm text-white cursor-pointer border-none hover:bg-accent-warm-hover transition-colors"
                  >
                    編集
                  </button>
                )}
              </div>

              {editingName === prompt.name ? (
                <div className="p-5">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={16}
                    className="w-full p-4 text-sm font-mono leading-relaxed border border-border-light rounded-[8px] bg-bg-primary resize-y outline-none focus:border-accent-warm"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={savePrompt}
                      disabled={saving}
                      className="px-5 py-2 text-sm font-semibold rounded-[8px] bg-accent-warm text-white cursor-pointer border-none hover:bg-accent-warm-hover disabled:opacity-50"
                    >
                      {saving ? "保存中..." : "新しいバージョンとして保存"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-5 py-2 text-sm rounded-[8px] border border-border-medium cursor-pointer bg-transparent text-text-secondary hover:border-text-primary"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="p-5 text-sm text-text-secondary whitespace-pre-wrap font-mono leading-relaxed max-h-[300px] overflow-y-auto">
                  {prompt.content}
                </pre>
              )}
            </div>
          ))}

          {/* バージョン履歴 */}
          {historyPrompts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">
                バージョン履歴
              </h2>
              <div className="bg-bg-secondary rounded-[12px] border border-border-light overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-light">
                      <th className="text-left px-4 py-2 text-xs text-text-muted">名前</th>
                      <th className="text-left px-4 py-2 text-xs text-text-muted">バージョン</th>
                      <th className="text-left px-4 py-2 text-xs text-text-muted">更新日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyPrompts.slice(0, 10).map((p) => (
                      <tr key={p.id} className="border-b border-border-light last:border-none">
                        <td className="px-4 py-2">{promptLabel(p.name)}</td>
                        <td className="px-4 py-2 text-text-muted">v{p.version}</td>
                        <td className="px-4 py-2 text-text-muted">
                          {new Date(p.updated_at).toLocaleDateString("ja-JP")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
