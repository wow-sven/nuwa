import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { tools } from './tools';
import { classifyUserMission, getMissionSystemPrompt, getDefaultSystemPrompt } from './mission-router';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, userInfo } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
    }

    // 获取用户最后一条消息
    const lastUserMessage = messages
        .filter((msg: any) => msg.role === 'user')
        .pop()?.content || '';

    // 使用路由功能确定用户想要执行的任务
    const classification = await classifyUserMission(lastUserMessage, userInfo || {});

    // 根据分类结果选择系统提示
    let systemPrompt;

    if (classification.confidence > 0.5) {
        // 如果置信度高，使用任务特定的系统提示
        systemPrompt = await getMissionSystemPrompt(classification.missionId, userInfo || {});
        console.log(`Selected mission: ${classification.missionId} with confidence: ${classification.confidence}`);
        console.log(`Reasoning: ${classification.reasoning}`);
    } else {
        // 如果置信度低，使用默认系统提示
        systemPrompt = await getDefaultSystemPrompt(userInfo || {});
        console.log('Using default system prompt due to low confidence');
    }

    const result = await streamText({
        model: openai('gpt-4o-mini'),
        messages,
        tools,
        system: systemPrompt,
        maxSteps: 5,
        toolChoice: 'auto',
        onError({ error }) {
            console.error('Stream error:', error);
        }
    });

    return result.toDataStreamResponse();
}