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

export interface TaskExecution {
  id: string;
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
  result?: any;
  error?: string;
  arguments: Record<string, any>;
}

export interface TaskExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: TaskExecution['status'];
  taskId?: string;
}

export interface TaskPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskListResponse {
  tasks: Task[];
  pagination: TaskPagination;
} 