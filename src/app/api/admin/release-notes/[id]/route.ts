import { NextRequest, NextResponse } from "next/server";
import { withAdmin, type RouteContext } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase";
import { Session } from "next-auth";

// リリースノート更新
export const PATCH = withAdmin(async (req: NextRequest, _session: Session, context: RouteContext) => {
  const { id } = await context.params;
  const supabase = createAdminClient();
  const body = await req.json();
  const { version, title, content, category, is_published } = body;

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (version !== undefined) updateData.version = version;
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (category !== undefined) updateData.category = category;
  if (is_published !== undefined) {
    updateData.is_published = is_published;
    if (is_published) {
      updateData.published_at = new Date().toISOString();
    } else {
      updateData.published_at = null;
    }
  }

  const { data, error } = await supabase
    .from("release_notes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ releaseNote: data });
});

// リリースノート削除
export const DELETE = withAdmin(async (req: NextRequest, _session: Session, context: RouteContext) => {
  const { id } = await context.params;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("release_notes")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "削除しました" });
});
