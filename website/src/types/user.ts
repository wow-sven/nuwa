export interface Token {
  id: string
  name: string
  symbol: string
  logo: string
  balance: number
  decimals: number
}

export interface User {
  id: string
  name: string
  username: string
  avatar: string
  address: string
  rgasBalance: number
  tokens: Token[]
} 