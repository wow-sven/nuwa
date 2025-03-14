export type ArgumentType = 'String' | 'Number' | 'Boolean'

export interface TaskArgument {
  name: string
  type: ArgumentType
  description: string
}

export interface Task {
  id: string
  name: string
  description?: string
  arguments: TaskArgument[]
  resolverAddress: string
  isOnChain: boolean
  price: number
}

export interface TaskFormData {
  name: string
  description: string
  arguments: TaskArgument[]
  resolverAddress: string
  isOnChain: boolean
  price: number
} 