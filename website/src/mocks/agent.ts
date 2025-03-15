import { Agent, AgentName } from '../types/agent'

export const mockAgentNames: AgentName[] = [
  {
    agentname: 'greatAgent',
    registeredAt: new Date().toISOString()
  },
  {
    agentname: 'GOATAgent',
    registeredAt: new Date().toISOString()
  }
]

export const mockAgents: Agent[] = [
  {
    address: '0x21a68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37379',
    agent_address: '0x21a68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37379',
    modelProvider: 'Anthropic',
    agentname: 'task_helper',
    name: 'Task Helper',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=task_helper',
    description: 'An AI agent who helps developers build custom tasks',
    lastActive: new Date().toISOString(),
    stats: {
      members: 1234,
      price: 10,
      marketCap: 12340
    },
    status: 'online',
    category: 'code',
    prompt: 'You are an AI assistant who helps developers build custom tasks. You should:\n1. Understand user requirements\n2. Provide detailed technical advice\n3. Help debug and optimize code\n4. Maintain friendly and professional communication'
  },
  {
    address: '0x3fa68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37456',
    agent_address: '0x3fa68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37456',
    modelProvider: 'Anthropic',
    agentname: 'game_npc',
    name: 'Game NPC Beta',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=game_npc',
    description: 'A game NPC being tested in sandbox',
    lastActive: new Date().toISOString(),
    stats: {
      members: 567,
      price: 5,
      marketCap: 2835
    },
    status: 'online',
    category: 'chat',
    prompt: 'You are a friendly game NPC.'
  }
] 