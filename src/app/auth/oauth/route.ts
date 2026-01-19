import { NextResponse } from "next/server";
import { oauthSignInAction } from "@/app/auth/actions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider");

  if (provider !== "google") {
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=Invalid%20provider", req.url)
    );
  }

  await oauthSignInAction("google");
}
