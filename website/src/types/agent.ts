export type AgentCategory = 'featured' | 'all' | 'chat' | 'image' | 'video' | 'audio' | 'code'
export type AgentStatus = 'online' | 'offline' | 'busy'

export interface AgentName {
  agentname: string        // 唯一标识符
  registeredAt: string
}

export interface AgentStats {
  members: number        // 成员数量
  price: number         // 价格（USD）
  marketCap: number     // 市值（USD）
}

export interface Agent {
  address: string                 // 代理地址
  agentname: string         // 代理名称（与 AgentName 关联）
  name: string              // 显示名称
  avatar: string            // 头像 URL
  description: string       // 描述
  lastActive: string        // 最后活跃时间
  modelProvider: string     // 模型提供商
  agent_address: string     // 代理地址（链上地址）
  stats: AgentStats        // 统计信息
  status: AgentStatus      // 状态
  prompt: string          // 提示词
  category?: AgentCategory // 分类
}

export const agentCategories: AgentCategory[] = [
  'featured',
  'all',
  'chat',
  'image',
  'video',
  'audio',
  'code'
]

export const categoryLabels: Record<AgentCategory, string> = {
  featured: 'Featured',
  all: 'All',
  chat: 'Chat',
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  code: 'Code'
}

export function isAgent(obj: any): obj is Agent {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.agentname === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.avatar === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.lastActive === 'string' &&
    typeof obj.modelProvider === 'string' &&
    typeof obj.agent_address === 'string' &&
    typeof obj.stats === 'object' &&
    typeof obj.status === 'string' &&
    typeof obj.prompt === 'string';

} 