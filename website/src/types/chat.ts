export type MessageRole = 'user' | 'assistant'

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

export interface Topic {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  unread: number
}

export interface ChatMember {
  id: string
  name: string
  avatar: string
  role: 'admin' | 'moderator' | 'member'
  status: 'online' | 'offline'
}

export interface ChatProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isLoading?: boolean
  onTopicClick?: (topicId: string) => void
}

export interface MessageProps {
  message: Message
  onTopicClick?: (topicId: string) => void
} 