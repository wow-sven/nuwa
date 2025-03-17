import { User } from '../types/user'

export interface Token {
  id: string
  name: string
  symbol: string
  logo: string
  balance: number
  decimals: number
}


export const mockUser: User = {
  id: '1',
  name: 'Alice',
  username: 'alice',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
  address: '0x1234567890123456789012345678901234567890',
  rgasBalance: 1000,
  tokens: [
    {
      id: '1',
      name: 'Bitcoin',
      symbol: 'BTC',
      logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      balance: 0.5,
      decimals: 8
    },
    {
      id: '2',
      name: 'Ethereum',
      symbol: 'ETH',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      balance: 2.5,
      decimals: 18
    },
    {
      id: '3',
      name: 'USDT',
      symbol: 'USDT',
      logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      balance: 1000,
      decimals: 6
    }
  ]
} 