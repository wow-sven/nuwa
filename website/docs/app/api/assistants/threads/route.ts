import OpenAI from "openai";

const openai = new OpenAI();

// export const runtime = "nodejs";

// Create a new thread
export async function POST(request: Request) {
  try {
    const thread = await openai.beta.threads.create();
    return new Response(JSON.stringify({ threadId: thread.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
