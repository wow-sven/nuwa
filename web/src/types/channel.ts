import { bcs } from '@roochnetwork/rooch-sdk';

export enum CHANNEL_STATUS {
  ACTIVE = 0,
  INACTIVE = 1,
}

export interface Channel {
  id: string;
  title: string;
  creator: string;
  status: CHANNEL_STATUS;
  created_at: string;
  message_counter: string;
  channel_type: number;
  last_active: string;
}

export interface Message {
  id: string;  // Changed from u64 to string for consistency
  sender: string;
  channel_id: string;
  content: string;
  timestamp: string;
  message_type: number;
}

// Define BCS MessageSchema for deserialization that matches the Move type
export const MessageSchema = bcs.struct('Message', {
  id: bcs.u64(),             // ID is a u64 in Move
  channel_id: bcs.ObjectId,  // Object ID as string
  sender: bcs.Address,      // Address as string
  content: bcs.string(),     // Message content
  timestamp: bcs.u64(),   // Timestamp as string
  message_type: bcs.u8(),    // Message type as u8
  mentions: bcs.vector(bcs.Address), // Vector of addresses
});

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

// Channel constants matching the Move code
export const CHANNEL_TYPE = {
  AI_HOME: 0, // AI's home channel, always public
  AI_PEER: 1, // 1:1 AI-User channel, always private
} as const;
