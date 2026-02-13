import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  await supabase.auth.exchangeCodeForSession(
    requestUrl.searchParams.get("code")!,
  );

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
