import { Message as MessageComponent } from './Message';
import { Greeting } from './Greeting';
import { LoadingDots } from './LoadingDots';
import { Message } from '@ai-sdk/react';

interface MessageContainerProps {
    messages: Message[];
    status: string;
    messagesContainerRef: React.RefObject<HTMLDivElement>;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    onRetry?: () => void;
}

export function MessageContainer({
    messages,
    status,
    messagesContainerRef,
    messagesEndRef,
    onRetry
}: MessageContainerProps) {
    return (
        <div
            ref={messagesContainerRef}
            role="log"
            aria-live="polite"
            className={`flex-1 p-4 space-y-4 bg-white ${messages.length > 0 ? 'overflow-y-auto' : 'overflow-hidden'}`}
        >
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <Greeting />
                </div>
            ) : (
                <>
                    {messages.map((message) => (
                        <MessageComponent
                            key={message.id}
                            message={message as any}
                        />
                    ))}
                    {(status === 'streaming' || status === 'submitted') && (
                        <div className="flex items-center justify-start gap-4 px-4">
                            <div className="size-10 flex items-center rounded-full justify-center shrink-0">
                                {status === 'submitted' && (
                                    <img
                                        src="/nuwa.svg"
                                        alt="Nuwa Logo"
                                        className="size-6"
                                    />
                                )}
                            </div>
                            <div className="flex items-center justify-center">
                                <LoadingDots />
                            </div>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="flex items-center justify-start gap-4 px-4">
                            <div className="size-10 flex items-center rounded-full justify-center shrink-0">
                                <img
                                    src="/nuwa.svg"
                                    alt="Nuwa Logo"
                                    className="size-6"
                                />
                            </div>
                            <div className="flex flex-col gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>There was an error, please try again</span>
                                </div>
                                {onRetry && (
                                    <button
                                        onClick={onRetry}
                                        className="self-start mt-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md transition-colors"
                                    >
                                        Retry
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
            <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
        </div>
    );
} 