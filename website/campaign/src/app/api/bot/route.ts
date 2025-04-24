import { NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { tools } from '../chat/tools';
import { getDefaultSystemPrompt } from '../chat/mission-router';
import { checkTwitterBinding, handleBoundTwitter, handleUnboundTwitter, handleTwitterBindingError } from './twitter-binding';
import { handleMissionsCommand, handleMissionButton } from './mission-commands';

// Initialize Telegraf bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

// Handle /start command
bot.command('start', async (ctx) => {
    try {
        const telegramId = ctx.from.id.toString();

        // 检查 Twitter 绑定状态
        const twitterHandle = await checkTwitterBinding(telegramId);

        if (twitterHandle) {
            // 如果已经绑定，显示欢迎信息和已绑定的 Twitter 账号
            await handleBoundTwitter(ctx, twitterHandle);
        } else {
            // 如果未绑定，显示欢迎信息和绑定按钮
            await handleUnboundTwitter(ctx, telegramId);
        }
    } catch (error) {
        await handleTwitterBindingError(ctx, error);
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

        // 生成绑定按钮
        await handleUnboundTwitter(ctx, telegramId);
    } catch (error) {
        await handleTwitterBindingError(ctx, error);
    }
});

// Handle /missions command
bot.command('missions', handleMissionsCommand);

// Handle mission button clicks
bot.action(/^mission_(.+)$/, async (ctx) => {
    // 从回调数据中提取任务ID
    const callbackQuery = ctx.callbackQuery;
    if (callbackQuery && 'data' in callbackQuery) {
        const missionId = callbackQuery.data.replace('mission_', '');
        await handleMissionButton(ctx, missionId);
    }
});

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