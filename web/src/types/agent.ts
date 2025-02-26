import { HexString } from '@roochnetwork/rooch-sdk';

export interface Character {
  id: string;
  name: string;
  username: string;
  description: string;
}

export interface CharacterReference {
  abilities: number;
  type: string;
  value: {
    id: string;
  }
}

export interface Memory {
  index: number;
  content: string;
  context: string;
  timestamp: number;
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  owner: string;
  characterId?: string;
  modelProvider: string;
  createdAt: number;
}

export interface AgentInput {
  sender: HexString;
  inputDescription: string;
  inputData: any;
}

export const MemoryContexts = [
  'personal',
  'interaction',
  'knowledge',
  'emotional',
  'goal',
  'preference',
  'feedback'
] as const;

export type MemoryContext = typeof MemoryContexts[number];
