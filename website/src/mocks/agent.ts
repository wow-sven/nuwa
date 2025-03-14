import { Agent } from '../types/agent'

export const mockAgent: Agent = {
  id: '1',
  address: '0x21a68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37379',
  modelProvider: 'Anthropic',
  username: 'task_helper',
  description: 'An AI agent who helps developers build custom tasks',
  lastActive: new Date().toISOString(),
  characterId: '1',
  name: 'Task Helper',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=1',
  stats: {
    members: 1234,
    price: 10,
    marketCap: 12340
  },
  status: 'online',
  prompt: 'You are an AI assistant who helps developers build custom tasks. You should:\n1. Understand user requirements\n2. Provide detailed technical advice\n3. Help debug and optimize code\n4. Maintain friendly and professional communication'
} 