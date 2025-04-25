import { createClient } from './supabase';

export interface LeaderboardUser {
    id: string;
    handle: string;
    name: string;
    avatar: string;
    points: number;
    rank?: number;
}

export interface PointsHistoryItem {
    id: string;
    points: number;
    mission: string;
    createdTime: string;
    missionTitle?: string;
    missionDescription?: string;
    missionDetails?: string;
}

export async function getUserPoints(twitterHandle: string): Promise<number> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('campaign_points')
            .select('points')
            .eq('handle', twitterHandle)
            .single();

        if (error) {
            console.error("Error fetching user points:", error);
            return 0;
        }

        return data?.points || 0;
    } catch (error) {
        console.error("Error in getUserPoints:", error);
        return 0;
    }
}

export async function getUserPointsHistory(twitterHandle: string): Promise<PointsHistoryItem[]> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('points_reward_log')
            .select('*')
            .eq('reward_to', twitterHandle)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching user points history:", error);
            return [];
        }

        return data.map(item => ({
            id: item.id,
            points: item.points,
            mission: item.mission,
            createdTime: item.created_at,
            missionDetails: item.mission_details || ''
        }));
    } catch (error) {
        console.error("Error in getUserPointsHistory:", error);
        return [];
    }
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