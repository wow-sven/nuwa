export type Target = 'local' | 'dev' | 'test' | 'main';

export interface Cap {
  name: string;
  id: string;
}

export interface Result {
  code: number;
  error?: string;
  data?: any;
}