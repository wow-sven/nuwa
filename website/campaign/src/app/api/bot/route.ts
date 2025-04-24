import { NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { tools } from '../chat/tools';
import { getDefaultSystemPrompt } from '../chat/mission-router';
import { checkTwitterBinding, sendTwitterBindingMessage, sendTwitterBindingError } from './twitter-binding';
import { handleMissionsCommand, handleMissionButton } from './mission-commands';
import { handleMyPointsCommand } from './points-commands';
import { handleLeaderboardCommand } from './leaderboard-commands';
import { sendWelcomeMessage, handleWelcomeButtons } from './send-welcome/send-welcome';

// Initialize Telegraf bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

// Handle /start command
bot.command('start', async (ctx) => {
    try {
        const telegramId = ctx.from.id.toString();

        // 检查 Twitter 绑定状态
        const twitterHandle = await checkTwitterBinding(telegramId);

        if (twitterHandle) {
            // 发送欢迎消息
            await sendWelcomeMessage(ctx, twitterHandle);
        } else {
            // 如果未绑定，显示欢迎信息和绑定按钮
            await sendTwitterBindingMessage(ctx, telegramId);
        }
    } catch (error) {
        await sendTwitterBindingError(ctx, error);
    }
});

// Handle /start command
bot.command('help', async (ctx) => {
    try {
        const telegramId = ctx.from.id.toString();

        // 检查 Twitter 绑定状态
        const twitterHandle = await checkTwitterBinding(telegramId);

        if (twitterHandle) {
            // 发送欢迎消息
            await sendWelcomeMessage(ctx, twitterHandle);
        } else {
            // 如果未绑定，显示欢迎信息和绑定按钮
            await sendTwitterBindingMessage(ctx, telegramId);
        }
    } catch (error) {
        await sendTwitterBindingError(ctx, error);
    }
});

// Handle /bind_twitter command
bot.command('bind_twitter', async (ctx) => {
    try {
        const telegramId = ctx.from.id.toString();

        // 检查是否已经绑定
        const twitterHandle = await checkTwitterBinding(telegramId);
        if (twitterHandle) {
            await ctx.reply(`You have already bound your Twitter account @${twitterHandle}.`);
            return;
        }
    } catch (error) {
        await sendTwitterBindingError(ctx, error);
    }
});

// Handle /missions command
bot.command('missions', handleMissionsCommand);

// Handle /my_points command
bot.command('my_points', handleMyPointsCommand);

// Handle /leaderboard command
bot.command('leaderboard', handleLeaderboardCommand);

// Handle mission button clicks
bot.action(/^mission_(.+)$/, async (ctx) => {
    // 从回调数据中提取任务ID
    const callbackQuery = ctx.callbackQuery;
    if (callbackQuery && 'data' in callbackQuery) {
        const missionId = callbackQuery.data.replace('mission_', '');
        await handleMissionButton(ctx, missionId);
    }
});

// Handle welcome message buttons
bot.action(/^show_(points|leaderboard|missions)$/, handleWelcomeButtons);

// Handle text messages
bot.on('text', async (ctx) => {
    try {
        const userMessage = ctx.message.text;
        const userInfo = {
            name: ctx.from.first_name,
            telegramId: ctx.from.id.toString(),
        };

        // Get system prompt
        const systemPrompt = await getDefaultSystemPrompt(userInfo);

        // Process the message with AI
        const result = await generateText({
            model: openai('gpt-4o-mini'),
            messages: [{ role: 'user', content: userMessage }],
            tools,
            system: systemPrompt,
            maxSteps: 5,
            toolChoice: 'auto'
        });

        // Get the AI response
        const aiResponse = await result.text;

        // Send the response back to Telegram
        await ctx.reply(aiResponse, { parse_mode: 'HTML' });
    } catch (error) {
        console.error('Error processing message:', error);
        await ctx.reply('Sorry, an error occurred while processing the message. Please try again later.');
    }
});

// Webhook handler
export async function POST(req: Request) {
    try {
        const update = await req.json();
        await bot.handleUpdate(update);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error in webhook handler:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}