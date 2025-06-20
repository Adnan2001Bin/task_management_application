import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      name?: string;
    } & DefaultSession["user"];
  }

  interface User {
    _id?: string;
    isVerified?: boolean;
    name?: string;
  }

  interface JWT {
    _id?: string;
    isVerified?: boolean;
    name?: string;
  }
 
}
