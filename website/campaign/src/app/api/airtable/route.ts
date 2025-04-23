import { NextRequest, NextResponse } from 'next/server';
import {
    getLeaderboardData,
    getUserPoints,
    getUserRewardHistory,
    getMissions,
    checkUserRewardHistory
} from '@/app/services/airtable';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    try {
        // 根据action参数决定调用哪个服务函数
        if (action === 'getLeaderboard') {
            const data = await getLeaderboardData();
            return NextResponse.json({ success: true, data });
        }
        else if (action === 'getUserPoints') {
            const userName = searchParams.get('userName');
            if (!userName) {
                return NextResponse.json({ success: false, error: 'Missing userName parameter' }, { status: 400 });
            }
            const result = await getUserPoints(userName);
            return NextResponse.json(result);
        }
        else if (action === 'getUserRewardHistory') {
            const userName = searchParams.get('userName');
            if (!userName) {
                return NextResponse.json({ success: false, error: 'Missing userName parameter' }, { status: 400 });
            }
            const data = await getUserRewardHistory(userName);
            return NextResponse.json({ success: true, data });
        }
        else if (action === 'getMissions') {
            const data = await getMissions();
            return NextResponse.json({ success: true, data });
        }
        else if (action === 'checkUserRewardHistory') {
            const userName = searchParams.get('userName');
            const mission = searchParams.get('mission');
            if (!userName || !mission) {
                return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
            }
            const result = await checkUserRewardHistory(userName, mission);
            return NextResponse.json({ success: true, data: result });
        }
        else {
            return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}