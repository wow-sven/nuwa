import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { tools } from './tools';
import { getIrisSystemPrompt } from '../systemPrompts/iris-agent';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, userInfo } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
    }

    // Generate system prompt using user information passed from client
    const systemPrompt = await getIrisSystemPrompt(userInfo || {});

    const result = await streamText({
        model: openai('gpt-4o'),
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