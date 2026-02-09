import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// デモ用のユーザーデータ（本番ではDB連携に置き換え）
const DEMO_USERS = [
  {
    id: "1",
    email: "demo@menucraft.jp",
    password: "demo1234",
    name: "田中オーナー",
    shopName: "さくらカフェ",
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

        // デモ用：ハードコードされたユーザーで検証
        // 本番ではDBからユーザーを取得し、bcryptでパスワード検証
        const user = DEMO_USERS.find(
          (u) => u.email === email && u.password === password
        );

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ["/dashboard", "/chat"];
      const isProtected = protectedPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );

      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      // ログイン済みでログイン/サインアップページにアクセスした場合
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
