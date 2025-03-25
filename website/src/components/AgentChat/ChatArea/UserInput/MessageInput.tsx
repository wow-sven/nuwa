import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { SessionKeyGuard } from "@roochnetwork/rooch-sdk-kit";
import { LoadingButton } from "./LoadingButton";
import { useState } from "react";
import { useChannelMessageSend } from "../../../../hooks/use-channel-message-send";
import { useChannelJoin } from "../../../../hooks/use-channel-join";
import useChannelMessageCount from "../../../../hooks/use-channel-message-count";
import useChannelJoinedStatus from "../../../../hooks/use-channel-joined-status";
import useChannelMessages from "../../../../hooks/use-channel-messages";

/**
 * Props for the MessageInput component
 */
interface MessageInputProps {
    /** Channel ID */
    channelId: string;
    /** Agent address for AI communication */
    agentAddress?: string;
    /** Ref to scroll to end of messages */
    messagesEndRef?: React.RefObject<HTMLDivElement>;
}

/**
 * MessageInput component - Input area for sending messages
 * Features:
 * - Text input for message composition
 * - Send/Join button with loading state
 * - Session key guard for secure operations
 * - Enter key support for sending messages
 * - Integrated channel joining and message sending functionality
 */
export function MessageInput({
    channelId,
    agentAddress = "",
    messagesEndRef
}: MessageInputProps) {
    const [inputMessage, setInputMessage] = useState("");

    // Check if current user has joined the channel
    const { isJoined = false, refetch: refetchJoinStatus } = useChannelJoinedStatus(channelId);
    // Message sending functionality
    const { mutateAsync: sendMessage, isPending: sendingMessage } = useChannelMessageSend();
    // Channel joining functionality
    const { mutateAsync: joinChannel, isPending: joiningChannel } = useChannelJoin();
    // Get total message count and refetch function
    const { refetch: refetchMessageCount } = useChannelMessageCount(channelId);
    // Fetch messages and provide refetch function
    const { refetch: refetchMsg } = useChannelMessages({
        channelId,
        page: 0,
        size: 100,
    });
    console.log(channelId);
    /**
     * Handle message sending and channel joining
     * If user hasn't joined the channel, join first
     * Then send the message and update the UI
     */
    const handleSendMessage = async (message: string) => {
        if (!isJoined) {
            try {
                await joinChannel({ address: channelId });
                await refetchJoinStatus();
            } catch (e) {
                console.log(e);
            }
        }

        if (message.trim()) {
            try {
                await sendMessage({
                    channelId,
                    content: message,
                    mentions: [],
                    aiAddress: agentAddress,
                });
                await refetchMessageCount();
                await refetchMsg();
                messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
            } catch (e) {
                console.log(e);
            }
        }
    };

    const handleAction = () => {
        if (inputMessage.trim() && isJoined) {
            handleSendMessage(inputMessage);
            setInputMessage("");
        } else if (!isJoined) {
            handleSendMessage("");
        }
    };

    return (
        <div className="shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
                {/* Message input field - only shown when joined */}
                {isJoined && (
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAction()}
                        placeholder="Type a message..."
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                )}
                {/* Send/Join button with session key guard */}
                <SessionKeyGuard onClick={handleAction}>
                    <LoadingButton isPending={sendingMessage || joiningChannel} className={isJoined ? '' : 'w-full'} onClick={() => { }}>
                        {
                            isJoined ? (
                                <PaperAirplaneIcon className="w-5 h-5" />
                            ) : (<>Join</>)
                        }
                    </LoadingButton>
                </SessionKeyGuard>
            </div>
        </div>
    );
} 