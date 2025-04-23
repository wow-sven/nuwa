import { createClient, createServiceClient } from './supabase';
import { LeaderboardUser, RewardData } from './airtable';

// 获取排行榜数据
export const getLeaderboardData = async (): Promise<LeaderboardUser[]> => {
    try {
        const supabase = await createClient();

        // 获取所有用户，按积分降序排序
        const { data, error } = await supabase
            .from('campaign_points')
            .select('*')
            .order('points', { ascending: false });

        if (error) {
            console.error('Error fetching leaderboard data from Supabase:', error);
            return [];
        }

        // 转换为 LeaderboardUser 格式
        const users: LeaderboardUser[] = data.map((record, index) => ({
            id: record.id,
            name: record.name,
            handle: record.handle,
            avatar: record.avatar,
            points: record.points,
            rank: index + 1
        }));

        return users;
    } catch (error) {
        console.error('Error fetching leaderboard data from Supabase:', error);
        return [];
    }
};

// 获取用户积分
export const getUserPoints = async (userName: string): Promise<{ points: number; success: boolean; error?: string }> => {
    try {
        const supabase = await createClient();

        // 查找用户记录
        const { data, error } = await supabase
            .from('campaign_points')
            .select('points')
            .eq('handle', userName)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // 用户不存在
                return { points: 0, success: false, error: 'User not found' };
            }
            console.error('Error fetching user points from Supabase:', error);
            return { points: 0, success: false, error: 'Failed to fetch user points' };
        }

        return { points: data.points, success: true };
    } catch (error) {
        console.error('Error fetching user points from Supabase:', error);
        return { points: 0, success: false, error: 'Failed to fetch user points' };
    }
};

// 获取用户积分历史
export const getUserRewardHistory = async (userName: string): Promise<{
    id: string;
    points: number;
    mission: string;
    createdTime: string;
    missionDetails: string;
}[]> => {
    try {
        const supabase = await createClient();

        // 查询用户的奖励记录
        const { data, error } = await supabase
            .from('points_reward_log')
            .select('*')
            .eq('reward_to', userName)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user reward history from Supabase:', error);
            return [];
        }

        // 转换为所需格式
        const history = data.map((record) => ({
            id: record.id,
            points: record.points,
            mission: record.mission,
            createdTime: record.created_at,
            missionDetails: record.mission_details || '',
        }));

        return history;
    } catch (error) {
        console.error('Error fetching user reward history from Supabase:', error);
        return [];
    }
};

// 更新奖励
export const updateReward = async (rewardData: RewardData): Promise<{ success: boolean; error?: string }> => {
    try {
        const supabase = await createServiceClient();

        // 开始事务
        const { data: userData, error: userError } = await supabase
            .from('campaign_points')
            .select('id, points')
            .eq('handle', rewardData.userName)
            .single();

        if (userError && userError.code !== 'PGRST116') {
            console.error('Error finding user in Supabase:', userError);
            return { success: false, error: 'Failed to find user' };
        }

        // 添加奖励记录
        const { error: rewardError } = await supabase
            .from('points_reward_log')
            .insert({
                reward_to: rewardData.userName,
                points: rewardData.points,
                mission: rewardData.missionId,
                mission_details: rewardData.missionDetails || '',
            });

        if (rewardError) {
            console.error('Error adding reward record to Supabase:', rewardError);
            return { success: false, error: 'Failed to add reward record' };
        }

        // 更新用户积分
        if (userError && userError.code === 'PGRST116') {
            // 用户不存在，创建新用户
            const { error: createError } = await supabase
                .from('campaign_points')
                .insert({
                    name: rewardData.userName, // 使用 handle 作为 name
                    handle: rewardData.userName,
                    points: rewardData.points,
                });

            if (createError) {
                console.error('Error creating new user in Supabase:', createError);
                return { success: false, error: 'Failed to create new user' };
            }
        } else if (userData) {
            // 用户存在，更新积分
            const { error: updateError } = await supabase
                .from('campaign_points')
                .update({ points: userData.points + rewardData.points })
                .eq('id', userData.id);

            if (updateError) {
                console.error('Error updating user points in Supabase:', updateError);
                return { success: false, error: 'Failed to update user points' };
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating reward in Supabase:', error);
        return { success: false, error: 'Failed to update reward' };
    }
};

// 检查用户是否已获得特定任务的奖励
export const checkUserRewardHistory = async (userName: string, mission: string): Promise<{
    hasReceived: boolean;
    missionDetails?: string;
}> => {
    try {
        const supabase = await createClient();

        // 查询记录
        const { data, error } = await supabase
            .from('points_reward_log')
            .select('mission_details')
            .eq('reward_to', userName)
            .eq('mission', mission)
            .limit(1);

        if (error) {
            console.error('Error checking user reward history from Supabase:', error);
            return { hasReceived: false };
        }

        if (data && data.length > 0) {
            return {
                hasReceived: true,
                missionDetails: data[0].mission_details || ''
            };
        }

        return { hasReceived: false };
    } catch (error) {
        console.error('Error checking user reward history from Supabase:', error);
        return { hasReceived: false };
    }
}; 