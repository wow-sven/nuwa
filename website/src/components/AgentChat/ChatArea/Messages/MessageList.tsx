import { useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { Message } from "../../../../types/channel";
import { useCurrentAddress } from "@roochnetwork/rooch-sdk-kit";
import useChannelMessageCount from "../../../../hooks/use-channel-message-count";
import useChannelMessages from "../../../../hooks/use-channel-messages";

/**
 * Props for the MessageList component
 */
interface MessageListProps {
    /** Channel ID */
    channelId: string;
    /** Name of the current agent */
    agentName?: string;
    /** ID of the current agent */
    agentId?: string;
    /** Address of the agent for identifying AI messages */
    agentAddress?: string;
}

/**
 * MessageList component - Displays the list of chat messages
 * Features:
 * - Auto-scrolling to latest messages
 * - Different styles for user and AI messages
 * - Message timestamps and sender information
 * - Internal user/AI message detection
 * - Integrated message fetching
 */
export function MessageList({
    channelId,
    agentName,
    agentId,
    agentAddress
}: MessageListProps) {
    const address = useCurrentAddress();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get total message count
    const { messageCount } = useChannelMessageCount(channelId);

    // Calculate initial page number for message pagination
    const initialPage = Math.max(0, Math.ceil(messageCount / 100) - 1);

    // Fetch messages for the current page
    const { messages } = useChannelMessages({
        channelId,
        page: initialPage,
        size: 100,
    });

    /**
     * Check if a message was sent by the current user
     * @param message The message to check
     * @returns boolean indicating if the message was sent by current user
     */
    const isCurrentUser = (message: Message) => {
        return message.sender === address?.genRoochAddress().toHexAddress();
    };

    /**
     * Check if a message was sent by the AI agent
     * @param message The message to check
     * @returns boolean indicating if the message was sent by AI
     */
    const isAI = (message: Message) => {
        return message.sender === agentAddress;
    };

    return (
        <div className="h-full overflow-y-auto p-4 space-y-4">
            {/* Render each message with appropriate styling */}
            {messages.map((message) => (
                <ChatMessage
                    key={`${message.index}-${message.channel_id}`}
                    message={message}
                    isCurrentUser={isCurrentUser(message)}
                    isAI={isAI(message)}
                    agentName={agentName}
                    agentId={agentId}
                />
            ))}
            {/* Scroll anchor for auto-scrolling */}
            <div ref={messagesEndRef} />
        </div>
    );
} 