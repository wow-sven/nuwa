import { createClient } from './supabase';

export interface LeaderboardUser {
    id: string;
    handle: string;
    name: string;
    avatar: string;
    points: number;
    rank?: number;
}

export async function getLeaderboardData(): Promise<LeaderboardUser[]> {
    try {
        const supabase = await createClient();

        // 获取所有用户数据并按积分降序排序
        const { data, error } = await supabase
            .from('campaign_points')
            .select('*')
            .order('points', { ascending: false });

        if (error) {
            console.error('Error fetching leaderboard data:', error);
            return [];
        }

        // 添加排名信息
        return data.map((user, index) => ({
            ...user,
            rank: index + 1
        }));
    } catch (error) {
        console.error('Error in getLeaderboardData:', error);
        return [];
    }
} 