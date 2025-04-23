import React from 'react';
import { MessageBubbleProps } from './types';
import { MessageContent } from './MessageContent';

export const MessageBubble: React.FC<MessageBubbleProps> = ({ part, content }) => {
    return (
        <div className="flex flex-col gap-4">
            <MessageContent part={part} />
        </div>
    );
}; 