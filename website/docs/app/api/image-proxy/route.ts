// app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST_PATTERNS = [
  "secure.notion-static.com",
  ".s3.us-west-2.amazonaws.com",
  ".amazonaws.com",
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const token = searchParams.get("token");

  // 校验 token
  if (token !== process.env.IMAGE_PROXY_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 校验 url 安全
  const parsed = new URL(url);
  const hostname = parsed.hostname;

  const isAllowed = ALLOWED_HOST_PATTERNS.some(
    (pattern) => hostname === pattern || hostname.endsWith(pattern)
  );

  if (!isAllowed) {
    return new NextResponse("Blocked host", { status: 403 });
  }

  // 代理请求
  try {
    const imageRes = await fetch(url);
    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const buffer = await imageRes.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "s-maxage=86400, stale-while-revalidate",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}
