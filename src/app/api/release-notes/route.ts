import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// 公開済みリリースノート一覧（認証不要）
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("release_notes")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ releaseNotes: data });
}
