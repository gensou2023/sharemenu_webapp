"use client";

import { useState, useEffect } from "react";
import type { ReleaseNote, ReleaseNoteCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<ReleaseNoteCategory, string> = {
  feature: "新機能",
  bugfix: "バグ修正",
  improvement: "改善",
};

const CATEGORY_COLORS: Record<ReleaseNoteCategory, string> = {
  feature: "bg-accent-warm/10 text-accent-warm",
  bugfix: "bg-accent-olive/10 text-accent-olive",
  improvement: "bg-accent-gold/10 text-accent-gold",
};

type FormData = {
  version: string;
  title: string;
  content: string;
  category: ReleaseNoteCategory;
  is_published: boolean;
};

const EMPTY_FORM: FormData = {
  version: "",
  title: "",
  content: "",
  category: "feature",
  is_published: false,
};

export default function AdminReleaseNotesPage() {
  const [notes, setNotes] = useState<ReleaseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchNotes = () => {
    setLoading(true);
    fetch("/api/admin/release-notes")
      .then((r) => r.json())
      .then((data) => setNotes(data.releaseNotes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotes(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (note: ReleaseNote) => {
    setEditingId(note.id);
    setForm({
      version: note.version,
      title: note.title,
      content: note.content,
      category: note.category,
      is_published: note.is_published,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.version.trim() || !form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/release-notes/${editingId}`
        : "/api/admin/release-notes";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        closeForm();
        fetchNotes();
      }
    } catch {
      // エラー無視
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/release-notes/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteId(null);
        fetchNotes();
      }
    } catch {
      // エラー無視
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">リリースノート管理</h1>
        <button
          onClick={openCreate}
          className="px-5 py-2 text-sm font-semibold rounded-[8px] bg-accent-warm text-white cursor-pointer border-none hover:bg-accent-warm-hover transition-colors"
        >
          + 新規作成
        </button>
      </div>

      {/* 作成/編集フォーム */}
      {showForm && (
        <div className="mb-6 bg-bg-secondary rounded-[12px] border border-border-light p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "リリースノートを編集" : "新しいリリースノート"}
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                バージョン
              </label>
              <input
                type="text"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                placeholder="v1.0.0"
                className="w-full px-3 py-2 text-sm border border-border-light rounded-[8px] bg-bg-primary outline-none focus:border-accent-warm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                カテゴリ
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as ReleaseNoteCategory })}
                className="w-full px-3 py-2 text-sm border border-border-light rounded-[8px] bg-bg-primary outline-none focus:border-accent-warm"
              >
                <option value="feature">新機能</option>
                <option value="bugfix">バグ修正</option>
                <option value="improvement">改善</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              タイトル
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="リリースノートのタイトル"
              className="w-full px-3 py-2 text-sm border border-border-light rounded-[8px] bg-bg-primary outline-none focus:border-accent-warm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              内容
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              placeholder="リリースノートの内容を入力..."
              className="w-full px-3 py-2 text-sm border border-border-light rounded-[8px] bg-bg-primary outline-none focus:border-accent-warm resize-y"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-4 h-4 accent-accent-warm cursor-pointer"
              />
              <span className="text-sm text-text-secondary">公開する</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold rounded-[8px] bg-accent-warm text-white cursor-pointer border-none hover:bg-accent-warm-hover disabled:opacity-50"
            >
              {saving ? "保存中..." : editingId ? "更新" : "作成"}
            </button>
            <button
              onClick={closeForm}
              className="px-5 py-2 text-sm rounded-[8px] border border-border-light cursor-pointer bg-transparent text-text-secondary hover:border-text-primary"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 一覧テーブル */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-border-light rounded-[12px] animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">
          リリースノートはまだありません
        </div>
      ) : (
        <div className="bg-bg-secondary rounded-[12px] border border-border-light overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left px-4 py-3 text-xs text-text-muted font-medium">バージョン</th>
                <th className="text-left px-4 py-3 text-xs text-text-muted font-medium">タイトル</th>
                <th className="text-left px-4 py-3 text-xs text-text-muted font-medium">カテゴリ</th>
                <th className="text-left px-4 py-3 text-xs text-text-muted font-medium">ステータス</th>
                <th className="text-left px-4 py-3 text-xs text-text-muted font-medium">日付</th>
                <th className="text-right px-4 py-3 text-xs text-text-muted font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note.id} className="border-b border-border-light last:border-none hover:bg-bg-primary/50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{note.version}</td>
                  <td className="px-4 py-3">{note.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[note.category]}`}>
                      {CATEGORY_LABELS[note.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      note.is_published
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {note.is_published ? "公開" : "下書き"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs">
                    {new Date(note.created_at).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(note)}
                        className="px-3 py-1 text-xs font-medium rounded-[6px] bg-accent-warm/10 text-accent-warm cursor-pointer border-none hover:bg-accent-warm/20 transition-colors"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => setDeleteId(note.id)}
                        className="px-3 py-1 text-xs font-medium rounded-[6px] bg-red-50 text-red-500 cursor-pointer border-none hover:bg-red-100 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-bg-secondary rounded-[12px] p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">削除の確認</h3>
            <p className="text-sm text-text-secondary mb-6">
              このリリースノートを削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm rounded-[8px] border border-border-light cursor-pointer bg-transparent text-text-secondary hover:border-text-primary"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold rounded-[8px] bg-red-500 text-white cursor-pointer border-none hover:bg-red-600"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
