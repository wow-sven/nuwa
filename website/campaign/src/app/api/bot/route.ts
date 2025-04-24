import { NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { tools } from '../chat/tools';
import { getDefaultSystemPrompt } from '../chat/mission-router';
import { createServiceClient } from '@/app/services/supabase';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Initialize Telegraf bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

// 生成 PKCE 挑战
function generatePKCEChallenge() {
    // 生成验证码
    const verifier = crypto.randomBytes(32).toString('base64url');

    // 生成挑战码
    const challenge = crypto
        .createHash('sha256')
        .update(verifier)
        .digest('base64url');

    return { verifier, challenge };
}

// 检查 Twitter 绑定状态
async function checkTwitterBinding(telegramId: string) {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
        .from('telegram_twitter_bindings')
        .select('twitter_handle')
        .eq('telegram_id', telegramId)
        .single();

    if (error) {
        console.error('Error checking Twitter binding:', error);
        return null;
    }

    return data?.twitter_handle;
}

// Handle /start command
bot.command('start', async (ctx) => {
    await ctx.reply('Hello, I\'m Nuwa.');
});

// Handle /bind_twitter command
bot.command('bind_twitter', async (ctx) => {
    try {
        const telegramId = ctx.from.id.toString();

        // 检查环境变量
        if (!process.env.TWITTER_CLIENT_ID) {
            console.error('TWITTER_CLIENT_ID is not set');
            await ctx.reply('系统配置错误，请联系管理员。');
            return;
        }

        if (!process.env.NEXTAUTH_URL) {
            console.error('NEXTAUTH_URL is not set');
            await ctx.reply('系统配置错误，请联系管理员。');
            return;
        }

        // 检查是否已经绑定
        const twitterHandle = await checkTwitterBinding(telegramId);
        if (twitterHandle) {
            await ctx.reply(`您已经绑定了 Twitter 账号 @${twitterHandle}。如需重新绑定，请先使用 /unbind_twitter 命令解除绑定。`);
            return;
        }

        // 生成 PKCE 参数
        const { verifier, challenge } = generatePKCEChallenge();

        // 生成 state
        const state = crypto.randomBytes(32).toString('base64url');

        // 将 telegramId 和 verifier 存储到临时存储中（可以使用 Redis 或者内存缓存）
        // 这里简化处理，使用自定义格式的 state: telegramId.verifier.randomNonce
        const encodedState = `${telegramId}.${verifier}.${uuidv4()}`;

        // 构建 Twitter OAuth URL
        const twitterAuthUrl = new URL('https://twitter.com/i/oauth2/authorize');
        const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/twitter`;

        console.log('Building Twitter OAuth URL with:', {
            clientId: process.env.TWITTER_CLIENT_ID,
            redirectUri,
            state: encodedState,
            challenge
        });

        // 参数顺序与网站一致
        twitterAuthUrl.searchParams.append('client_id', process.env.TWITTER_CLIENT_ID);
        twitterAuthUrl.searchParams.append('scope', 'users.read tweet.read offline.access');
        twitterAuthUrl.searchParams.append('response_type', 'code');
        twitterAuthUrl.searchParams.append('redirect_uri', redirectUri);
        twitterAuthUrl.searchParams.append('state', encodedState);
        twitterAuthUrl.searchParams.append('code_challenge', challenge);
        twitterAuthUrl.searchParams.append('code_challenge_method', 'S256');

        const finalUrl = twitterAuthUrl.toString();
        console.log('Generated OAuth URL:', finalUrl);

        // 使用内联键盘按钮替代纯文本URL
        await ctx.reply(
            'Please click the button below to login to Twitter and authorize binding:',
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Login to Twitter', url: finalUrl }]
                    ]
                }
            }
        );
    } catch (error) {
        console.error('Error in bind_twitter command:', error);
        await ctx.reply('Sorry, an error occurred while processing the binding request. Please try again later.');
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