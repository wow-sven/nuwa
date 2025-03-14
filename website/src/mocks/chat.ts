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
  balance: number
}

export const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! I am Nuwa AI Assistant, nice to meet you.',
    sender: 'Nuwa AI',
    timestamp: '2024-03-20T10:00:00Z',
    type: 'text'
  },
  {
    id: '2',
    content: 'How can I help you today?',
    sender: 'Nuwa AI',
    timestamp: '2024-03-20T10:01:00Z',
    type: 'text'
  }
]

export const mockTopics: Topic[] = [
  {
    id: '1',
    title: 'Nuwa AI Assistant',
    lastMessage: 'Hello! I am Nuwa AI Assistant, nice to meet you.',
    timestamp: '2024-03-20T10:00:00Z',
    unread: 0
  },
  {
    id: '2',
    title: 'Technical Support',
    lastMessage: 'How can I help you today?',
    timestamp: '2024-03-20T10:01:00Z',
    unread: 2
  }
]

export const mockMembers: ChatMember[] = [
  {
    id: '1',
    name: 'Nuwa AI',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=nuwa',
    balance: 1000
  },
  {
    id: '2',
    name: 'Alice',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    balance: 500
  },
  {
    id: '3',
    name: 'Bob',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    balance: 200
  },
  {
    id: '4',
    name: 'Charlie',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    balance: 100
  }
] 