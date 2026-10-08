import { NextRequest, NextResponse } from "next/server";
import { server } from "@/lib/server";
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (code) {
    const db = await server();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(
          req.nextUrl.searchParams.get("recover") === "1"
            ? "/?recover=1"
            : "/?verified=1",
          req.url,
        ),
      );
  }
  return NextResponse.redirect(new URL("/?auth_error=1", req.url));
}
