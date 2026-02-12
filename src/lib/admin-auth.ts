import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Session } from "next-auth";

type AdminHandler = (
  req: NextRequest,
  session: Session
) => Promise<NextResponse>;

type AdminHandlerNoReq = (session: Session) => Promise<NextResponse>;

export function withAdmin(handler: AdminHandler | AdminHandlerNoReq) {
  return async (req: NextRequest) => {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }
    return (handler as AdminHandler)(req, session);
  };
}
