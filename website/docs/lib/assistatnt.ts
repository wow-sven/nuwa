import OpenAI from "openai";

const openai = new OpenAI();
const assistantId = process.env.OPENAI_ASSISTANT_ID;

export const createAssistantThread = async () => {
  return await openai.beta.threads.create({});
};

export const sendMessagesToAssistantThread = async (
  threadId: string,
  messages: { role: "user" | "assistant"; content: string }
) => {
  await openai.beta.threads.messages.create(threadId, {
    role: messages.role,
    content: messages.content,
  });
  const currentMessage = await openai.beta.threads.messages.list(threadId);
  console.log(currentMessage.data[0].content);
};

export const runAssistantAndReadResult = async (
  threadId: string,
  updateStatus?: (status: string) => void
) => {
  if (!assistantId) {
    console.log("Error: Assistant ID not set");
    return null;
  }
  let text = "";
  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
  });

  let started = false;
  await new Promise<void>((resolve, reject) => {
    stream
      .on("textDelta", (delta) => {
        if (!started) {
          started = true;
          if (updateStatus) updateStatus("is typing...");
        }
        if (delta.value) text += delta.value;
      })
      .on("end", () => resolve())
      .on("error", (err) => reject(err));
  });

  // markdown 转 Slack mrkdwn
  return text
    .replace(/【\d+:\d+†source】/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "<$2|$1>")
    .replace(/\*\*/g, "*");
};
