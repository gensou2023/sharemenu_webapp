import type { ReleaseNote, ReleaseNoteCategory } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase";

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

async function getReleaseNotes(): Promise<ReleaseNote[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("release_notes")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (data as ReleaseNote[]) || [];
}

export default async function ReleaseNotesPage() {
  const notes = await getReleaseNotes();

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ヘッダー */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-8">
        <p className="text-xs font-semibold text-accent-warm tracking-widest uppercase mb-2">
          Release Notes
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-3">
          リリースノート
        </h1>
        <p className="text-text-secondary text-sm">
          MenuCraft AI の最新の更新情報をお届けします。
        </p>
      </div>

      {/* カードリスト */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        {notes.length === 0 ? (
          <div className="text-center py-16 text-text-muted text-sm">
            リリースノートはまだありません
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <article
                key={note.id}
                className="bg-bg-secondary rounded-[12px] border border-border-light p-6 relative overflow-hidden transition-all duration-200 hover:shadow-[0_4px_16px_rgba(26,23,20,.06)] hover:-translate-y-0.5"
              >
                {/* アクセントバー */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-warm via-accent-gold to-accent-olive" />

                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bg-dark text-text-inverse">
                    {note.version}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[note.category]}`}>
                    {CATEGORY_LABELS[note.category]}
                  </span>
                  <span className="text-xs text-text-muted ml-auto">
                    {note.published_at
                      ? new Date(note.published_at).toLocaleDateString("ja-JP")
                      : ""}
                  </span>
                </div>

                <h2 className="text-lg font-semibold mb-2">{note.title}</h2>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {note.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
