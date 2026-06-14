import { NextRequest, NextResponse } from "next/server";
import { handleOAuthCallback } from "@/lib/google-drive";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return new NextResponse("Google OAuth callback is missing code/state.", { status: 400 });
  }

  await handleOAuthCallback(code, state);
  return NextResponse.redirect(new URL("/admin/drive-accounts", request.url));
}
