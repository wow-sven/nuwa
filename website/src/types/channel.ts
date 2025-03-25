import { bcs } from '@roochnetwork/rooch-sdk';

export interface Attachment {
  attachment_type: number;
  attachment_json: string;
}

export interface Message {
  index: number;
  channel_id: string;
  sender: string;
  content: string;
  timestamp: number;
  message_type: number;
  mentions: string[];
  reply_to: number;
  attachments: Attachment[];
}

export interface MessageSendParams {
  channelId: string;
  content: string;
  mentions: string[];
  replyTo?: number;
}

export interface Channel {
  parent_channel: string | null;
  title: string;
  creator: string;
  members: Record<string, {
    address: string;
    joined_at: number;
    last_active: number;
  }>;
  messages: Record<number, string>;
  topics: Record<string, string>;
  message_counter: number;
  created_at: number;
  last_active: number;
  status: number;
  channel_type: number;
}

export const CHANNEL_STATUS = {
  ACTIVE: 0,
  CLOSED: 1,
  BANNED: 2,
} as const;

export const CHANNEL_TYPE = {
  AI_HOME: 0,
  AI_PEER: 1,
  TOPIC: 2,
} as const;

export const MESSAGE_TYPE = {
  NORMAL: 0,
  ACTION_EVENT: 1,
  SYSTEM_EVENT: 2,
} as const;

export const ChannelSchema = bcs.struct('Channel', {
  id: bcs.string(),
  title: bcs.string(),
  creator: bcs.string(),
  created_at: bcs.string(),
  last_active: bcs.string(),
  status: bcs.u8(),
  channel_type: bcs.u8(),
  message_counter: bcs.string(),
});
