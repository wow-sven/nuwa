export type Target = 'local' | 'dev' | 'test' | 'main';

export interface Result {
  code: number;
  error?: string;
  data?: any;
}

export interface CapMetadataSchema {
  displayName: string,
  description: string,
  tags: string[],
  submittedAt: number,
  homepage: string,
  repository: string,
  thumbnail: string,
};