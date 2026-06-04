import type { Role } from "@/lib/permissions";

declare module "next-auth" {
  interface User {
    role?: Role;
    departmentId?: string;
  }

  interface Session {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: Role;
      departmentId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    departmentId?: string;
  }
}
