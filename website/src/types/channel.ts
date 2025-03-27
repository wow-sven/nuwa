import { bcs } from '@roochnetwork/rooch-sdk';

export interface Member {
  /** Member's wallet address */
  address: string;
  /** Member's avatar URL */
  avatar: string;
  /** Member's name */
  name?: string;
  /** Member's username */
  username?: string;
  /** Whether this member is the current agent */
  isAgent?: boolean;
}

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
  parentChannel: string | null;
  title: string;
  creator: string;
  membersTable: string;
  // topicsTable: string;
  messageTable: string;
  message_counter: number;
  joinPolicy: number;
  createdAt: number;
  lastActive: number;
  status: number;
}

export const CHANNEL_STATUS = {
  ACTIVE: 0,
  CLOSED: 1,
  BANNED: 2,
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
