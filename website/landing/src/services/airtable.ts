import Airtable from 'airtable';

// 初始化Airtable客户端
const base = new Airtable({
    apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY
}).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

// 定义表单数据的接口
export interface FormData {
    email: string;
    agentname: string;
    product?: string;
    description?: string;
}

// 定义排行榜用户数据的接口
export interface LeaderboardUser {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    points: number;
    rank?: number;
}

// 提交表单数据到Airtable
export const submitFormToAirtable = async (formData: FormData): Promise<boolean> => {
    try {
        // 假设您的表名为"Contacts"
        const table = base('Early Access Registry');

        // 创建记录
        await table.create([
            {
                fields: {
                    Email: formData.email,
                    Agentname: formData.agentname,
                    Link: formData.product || '',
                    Description: formData.description || '',
                }
            }
        ]);

        return true;
    } catch (error) {
        console.error('Error submitting form to Airtable:', error);
        return false;
    }
};

// 获取排行榜数据
export const getLeaderboardData = async (): Promise<LeaderboardUser[]> => {
    try {
        const table = base('Campaign Points');

        // 获取所有记录，按Points字段降序排序
        const records = await table.select({
            sort: [{ field: 'Points', direction: 'desc' }]
        }).all();

        // 转换记录为LeaderboardUser格式
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