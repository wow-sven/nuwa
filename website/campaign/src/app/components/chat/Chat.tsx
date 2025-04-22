'use client'

import { useChat } from '@ai-sdk/react';
import { useScrollToBottom } from './useScrollToBottom';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Missions } from './Missions';
import { MessageContainer } from './MessageContainer';
import { InputContainer } from './InputContainer';
import DotExpandButton from './DotExpandButton';

export function Chat() {
    const { data: session } = useSession();
    const userInfo = {
        name: session?.user?.name || "visitor",
        twitterHandle: session?.user?.twitterHandle || "visitor"
    };

    // 保存最后一条用户消息，用于重试
    const lastUserMessageRef = useRef<string>('');

    const { messages, input, handleInputChange, handleSubmit, status, append, setMessages } = useChat({
        body: {
            userInfo: userInfo
        }
    });
    const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
    const [showGridCards, setShowGridCards] = useState(false);

    const handleSelectSuggestion = (suggestion: string) => {
        console.log("handleSelectSuggestion called with:", suggestion);
        if (status === 'streaming') {
            console.log("Ignoring suggestion because status is streaming");
            return;
        }
        console.log("Appending suggestion to chat");
        lastUserMessageRef.current = suggestion;
        append({ role: 'user', content: suggestion });
    };

    const handleInputChangeWrapper = (value: string) => {
        handleInputChange({ target: { value } } as any);
    };

    const handleShowGridCards = () => {
        setShowGridCards(true);
    };

    const handleCloseGridCards = () => {
        setShowGridCards(false);
    };

    const handleNewChat = () => {
        if (status === 'streaming') return;
        setMessages([]);
        handleInputChangeWrapper('');
        lastUserMessageRef.current = '';
    };

    // 处理表单提交，保存最后一条用户消息
    const handleSubmitWrapper = (e: React.FormEvent<HTMLFormElement>) => {
        if (input.trim()) {
            lastUserMessageRef.current = input;
        }
        handleSubmit(e);
    };

    // 重试功能
    const handleRetry = () => {
        if (lastUserMessageRef.current) {
            // 移除最后一条消息（通常是错误消息）
            if (messages.length > 0) {
                setMessages(messages.slice(0, -1));
            }
            // 重新发送最后一条用户消息
            append({ role: 'user', content: lastUserMessageRef.current });
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-background rounded-xl">
            <AnimatePresence mode="wait">
                {showGridCards ? (
                    <Missions
                        showGridCards={showGridCards}
                        onCloseGridCards={handleCloseGridCards}
                        onSelectSuggestion={handleSelectSuggestion}
                        onShowGridCards={handleShowGridCards}
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex flex-col h-full"
                    >
                        <div className="flex flex-col h-full">
                            {messages.length > 0 && status !== 'streaming' && (
                                <div className="flex justify-end p-2">
                                    <DotExpandButton
                                        text="Start New Chat"
                                        onClick={handleNewChat}
                                    />
                                </div>
                            )}
                            <MessageContainer
                                messages={messages}
                                status={status}
                                messagesContainerRef={messagesContainerRef as React.RefObject<HTMLDivElement>}
                                messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
                                onRetry={handleRetry}
                            />
                            <div className="p-4 space-y-4">
                                {messages.length === 0 && (
                                    <Missions
                                        showGridCards={showGridCards}
                                        onCloseGridCards={handleCloseGridCards}
                                        onSelectSuggestion={handleSelectSuggestion}
                                        onShowGridCards={handleShowGridCards}
                                    />
                                )}
                                <InputContainer
                                    input={input}
                                    onInputChange={handleInputChangeWrapper}
                                    onSubmit={handleSubmitWrapper}
                                    isStreaming={status === 'streaming'}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 