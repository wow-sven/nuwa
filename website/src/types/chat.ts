export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: string
}

export interface Topic {
  id: string
  title: string
  createdAt: string
  lastMessageAt: string
  messageCount: number
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