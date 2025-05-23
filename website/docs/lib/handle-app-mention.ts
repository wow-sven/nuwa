import { AppMentionEvent } from "@slack/web-api";
import { client } from "./slack-utils";
import {
  createAssistantThread,
  sendMessagesToAssistantThread,
  runAssistantAndReadResult,
} from "./assistatnt";

// 新增：Slack thread_ts <-> Assistant threadId 的映射
const slackToAssistantThreadMap = new Map<string, string>();

const updateStatusUtil = async (
  initialStatus: string,
  event: AppMentionEvent
) => {
  const initialMessage = await client.chat.postMessage({
    channel: event.channel,
    thread_ts: event.thread_ts ?? event.ts,
    text: initialStatus,
  });

  if (!initialMessage || !initialMessage.ts)
    throw new Error("Failed to post initial message");

  const updateMessage = async (status: string) => {
    await client.chat.update({
      channel: event.channel,
      ts: initialMessage.ts as string,
      text: status,
    });
  };
  return updateMessage;
};

export async function handleNewAppMention(
  event: AppMentionEvent,
  botUserId: string
) {
  console.log("Handling app mention");
  if (event.bot_id || event.bot_id === botUserId || event.bot_profile) {
    console.log("Skipping app mention");
    return;
  }

  const { thread_ts, channel, text } = event;
  const updateMessage = await updateStatusUtil("is thinking...", event);

  // 只处理有 thread_ts 的情况（无 thread_ts 视为新 thread，自动创建）
  const threadKey = thread_ts ?? event.ts;
  let assistantThreadId = slackToAssistantThreadMap.get(threadKey);
  if (!assistantThreadId) {
    const assistantThread = await createAssistantThread();
    assistantThreadId = assistantThread.id;
    slackToAssistantThreadMap.set(threadKey, assistantThreadId);
  }

  await sendMessagesToAssistantThread(assistantThreadId, {
    role: "user",
    content: text,
  });
  const result = await runAssistantAndReadResult(
    assistantThreadId,
    updateMessage
  );
  await updateMessage(result);
}
