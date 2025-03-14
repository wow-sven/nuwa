export type AICategory = 'featured' | 'all' | 'chat' | 'image' | 'video' | 'audio' | 'code'

export interface AICharacter {
  name: string
  agentname: string
  avatar: string
  category: AICategory
  followers: number
  walletAddress: string
  description: string
}

export const categories: AICategory[] = [
  'featured',
  'all',
  'chat',
  'image',
  'video',
  'audio',
  'code'
]

export const categoryLabels: Record<AICategory, string> = {
  featured: 'Featured',
  all: 'All',
  chat: 'Chat',
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  code: 'Code'
} 