import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt, { decodeBase64 } from "bcryptjs";
import UserModel from "@/models/user.model";
import connectDB from "@/lib/connectDB";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await connectDB();

        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { name: credentials.identifier },
            ],
          });

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account before logging in");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Incorrect password");
          }
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString;
        token.isVerified = user.isVerified;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.name = token.name;
      }
      return session
    }
  },

  session: {
    strategy: "jwt",
  },


  pages: {
    signIn: "/sign-in",
  },

  secret: process.env.NEXTAUTH_SECRET,

};
