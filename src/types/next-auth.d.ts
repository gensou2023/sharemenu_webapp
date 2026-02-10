// NextAuth.js 型拡張
// auth.ts の as キャストを排除し、型安全にする
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    role: "user" | "admin";
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "user" | "admin";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: "user" | "admin";
  }
}
