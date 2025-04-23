import { LeaderboardUser, RewardData, Mission } from './airtable';

// 获取排行榜数据
export const fetchLeaderboard = async (): Promise<LeaderboardUser[]> => {
    try {
        const response = await fetch(`/api/airtable?action=getLeaderboard`);
        const data = await response.json();

        if (!data.success) {
            console.error('Error fetching leaderboard:', data.error);
            return [];
        }

        return data.data;
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        return [];
    }
};

// 获取用户积分
export const fetchUserPoints = async (userName: string): Promise<{ points: number; success: boolean; error?: string }> => {
    try {
        const response = await fetch(`/api/airtable?action=getUserPoints&userName=${encodeURIComponent(userName)}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch user points:', error);
        return { points: 0, success: false, error: 'Failed to fetch user points' };
    }
};

// 获取用户积分历史
export const fetchUserRewardHistory = async (userName: string): Promise<{
    id: string;
    points: number;
    mission: string;
    createdTime: string;
    missionDetails: string;
}[]> => {
    try {
        const response = await fetch(`/api/airtable?action=getUserRewardHistory&userName=${encodeURIComponent(userName)}`);
        const data = await response.json();

        if (!data.success) {
            console.error('Error fetching user reward history:', data.error);
            return [];
        }

        return data.data;
    } catch (error) {
        console.error('Failed to fetch user reward history:', error);
        return [];
    }
};

// 获取所有任务数据
export const fetchMissions = async (): Promise<Mission[]> => {
    try {
        const response = await fetch(`/api/airtable?action=getMissions`);
        const data = await response.json();

        if (!data.success) {
            console.error('Error fetching missions:', data.error);
            return [];
        }

        return data.data;
    } catch (error) {
        console.error('Failed to fetch missions:', error);
        return [];
    }
};

// 更新奖励
export const updateUserReward = async (rewardData: RewardData): Promise<{ success: boolean; error?: string }> => {
    try {
        const response = await fetch('/api/airtable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'updateReward',
                userName: rewardData.userName,
                points: rewardData.points,
                missionId: rewardData.missionId,
                missionDetails: rewardData.missionDetails || ''
            }),
        });

        return await response.json();
    } catch (error) {
        console.error('Failed to update reward:', error);
        return { success: false, error: 'Failed to update reward' };
    }
};

// 检查用户是否已获得特定任务的奖励
export const checkUserMissionReward = async (userName: string, mission: string): Promise<{
    hasReceived: boolean;
    missionDetails?: string;
}> => {
    try {
        const response = await fetch(`/api/airtable?action=checkUserRewardHistory&userName=${encodeURIComponent(userName)}&mission=${encodeURIComponent(mission)}`);
        const data = await response.json();

        if (!data.success) {
            console.error('Error checking user mission reward:', data.error);
            return { hasReceived: false };
        }

        return data.data;
    } catch (error) {
        console.error('Failed to check user mission reward:', error);
        return { hasReceived: false };
    }
}; 