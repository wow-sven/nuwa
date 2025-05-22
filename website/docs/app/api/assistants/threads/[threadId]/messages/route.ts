import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI();
const assistantId = process.env.OPENAI_ASSISTANT_ID;

export async function POST(req: NextRequest) {
  if (!assistantId) {
    return NextResponse.json(
      { error: "Assistant ID not set" },
      { status: 500 }
    );
  }

  // Extract threadId from the URL
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const threadId = pathParts[pathParts.indexOf("threads") + 1];

  const { content } = await req.json();

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
  });

  const readable = stream.toReadableStream();

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked",
    },
  });
}
