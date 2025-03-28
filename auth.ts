import NextAuth from "next-auth";
import "next-auth/jwt";

// import Apple from "next-auth/providers/apple"
// import Auth0 from "next-auth/providers/auth0"
// import AzureB2C from "next-auth/providers/azure-ad-b2c"
// import BoxyHQSAML from "next-auth/providers/boxyhq-saml"
// import Cognito from "next-auth/providers/cognito"
// import Coinbase from "next-auth/providers/coinbase"
// import Discord from "next-auth/providers/discord"
// import Dropbox from "next-auth/providers/dropbox"
// import Facebook from "next-auth/providers/facebook"
// import GitHub from "next-auth/providers/github"
// import GitLab from "next-auth/providers/gitlab"
import Google from "next-auth/providers/google";
// import Hubspot from "next-auth/providers/hubspot"
// import Keycloak from "next-auth/providers/keycloak"
// import LinkedIn from "next-auth/providers/linkedin"
// import Netlify from "next-auth/providers/netlify"
// import Okta from "next-auth/providers/okta"
// import Passage from "next-auth/providers/passage"
// import Passkey from "next-auth/providers/passkey"
// import Pinterest from "next-auth/providers/pinterest"
// import Reddit from "next-auth/providers/reddit"
// import Slack from "next-auth/providers/slack"
// import Spotify from "next-auth/providers/spotify"
// import Twitch from "next-auth/providers/twitch"
// import Twitter from "next-auth/providers/twitter"
// import WorkOS from "next-auth/providers/workos"
// import Zoom from "next-auth/providers/zoom"
import type { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./lib/db";
import CredentialsProvider from "next-auth/providers/credentials";
import AllowedUser from "./lib/models/AllowedUsers";

const config = {
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  //   adapter: UnstorageAdapter(storage),
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    // Resend({ from: "onboarding@resend.dev" }),
    Google,
    // CredentialsProvider({
    //   // The name to display on the sign in form (e.g. "Sign in with...")
    //   name: "Credentials",
    //   // `credentials` is used to generate a form on the sign in page.
    //   // You can specify which fields should be submitted, by adding keys to the `credentials` object.
    //   // e.g. domain, username, password, 2FA token, etc.
    //   // You can pass any HTML attribute to the <input> tag through the object.
    //   credentials: {
    //     username: { label: "Username", type: "text", placeholder: "jsmith" },
    //     password: { label: "Password", type: "password" },
    //   },
    //   async authorize(credentials, req) {
    //     // console.log("credentials =>", credentials);
    //     let isAuthorized = true;
    //     // Add logic here to look up the user from the credentials supplied

    //     // if (credentials.password === "admin" && credentials.username === "admin") isAuthorized = true;
    //     const user = { id: "1", name: "admin", email: "admin@admin.com" };
    //     // console.log("isAuthorized =>", isAuthorized);
    //     if (isAuthorized) {
    //       // Any object returned will be saved in `user` property of the JWT
    //       return user;
    //     } else {
    //       // If you return null then an error will be displayed advising the user to check their details.
    //       return null;

    //       // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
    //     }
    //   },
    // }),
  ],
  basePath: "/auth",
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("user =>", user.email);
      let isAllowedToSignIn = true;
      const dbUser = await AllowedUser.findOne({ email: user.email }).lean();
      // @ts-ignore
      // const isAllowedToSignIn = credentials.username === "admin" && credentials.password === "admin";
      isAllowedToSignIn = !!dbUser;
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },

    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (pathname === "/middleware-example") return !!auth;
      if (pathname === "/auth-example/protected-page") return !!auth;
      return true;
    },
    jwt({ token, trigger, session, account }) {
      if (trigger === "update") token.name = session.user.name;
      if (account?.provider === "keycloak") {
        return { ...token, accessToken: account.access_token };
      }
      return token;
    },
    async session({ session, token }) {
      let isAllowedToSignIn = true;
      // const dbUser = await AllowedUser.findOne({ email: session.user.email }).lean();
      // console.log("dbUser =>", dbUser);
      // isAllowedToSignIn = !!dbUser;

      // isAllowedToSignIn = session.user.email === "saqlainprinters@gmail.com";
      if (!isAllowedToSignIn) throw new Error("Unauthorized!");

      if (token?.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  experimental: {
    enableWebAuthn: false,
  },
  debug: process.env.NODE_ENV !== "production" ? true : false,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
