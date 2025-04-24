import { Context } from 'telegraf';
import { getMissions } from '../../services/airtable';

/**
 * 处理 /missions 命令，向用户发送任务列表按钮
 * @param ctx Telegram 上下文
 */
export async function handleMissionsCommand(ctx: Context): Promise<void> {
    try {

        console.log('handleMissionsCommand');
        // 获取所有任务
        const missions = await getMissions();

        if (missions.length === 0) {
            await ctx.reply('No available missions. Please try again later.');
            return;
        }

        // 构建任务列表消息
        let message = '📋 <b>Available Missions</b>\n\n';

        // 构建任务按钮
        const buttons = missions.map(mission => [{
            text: mission.title,
            callback_data: `mission_${mission.id}`
        }]);

        // 发送消息和按钮
        await ctx.reply(message, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: buttons
            }
        });
    } catch (error) {
        console.error('Error handling missions command:', error);
        await ctx.reply('Error getting missions. Please try again later.');
    }
}

/**
 * 处理任务按钮点击事件
 * @param ctx Telegram 上下文
 * @param missionId 任务ID
 */
export async function handleMissionButton(ctx: Context, missionId: string): Promise<void> {
    try {
        // 获取所有任务
        const missions = await getMissions();

        // 查找指定ID的任务
        const mission = missions.find(m => m.id === missionId);

        if (!mission) {
            await ctx.answerCbQuery('Mission not found or removed.');
            return;
        }

        // 构建任务详情消息
        let message = `📌 <b>${mission.title}</b>\n\n`;
        message += `${mission.description}\n\n`;

        if (mission.suggestionText) {
            message += `💡 <b>Suggestion:</b> ${mission.suggestionText}\n\n`;
        }

        message += `Task ID: <code>${mission.id}</code>`;

        // 发送任务详情
        await ctx.answerCbQuery();
        await ctx.reply(message, {
            parse_mode: 'HTML'
        });
    } catch (error) {
        console.error('Error handling mission button:', error);
        await ctx.answerCbQuery('Error getting mission details. Please try again later.');
    }
} 