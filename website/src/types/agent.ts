export interface Agent {
  id: string                 // Agent ID
  address: string           // Agent Address
  modelProvider: string     // Model Provider
  username: string          // Character Username
  description: string       // Character Description
  lastActive: string        // Last Active Time
  characterId: string       // Character ID
  name: string             // Display Name
  avatar: string           // Avatar URL
  stats: {
    members: number        // Members Count
    price: number         // Price in USD
    marketCap: number     // Market Cap in USD
  }
  status: 'online' | 'offline' | 'busy'
  prompt: string
  followers?: number
  category?: string
} 