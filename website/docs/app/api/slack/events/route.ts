import type {
  AppMentionEvent,
  AssistantThreadStartedEvent,
  GenericMessageEvent,
  SlackEvent,
} from "@slack/web-api";
import {
  assistantThreadMessage,
  handleNewAssistantMessage,
} from "@/lib/handle-messages";
import { waitUntil } from "@vercel/functions";
import { handleNewAppMention } from "@/lib/handle-app-mention";
import { getBotId, verifyRequest } from "@/lib/slack-utils";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const payload = JSON.parse(rawBody);
  const requestType = payload.type as "url_verification" | "event_callback";

  // See https://api.slack.com/events/url_verification
  if (requestType === "url_verification") {
    return new Response(payload.challenge, { status: 200 });
  }

  await verifyRequest({ requestType, request, rawBody });

  try {
    const botUserId = await getBotId();

    const event = payload.event as SlackEvent;

    if (event.type === "app_mention") {
      const appMentionEvent = event as AppMentionEvent;
      waitUntil(handleNewAppMention(appMentionEvent, botUserId));
    }

    if (event.type === "assistant_thread_started") {
      const assistantThreadStartedEvent = event as AssistantThreadStartedEvent;
      waitUntil(assistantThreadMessage(assistantThreadStartedEvent));
    }

    if (event.type === "message") {
      const genericMessageEvent = event as GenericMessageEvent;
      if (
        !genericMessageEvent.subtype &&
        genericMessageEvent.channel_type === "im" &&
        !genericMessageEvent.bot_id &&
        !genericMessageEvent.bot_profile &&
        genericMessageEvent.bot_id !== botUserId
      ) {
        waitUntil(handleNewAssistantMessage(genericMessageEvent, botUserId));
      }
    }

    return new Response("Success!", { status: 200 });
  } catch (error) {
    console.error("Error generating response", error);
    return new Response("Error generating response", { status: 500 });
  }
}
