import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Session } from "next-auth";

type RouteContext = { params: Promise<Record<string, string>> };

type AdminHandler = (
  req: NextRequest,
  session: Session,
  context: RouteContext
) => Promise<NextResponse>;

export function withAdmin(handler: AdminHandler) {
  return async (req: NextRequest, context: RouteContext) => {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }
    return handler(req, session, context);
  };
}
