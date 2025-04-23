import Airtable from 'airtable';

// Initialize Airtable client
const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID || '');

// Leaderboard user data interface
export interface LeaderboardUser {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    points: number;
    rank?: number;
}

// Reward data interface
export interface RewardData {
    userName: string;
    points: number;
    missionId: string;
    missionDetails?: string;
}

// Mission data interface
export interface Mission {
    id: string;
    title: string;
    description: string;
    suggestionText: string;
    suggested?: boolean;
    prompt?: string;
    order?: number;
}

// Get all missions data
export const getMissions = async (): Promise<Mission[]> => {
    try {
        const table = base('Missions');

        // Get all records with sorting by order field
        const records = await table.select({
            sort: [{ field: 'order', direction: 'asc' }]
        }).all();

        // Convert records to Mission format
        const missions: Mission[] = records.map((record) => ({
            id: record.get('id') as string,
            title: record.get('title') as string,
            description: record.get('description') as string,
            suggestionText: record.get('suggestionText') as string,
            suggested: record.get('suggested') as boolean || false,
            prompt: record.get('Prompt') as string || '',
            order: record.get('order') as number || 0,
        }));

        return missions;
    } catch (error) {
        console.error('Error fetching missions from Airtable:', error);
        return [];
    }
};

// Get leaderboard data
export const getLeaderboardData = async (): Promise<LeaderboardUser[]> => {
    try {
        const table = base('Campaign Points');

        // Get all records, sorted by Points field in descending order
        const records = await table.select({
            sort: [{ field: 'Points', direction: 'desc' }]
        }).all();

        // Convert records to LeaderboardUser format
        const users: LeaderboardUser[] = records.map((record, index) => ({
            id: record.id,
            name: record.get('Name') as string,
            handle: record.get('Handle') as string,
            avatar: record.get('Avatar') as string,
            points: record.get('Points') as number,
            rank: index + 1
        }));

        return users;
    } catch (error) {
        console.error('Error fetching leaderboard data from Airtable:', error);
        return [];
    }
};

// Add reward record to Airtable
export const updateReward = async (rewardData: RewardData): Promise<{ success: boolean; error?: string }> => {
    try {
        // First add reward record
        const rewardTable = base('Points Reward Log');
        await rewardTable.create([
            {
                fields: {
                    RewardTo: rewardData.userName,
                    Points: rewardData.points,
                    Mission: rewardData.missionId,
                    MissionDetails: rewardData.missionDetails || '',
                }
            }
        ], { typecast: true });

        // After successfully adding reward record, update user's total points
        const pointsTable = base('Campaign Points');

        // Find user record
        const records = await pointsTable.select({
            filterByFormula: `{Handle} = '${rewardData.userName}'`,
            maxRecords: 1
        }).all();

        if (records.length === 0) {
            return { success: false, error: 'User not found' };
        }

        // Update existing user points
        const record = records[0];
        const currentPoints = record.get('Points') as number || 0;

        await pointsTable.update(record.id, {
            Points: currentPoints + rewardData.points
        });

        return { success: true };
    } catch (error) {
        console.error('Error adding reward to Airtable:', error);
        return { success: false, error: 'Failed to add reward' };
    }
};

// Check if user has already received reward for a specific mission
export const checkUserRewardHistory = async (userName: string, mission: string): Promise<{
    hasReceived: boolean;
    missionDetails?: string;
}> => {
    try {
        const table = base('Points Reward Log');

        // Query records
        const records = await table.select({
            filterByFormula: `AND({RewardTo} = '${userName}', {Mission} = '${mission}')`,
            maxRecords: 1
        }).all();

        if (records.length > 0) {
            const record = records[0];
            return {
                hasReceived: true,
                missionDetails: record.get('MissionDetails') as string || ''
            };
        }

        return { hasReceived: false };
    } catch (error) {
        console.error('Error checking user reward history from Airtable:', error);
        return { hasReceived: false };
    }
};

// Get user's current points
export const getUserPoints = async (userName: string): Promise<{ points: number; success: boolean; error?: string }> => {
    try {
        const table = base('Campaign Points');

        // Find user record
        const records = await table.select({
            filterByFormula: `{Handle} = '${userName}'`,
            maxRecords: 1
        }).all();

        if (records.length === 0) {
            return { points: 0, success: false, error: 'User not found' };
        }

        // Get user points
        const record = records[0];
        const points = record.get('Points') as number || 0;

        return { points, success: true };
    } catch (error) {
        console.error('Error fetching user points from Airtable:', error);
        return { points: 0, success: false, error: 'Failed to fetch user points' };
    }
};

// Get user's reward history
export const getUserRewardHistory = async (userName: string): Promise<{
    id: string;
    points: number;
    mission: string;
    createdTime: string;
    missionDetails: string;
}[]> => {
    try {
        const table = base('Points Reward Log');

        // Query records for the user
        const records = await table.select({
            filterByFormula: `{RewardTo} = '${userName}'`,
            sort: [{ field: 'CreatedAt', direction: 'desc' }]
        }).all();

        // Convert records to format
        const history = records.map((record) => ({
            id: record.id,
            points: record.get('Points') as number,
            mission: record.get('Mission') as string,
            createdTime: record.get('CreatedAt') as string,
            missionDetails: record.get('MissionDetails') as string || '',
        }));

        return history;
    } catch (error) {
        console.error('Error fetching user reward history from Airtable:', error);
        return [];
    }
};
