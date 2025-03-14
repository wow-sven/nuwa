import { AICharacter } from '../types/ai'

export const mockAICharacters: AICharacter[] = [
  {
    name: 'Claude',
    agentname: 'claude',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Claude',
    category: 'featured',
    followers: 12345,
    walletAddress: '0x21a68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37379',
    description: 'Anthropic\'s helpful AI assistant with advanced reasoning capabilities'
  }
]

export interface AI {
  name: string
  agentname: string
  avatar: string
  description: string
  type: string
  prompt: string
}

export const Characters: AI[] = [
  {
    name: 'New Assistant',
    agentname: 'claude',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=draft1',
    description: 'A new AI assistant in development',
    type: 'AI Assistant',
    prompt: 'You are a helpful AI assistant in development.'
  },
]

export const agents: AI[] = [
  {
    name: 'Test Assistant',
    agentname: 'claude',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sandbox1',
    description: 'A test AI assistant in sandbox environment',
    type: 'AI Assistant',
    prompt: 'You are a helpful AI assistant.'
  },
  {
    name: 'Game NPC Beta',
    agentname: 'claude',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sandbox2',
    description: 'A game NPC being tested in sandbox',
    type: 'Game NPC',
    prompt: 'You are a friendly game NPC.'
  }
]
