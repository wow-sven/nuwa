import { Context } from 'telegraf';
import { getMissions } from '../../services/airtable';
import { checkTwitterBinding, sendTwitterBindingMessage } from './twitter-binding';
import { getDefaultSystemPrompt, getMissionSystemPrompt, UserInfo } from '../chat/mission-router';
import { conversationHistory, activeMissions } from '../bot/route';

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
        // 获取用户的telegramId
        const telegramId = ctx.from?.id.toString();
        if (!telegramId) {
            await ctx.answerCbQuery('User information cannot be recognized, please try again');
            return;
        }

        // 检查Twitter绑定状态
        const twitterHandle = await checkTwitterBinding(telegramId);
        if (!twitterHandle) {
            await ctx.answerCbQuery('Please bind your Twitter account first');
            await sendTwitterBindingMessage(ctx, telegramId);
            return;
        }

        // 获取所有任务
        const missions = await getMissions();

        // 查找指定ID的任务
        const mission = missions.find(m => m.id === missionId);

        if (!mission) {
            await ctx.answerCbQuery('Mission not found or has been removed');
            return;
        }

        // Set the mission as active for this user
        activeMissions.set(telegramId, missionId);

        // 构建任务详情消息
        let message = `📌 <b>${mission.title}</b>\n\n`;
        message += `${mission.description}\n\n`;

        if (mission.suggestionText) {
            message += `💡 <b>Suggestion:</b> ${mission.suggestionText}\n\n`;
        }

        message += `I'm ready to help you complete this mission! Please tell me what you'd like to do, or start directly according to the suggestion.`;
        message += `\n\nYou can use /end_mission command to end this mission when you're done.`;

        // 发送任务详情
        await ctx.answerCbQuery('Loading mission...');
        await ctx.reply(message, {
            parse_mode: 'HTML'
        });

        // 准备用户信息
        const userInfo: UserInfo = {
            name: ctx.from?.first_name || 'User',
            twitterHandle
        };

        // 清除之前的对话历史，开始新的任务对话
        // 获取或初始化会话历史记录
        if (!conversationHistory.has(telegramId)) {
            conversationHistory.set(telegramId, []);
        }
        const history = conversationHistory.get(telegramId)!;

        // 清空之前的对话历史，开始新的任务对话
        history.length = 0;

        // 添加系统初始消息到历史记录，引导用户开始任务
        history.push({
            role: 'assistant',
            content: `I'll help you complete the "${mission.title}" mission. Please start according to the suggestion, or tell me what kind of help you need.`
        });

        // 注意：用户下一条消息将会使用特定任务的系统提示进行处理
        // 这是在route.ts的文本消息处理部分自动处理的

    } catch (error) {
        console.error('Error handling mission button:', error);
        await ctx.answerCbQuery('Error retrieving mission details, please try again later');
    }
} 