import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { hasDatabase, query } from "./db";
import type { Role } from "./permissions";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        if (!hasDatabase) {
          if (parsed.data.email === "admin@demo.com" && parsed.data.password === "password") {
            return { id: "demo-admin", email: "admin@demo.com", name: "Admin Demo", role: "Admin" };
          }

          return null;
        }

        const result = await query<{
          id: string;
          email: string;
          name: string;
          role: Role;
          password_hash: string | null;
          department_id: string | null;
        }>("SELECT id, email, name, role, password_hash, department_id FROM users WHERE email = $1", [parsed.data.email]);
        const user = result.rows[0];

        if (!user?.password_hash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.password_hash);
        if (!valid) return null;

        await query("UPDATE users SET last_login_at = now() WHERE id = $1", [user.id]);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          departmentId: user.department_id ?? undefined
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: Role }).role;
        token.departmentId = (user as { departmentId?: string }).departmentId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as Role;
        session.user.departmentId = token.departmentId as string | undefined;
      }
      return session;
    }
  }
};
