import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { tools } from './tools';
import { classifyUserMission, getMissionSystemPrompt, getDefaultSystemPrompt } from './mission-router';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Add a new interface for message classification
export async function GET(req: Request) {
    // Get message content from request URL
    const url = new URL(req.url);
    const message = url.searchParams.get('message');
    const userName = url.searchParams.get('userName') || 'visitor';
    const twitterHandle = url.searchParams.get('twitterHandle') || 'visitor';

    const userInfo = {
        name: userName,
        twitterHandle: twitterHandle
    };

    if (!message) {
        return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Classify the message
    const classification = await classifyUserMission(message, userInfo);
    console.log('classification:', JSON.stringify(classification, null, 2));

    // Return classification result
    return NextResponse.json({
        missionId: classification.missionId,
        confidence: classification.confidence,
        reasoning: classification.reasoning
    });
}

export async function POST(req: Request) {
    const { messages, userInfo, classifiedMissionId } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
    }

    // Get the last user message
    const lastUserMessage = messages
        .filter((msg: any) => msg.role === 'user')
        .pop()?.content || '';

    let systemPrompt;

    if (classifiedMissionId) {
        // If already classified, use the specific system prompt
        systemPrompt = await getMissionSystemPrompt(classifiedMissionId, userInfo || {});
    } else {
        // If confidence is low, use default system prompt
        systemPrompt = await getDefaultSystemPrompt(userInfo || {});
    }

    const result = await streamText({
        model: openai('gpt-4o-mini'),
        messages,
        tools,
        system: systemPrompt,
        maxSteps: 50,
        toolChoice: 'auto',
        onError() { }
    });

    return result.toDataStreamResponse();
}