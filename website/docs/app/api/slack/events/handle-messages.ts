import type {
  AssistantThreadStartedEvent,
  GenericMessageEvent,
} from "@slack/web-api";
import { client, updateStatusUtil } from "./slack-utils";
import {
  createAssistantThread,
  sendMessagesToAssistantThread,
  runAssistantAndReadResult,
} from "./assistatnt";
import { getThreadMap, setThreadMap } from "./thread-map-store";

export async function assistantThreadMessage(
  event: AssistantThreadStartedEvent
) {
  const { channel_id, thread_ts } = event.assistant_thread;
  console.log(`Thread started: ${channel_id} ${thread_ts}`);
  console.log(JSON.stringify(event));

  // 创建 assistant thread，并保存映射
  const assistantThread = await createAssistantThread();
  setThreadMap(thread_ts, assistantThread.id);

  await client.chat.postMessage({
    channel: channel_id,
    thread_ts: thread_ts,
    text: "Hello, I'm Nuwa Guide, your assistant for Nuwa project!",
  });

  await client.assistant.threads.setSuggestedPrompts({
    channel_id: channel_id,
    thread_ts: thread_ts,
    prompts: [
      {
        title: "What is Nuwa?",
        message: "What is Nuwa?",
      },
    ],
  });
}

export async function handleNewAssistantMessage(
  event: GenericMessageEvent,
  botUserId: string
) {
  if (
    event.bot_id ||
    event.bot_id === botUserId ||
    event.bot_profile ||
    !event.thread_ts
  )
    return;

  const { thread_ts, channel, text } = event;

  const updateStatus = updateStatusUtil(channel, thread_ts);
  await updateStatus("is thinking...");

  // 查找 assistant threadId
  let assistantThreadId = getThreadMap(thread_ts);
  if (!assistantThreadId) {
    // 没有找到则新建
    const assistantThread = await createAssistantThread();
    assistantThreadId = assistantThread.id;
    setThreadMap(thread_ts, assistantThreadId);
  }

  // 只发送本次新消息到 assistant thread
  await sendMessagesToAssistantThread(assistantThreadId, {
    role: "user",
    content: text,
  });
  const result = await runAssistantAndReadResult(
    assistantThreadId,
    updateStatus
  );

  await client.chat.postMessage({
    channel: channel,
    thread_ts: thread_ts,
    text: result,
    unfurl_links: false,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: result,
        },
      },
    ],
  });

  await updateStatus("");
}
