export type AgentCategory = 'featured' | 'all' | 'chat' | 'image' | 'video' | 'audio' | 'code'
export type AgentStatus = 'online' | 'offline' | 'busy'

export interface AgentStats {
  members: number        // Number of members
  price: number         // Price (USD)
  marketCap: number     // Market Cap (USD)
}

export interface Agent {
  address: string                 // Agent address
  agentname: string         // Agent name (associated with AgentName)
  name: string              // Display name
  avatar: string            // Avatar URL
  description: string       // Description
  lastActive: string        // Last active time
  modelProvider: string     // Model provider
  agent_address: string     // Agent address (on-chain address)
  stats: AgentStats        // Statistics
  status: AgentStatus      // Status
  prompt: string          // Prompt
  category?: AgentCategory // Category
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