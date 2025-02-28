import { HexString,bcs } from '@roochnetwork/rooch-sdk';

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

// Define BCS MemorySchema for deserialization that matches the Move type
export const MemorySchema = bcs.struct('Memory', {
  index: bcs.u64(),
  content: bcs.string(),
  context: bcs.string(),
  timestamp: bcs.u64(),
});

export interface Agent {
  id: string;
  name: string;
  description?: string;
  agent_address: string;
  characterId?: string;
  modelProvider: string;
  createdAt: number;
}

export interface AgentInput {
  sender: HexString;
  inputDescription: string;
  inputData: any;
}

export type MemoryContext = 
  | 'personal' 
  | 'interaction' 
  | 'knowledge' 
  | 'emotional' 
  | 'goal' 
  | 'preference' 
  | 'feedback';

export const MemoryContexts: MemoryContext[] = [
  'personal',
  'interaction',
  'knowledge',
  'emotional',
  'goal',
  'preference',
  'feedback'
];
