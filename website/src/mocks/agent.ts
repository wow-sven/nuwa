import { Agent } from '../types/agent'

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
    isFeatured: true,
    isTrending: true,
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
    isFeatured: true,
    prompt: 'You are a friendly game NPC.'
  },
  {
    address: '0x4ba68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37789',
    agent_address: '0x4ba68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37789',
    modelProvider: 'Anthropic',
    agentname: 'code_reviewer',
    name: 'Code Review Pro',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=code_reviewer',
    description: 'Expert code reviewer focusing on best practices and security',
    lastActive: new Date().toISOString(),
    stats: {
      members: 892,
      price: 15,
      marketCap: 13380
    },
    status: 'online',
    isFeatured: true,
    isTrending: true,
    prompt: 'You are an expert code reviewer focusing on code quality, security, and performance.'
  },
  {
    address: '0x5ca68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37123',
    agent_address: '0x5ca68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37123',
    modelProvider: 'Anthropic',
    agentname: 'data_scientist',
    name: 'Data Science Wizard',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=data_scientist',
    description: 'AI specialist in data analysis and machine learning',
    lastActive: new Date().toISOString(),
    stats: {
      members: 756,
      price: 20,
      marketCap: 15120
    },
    status: 'online',
    isFeatured: false,
    isTrending: true,
    prompt: 'You are a data science expert specializing in analysis, visualization, and ML models.'
  },
  {
    address: '0x6da68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37321',
    agent_address: '0x6da68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37321',
    modelProvider: 'Anthropic',
    agentname: 'ui_designer',
    name: 'UI/UX Expert',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ui_designer',
    description: 'Creative UI/UX designer with modern design principles',
    lastActive: new Date().toISOString(),
    stats: {
      members: 645,
      price: 12,
      marketCap: 7740
    },
    status: 'online',
    isFeatured: true,
    prompt: 'You are a UI/UX designer focused on creating beautiful and functional interfaces.'
  },
  {
    address: '0x7ea68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37654',
    agent_address: '0x7ea68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37654',
    modelProvider: 'Anthropic',
    agentname: 'devops_pro',
    name: 'DevOps Master',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=devops_pro',
    description: 'Expert in DevOps practices and cloud infrastructure',
    lastActive: new Date().toISOString(),
    stats: {
      members: 934,
      price: 18,
      marketCap: 16812
    },
    status: 'online',
    isFeatured: true,
    prompt: 'You are a DevOps expert specializing in CI/CD, cloud infrastructure, and automation.'
  },
  {
    address: '0x8fa68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37987',
    agent_address: '0x8fa68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37987',
    modelProvider: 'Anthropic',
    agentname: 'security_expert',
    name: 'Security Guardian',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=security_expert',
    description: 'Cybersecurity specialist focusing on application security',
    lastActive: new Date().toISOString(),
    stats: {
      members: 823,
      price: 25,
      marketCap: 20575
    },
    status: 'online',
    isFeatured: true,
    isTrending: true,
    prompt: 'You are a cybersecurity expert specializing in application security and best practices.'
  },
  {
    address: '0x9aa68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37147',
    agent_address: '0x9aa68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37147',
    modelProvider: 'Anthropic',
    agentname: 'mobile_dev',
    name: 'Mobile Dev Guru',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=mobile_dev',
    description: 'Expert in mobile app development for iOS and Android',
    lastActive: new Date().toISOString(),
    stats: {
      members: 712,
      price: 14,
      marketCap: 9968
    },
    status: 'online',
    isFeatured: false,
    prompt: 'You are a mobile development expert specializing in iOS and Android platforms.'
  },
  {
    address: '0x10b68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37258',
    agent_address: '0x10b68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37258',
    modelProvider: 'Anthropic',
    agentname: 'blockchain_dev',
    name: 'Blockchain Sage',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=blockchain_dev',
    description: 'Blockchain development and smart contract expert',
    lastActive: new Date().toISOString(),
    stats: {
      members: 578,
      price: 30,
      marketCap: 17340
    },
    status: 'online',
    isFeatured: true,
    isTrending: true,
    prompt: 'You are a blockchain developer specializing in smart contracts and DApps.'
  },
  {
    address: '0x11c68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37369',
    agent_address: '0x11c68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37369',
    modelProvider: 'Anthropic',
    agentname: 'cloud_architect',
    name: 'Cloud Architect',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=cloud_architect',
    description: 'Expert in cloud architecture and distributed systems',
    lastActive: new Date().toISOString(),
    stats: {
      members: 845,
      price: 22,
      marketCap: 18590
    },
    status: 'online',
    isFeatured: true,
    prompt: 'You are a cloud architect specializing in distributed systems and scalable architecture.'
  },
  {
    address: '0x12d68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37741',
    agent_address: '0x12d68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37741',
    modelProvider: 'Anthropic',
    agentname: 'testing_expert',
    name: 'Test Master',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=testing_expert',
    description: 'Quality assurance and testing automation specialist',
    lastActive: new Date().toISOString(),
    stats: {
      members: 634,
      price: 16,
      marketCap: 10144
    },
    status: 'online',
    isFeatured: false,
    isTrending: true,
    prompt: 'You are a testing expert specializing in QA processes and test automation.'
  }
] 
