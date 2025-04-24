import { Context } from 'telegraf';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { tools } from '../chat/tools';

/**
 * 生成AI响应并发送给用户
 * @param ctx Telegram上下文
 * @param history 对话历史
 * @param systemPrompt 系统提示
 * @returns AI响应文本
 */
export async function generateAndSendAIResponse(
    ctx: Context,
    history: Array<{ role: 'user' | 'assistant', content: string }>,
    systemPrompt: string
): Promise<string> {
    // 使用generateText生成响应
    const result = await generateText({
        model: openai('gpt-4o-mini'),
        messages: history,
        tools,
        system: systemPrompt,
        maxSteps: 5,
        toolChoice: 'auto'
    });

    // 获取AI响应
    const aiResponse = await result.text;

    // 添加AI响应到历史记录
    history.push({ role: 'assistant', content: aiResponse });

    // 发送响应给用户
    await ctx.reply(aiResponse, { parse_mode: 'HTML' });

    return aiResponse;
} 