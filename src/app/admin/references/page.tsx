"use client";

import { useState, useEffect } from "react";

type ReferenceImage = {
  id: string;
  storage_path: string;
  label: string;
  category: string;
  created_at: string;
  publicUrl: string;
};

export default function AdminReferencesPage() {
  const [images, setImages] = useState<ReferenceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("general");

  const fetchImages = () => {
    setLoading(true);
    fetch("/api/admin/references")
      .then((r) => r.json())
      .then((data) => setImages(data.images || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !label.trim()) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/admin/references", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type,
            label: label.trim(),
            category,
          }),
        });
        if (res.ok) {
          setLabel("");
          fetchImages();
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
    // input をリセット
    e.target.value = "";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">参考画像管理</h1>

      {/* アップロードフォーム */}
      <div className="bg-bg-secondary rounded-[12px] border border-border-light p-5 mb-6">
        <h2 className="text-sm font-semibold mb-3">新しい参考画像をアップロード</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-text-muted block mb-1">ラベル *</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="例: 和食メニュー参考"
              className="px-3 py-2 text-sm border border-border-light rounded-[8px] bg-bg-primary outline-none focus:border-accent-warm w-[240px]"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">カテゴリ</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-border-light rounded-[8px] bg-bg-primary outline-none"
            >
              <option value="general">一般</option>
              <option value="japanese">和食</option>
              <option value="western">洋食</option>
              <option value="chinese">中華</option>
              <option value="cafe">カフェ</option>
              <option value="izakaya">居酒屋</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">画像ファイル</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading || !label.trim()}
              className="text-sm disabled:opacity-50"
            />
          </div>
          {uploading && (
            <span className="text-xs text-accent-warm">アップロード中...</span>
          )}
        </div>
      </div>

      {/* 画像一覧 */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-border-light rounded-[12px] animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <div className="text-5xl mb-4">🖼</div>
          <p className="text-sm">まだ参考画像がありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="bg-bg-secondary rounded-[12px] border border-border-light overflow-hidden"
            >
              <div
                className="h-32 bg-cover bg-center"
                style={{ backgroundImage: `url(${img.publicUrl})` }}
              />
              <div className="p-3">
                <div className="text-sm font-medium truncate">{img.label}</div>
                <div className="text-xs text-text-muted flex justify-between mt-1">
                  <span>{img.category}</span>
                  <span>{new Date(img.created_at).toLocaleDateString("ja-JP")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
