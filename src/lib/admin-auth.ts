import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Session } from "next-auth";

export type RouteContext = { params: Promise<Record<string, string>> };

type AdminHandler = (
  req: NextRequest,
  session: Session
) => Promise<NextResponse>;

type AdminHandlerWithContext = (
  req: NextRequest,
  session: Session,
  context: RouteContext
) => Promise<NextResponse>;

export function withAdmin(handler: AdminHandler): (req: NextRequest) => Promise<NextResponse>;
export function withAdmin(handler: AdminHandlerWithContext): (req: NextRequest, context: RouteContext) => Promise<NextResponse>;
export function withAdmin(handler: AdminHandler | AdminHandlerWithContext) {
  return async (req: NextRequest, context?: RouteContext) => {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }
    if (context) {
      return (handler as AdminHandlerWithContext)(req, session, context);
    }
    return (handler as AdminHandler)(req, session);
  };
}
