import { bcs} from '@roochnetwork/rooch-sdk'

export interface Channel {
  id: string;
  title: string;
  creator: string;
  created_at: number;
  last_active: number;
  status: number;
  channel_type: number;
  message_counter: number;
  last_message?: Message;
}

export interface Message {
  id: string;
  channel_id: string;
  sender: string;
  content: string;
  timestamp: number;
  message_type: number; // 0 for user, 1 for AI
  mentions: string[]; // Changed from HexString[] to string[]
}

export const MessageSchema = bcs.struct('Message', {
  id: bcs.u64(),
  channel_id: bcs.String,
  sender: bcs.Address,
  content: bcs.string(),
  timestamp: bcs.u64(),
  message_type: bcs.u8(),
  mentions: bcs.vector(bcs.Address),
})

export const ChannelSchema = bcs.struct('Channel', {
  id: bcs.String,
  title: bcs.String,
  creator: bcs.Address,
  created_at: bcs.U64,
  last_active: bcs.U64,
  status: bcs.U8,
  channel_type: bcs.U8,
  message_counter: bcs.U64,
});

// Channel constants matching the Move code
export const CHANNEL_STATUS = {
  ACTIVE: 0,
  CLOSED: 1,
  BANNED: 2
} as const;

export const CHANNEL_TYPE = {
  AI_HOME: 0, // AI's home channel, always public
  AI_PEER: 1, // 1:1 AI-User channel, always private
} as const;
