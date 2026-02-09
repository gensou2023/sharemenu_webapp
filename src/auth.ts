import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createAdminClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";

// デモ用フォールバック（Supabase未接続時）
const DEMO_USERS = [
  {
    id: "1",
    email: "demo@menucraft.jp",
    password: "demo1234",
    name: "田中オーナー",
    role: "user" as const,
  },
  {
    id: "2",
    email: "admin@menucraft.jp",
    password: "admin1234",
    name: "管理者",
    role: "admin" as const,
  },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) return null;

        // Supabase接続を試みる
        try {
          const supabase = createAdminClient();
          const { data: user, error } = await supabase
            .from("users")
            .select("id, email, name, role, password_hash")
            .eq("email", email)
            .single();

          if (!error && user) {
            // bcryptハッシュの場合
            if (user.password_hash.startsWith("$2")) {
              const valid = await bcrypt.compare(password, user.password_hash);
              if (!valid) return null;
            } else {
              // シードデータ（プレーンテキスト）の場合 → 初回ログイン時にハッシュ化
              if (user.password_hash !== password) return null;
              const hash = await bcrypt.hash(password, 10);
              await supabase
                .from("users")
                .update({ password_hash: hash })
                .eq("id", user.id);
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        } catch {
          // Supabase未接続の場合はフォールバック
        }

        // フォールバック: デモユーザーで検証
        const demoUser = DEMO_USERS.find(
          (u) => u.email === email && u.password === password
        );
        if (!demoUser) return null;

        return {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ["/dashboard", "/chat"];
      const isProtected = protectedPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );

      // 管理画面はadminロールのみ
      if (nextUrl.pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/login", nextUrl));
        }
        const role = (auth?.user as { role?: string })?.role;
        if (role !== "admin") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      const authPaths = ["/login", "/signup"];
      const isAuthPage = authPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
});
