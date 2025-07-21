// types/next-auth.d.ts

declare module "next-auth" {
  interface Session {
    backendToken?: string;
  }

  interface User {
    token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
  }
}
