import OpenAI from "openai";

const openai = new OpenAI();
const assistantId = process.env.OPENAI_ASSISTANT_ID;

export async function POST(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  if (!assistantId) {
    return new Response(JSON.stringify({ error: "Assistant ID not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const threadId = params.threadId;
  const { content } = await req.json();

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
  });

  const readable = stream.toReadableStream();

  return new Response(readable, {
    headers: {
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked",
    },
  });
}
