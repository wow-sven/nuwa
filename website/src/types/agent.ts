export interface AgentStats {
  members: number        // Number of members
  messageCount: number         // Number of messages
  balance: number     // Balance (RGAS)
}

export interface Agent {
  id: string
  address: string                 // Agent address
  username: string         // Agent name (associated with AgentName)
  name: string              // Display name
  avatar: string            // Avatar URL
  description: string       // Description
  lastActive: string        // Last active time
  createdAt: string        // Created time
  modelProvider: string     // Model provider
  agent_address: string     // Agent address (on-chain address)
  stats: AgentStats        // Statistics
  prompt: string          // Prompt
  isFeatured?: boolean    // Whether the agent is featured
  isTrending?: boolean    // Whether the agent is trending
}
