export const FEATURED_AGENTS = [
    'BigSpender1',
    'BigSpender',
] as const;

export const TRENDING_AGENTS = [
    'btcforecaster',
    'test',
    'alfsiter',
    'cryptocaishen',
] as const;

export type FeaturedAgent = typeof FEATURED_AGENTS[number];
export type TrendingAgent = typeof TRENDING_AGENTS[number]; 