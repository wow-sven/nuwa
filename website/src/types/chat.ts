export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  content: string
  sender: string
  timestamp: string
  type: 'text' | 'image' | 'file'
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