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
};

const CONTENT_TEMPLATES: Record<string, { label: string; content: string }> = {
  feature: {
    label: "新機能",
    content: `【新機能】\n〇〇の機能が追加されました。\n\n■ 概要\n-\n\n■ 使い方\n1.\n2.\n3.`,
  },
  bugfix: {
    label: "バグ修正",
    content: `【バグ修正】\n以下の不具合を修正しました。\n\n■ 修正内容\n-\n\n■ 影響範囲\n-`,
  },
  announcement: {
    label: "お知らせ",
    content: `【お知らせ】\n\n■ 内容\n-\n\n■ 詳細\n`,
  },
};

const EMPTY_FORM: FormData = {
  version: "",
  title: "",
  content: "",
  category: "feature",
};

export default function AdminReleaseNotesPage() {
  const [notes, setNotes] = useState<ReleaseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewNote, setPreviewNote] = useState<FormData | null>(null);

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
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async (publish: boolean) => {
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
        body: JSON.stringify({ ...form, is_published: publish }),
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                バージョン
              </label>
              <p className="text-[11px] text-text-muted mb-1.5">セマンティックバージョニング形式（例: v1.0.0 → v1.2.3）</p>
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
                <option value="feature">新機能 — 新しい機能の追加</option>
                <option value="bugfix">バグ修正 — 不具合の修正</option>
                <option value="improvement">改善 — パフォーマンス向上やUI改善</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              タイトル
            </label>
            <p className="text-[11px] text-text-muted mb-1.5">ユーザーに伝わる簡潔な見出し（例: メニュー画像の一括ダウンロード機能を追加）</p>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="リリースノートのタイトル"
              className="w-full px-3 py-2 text-sm border border-border-light rounded-[8px] bg-bg-primary outline-none focus:border-accent-warm"
            />
          </div>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <label className="block text-xs font-medium text-text-secondary">
                内容
              </label>
              <div className="flex gap-1.5">
                {Object.entries(CONTENT_TEMPLATES).map(([key, tmpl]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, content: tmpl.content })}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-[4px] border border-border-light cursor-pointer bg-transparent text-text-secondary hover:border-accent-warm hover:text-accent-warm transition-colors"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              placeholder="リリースノートの内容を入力..."
              className="w-full px-3 py-2 text-sm border border-border-light rounded-[8px] bg-bg-primary outline-none focus:border-accent-warm resize-y"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewNote({ ...form })}
              disabled={!form.version.trim() || !form.title.trim() || !form.content.trim()}
              className="px-5 py-2 text-sm font-semibold rounded-[8px] border border-border-light cursor-pointer bg-transparent text-text-primary hover:border-text-primary disabled:opacity-50 transition-colors"
            >
              プレビュー
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold rounded-[8px] border border-accent-warm cursor-pointer bg-transparent text-accent-warm hover:bg-accent-warm/10 disabled:opacity-50 transition-colors"
            >
              {saving ? "保存中..." : "下書き保存"}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold rounded-[8px] bg-accent-warm text-white cursor-pointer border-none hover:bg-accent-warm-hover disabled:opacity-50 transition-colors"
            >
              {saving ? "保存中..." : "公開する"}
            </button>
            <button
              onClick={closeForm}
              className="px-5 py-2 text-sm rounded-[8px] border border-border-light cursor-pointer bg-transparent text-text-secondary hover:border-text-primary transition-colors"
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
        <div className="bg-bg-secondary rounded-[12px] border border-border-light overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left px-4 py-3 text-xs text-text-muted font-medium">バージョン</th>
                <th className="text-left px-4 py-3 text-xs text-text-muted font-medium">タイトル</th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs text-text-muted font-medium">カテゴリ</th>
                <th className="text-left px-4 py-3 text-xs text-text-muted font-medium">ステータス</th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs text-text-muted font-medium">日付</th>
                <th className="text-right px-4 py-3 text-xs text-text-muted font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note.id} className="border-b border-border-light last:border-none hover:bg-bg-primary/50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{note.version}</td>
                  <td className="px-4 py-3">{note.title}</td>
                  <td className="hidden md:table-cell px-4 py-3">
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
                  <td className="hidden md:table-cell px-4 py-3 text-text-muted text-xs">
                    {new Date(note.created_at).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPreviewNote({
                          version: note.version,
                          title: note.title,
                          content: note.content,
                          category: note.category,
                        })}
                        className="px-3 py-1 text-xs font-medium rounded-[6px] border border-border-light cursor-pointer bg-transparent text-text-secondary hover:border-text-primary transition-colors"
                      >
                        プレビュー
                      </button>
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

      {/* プレビューモーダル */}
      {previewNote && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-bg-primary rounded-[12px] max-w-2xl w-full mx-4 shadow-xl overflow-hidden">
            <article className="bg-bg-secondary rounded-[12px] border border-border-light p-6 relative overflow-hidden m-6 mb-0">
              {/* アクセントバー */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-warm via-accent-gold to-accent-olive" />

              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bg-dark text-text-inverse">
                  {previewNote.version}
                </span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[previewNote.category]}`}>
                  {CATEGORY_LABELS[previewNote.category]}
                </span>
                <span className="text-xs text-text-muted ml-auto">
                  {new Date().toLocaleDateString("ja-JP")}
                </span>
              </div>

              <h2 className="text-lg font-semibold mb-2">{previewNote.title}</h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {previewNote.content}
              </p>
            </article>
            <div className="flex justify-end p-6">
              <button
                onClick={() => setPreviewNote(null)}
                className="px-5 py-2 text-sm rounded-[8px] border border-border-light cursor-pointer bg-transparent text-text-secondary hover:border-text-primary transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
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
