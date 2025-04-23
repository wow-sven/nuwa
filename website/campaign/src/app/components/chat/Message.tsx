import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UIMessage } from 'ai';
import { Avatar } from './message/Avatar';
import { MessageBubble } from './message/MessageBubble';
import { getMessageContainerClass, getMessageContentClass, getMessageBubbleClass } from './message/styles';

interface MessageProps {
    message: UIMessage;
}

export function Message({ message }: MessageProps) {
    const { role, parts } = message;

    return (
        <AnimatePresence>
            <motion.div
                data-testid={`message-${role}`}
                className="w-full mx-auto px-4 group/message"
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                data-role={role}
            >
                <div className={`flex gap-4 w-full ${getMessageContainerClass(role)}`}>
                    <Avatar role={role} />

                    <div className={`flex flex-col gap-4 ${getMessageContentClass(role)}`}>
                        <div className="flex flex-col gap-2 w-full">
                            {parts.map((part, i) => (
                                <div
                                    key={`${message.id}-${i}`}
                                    className={`flex flex-col gap-4 ${getMessageBubbleClass(role)}`}
                                >
                                    <MessageBubble
                                        part={{
                                            type: part.type,
                                            text: 'text' in part ? part.text : undefined,
                                            toolInvocation: 'toolInvocation' in part ? part.toolInvocation : undefined
                                        }}
                                        content={'text' in part ? part.text || '' : ''}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
} 