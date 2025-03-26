import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { CurrencyDollarIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { SessionKeyGuard, useCreateSessionKey, useCurrentSession } from "@roochnetwork/rooch-sdk-kit";
import { LoadingButton } from "./LoadingButton";
import { useState } from "react";
import { useChannelMessageSend } from "../../../../hooks/use-channel-message-send";
import { useChannelJoin } from "../../../../hooks/use-channel-join";
import useChannelMessageCount from "../../../../hooks/use-channel-message-count";
import useChannelJoinedStatus from "../../../../hooks/use-channel-joined-status";
import useChannelMessages from "../../../../hooks/use-channel-messages";
import { useNetworkVariable } from "../../../../hooks/use-networks";

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
    /** List of channel members */
    members?: Array<{ address: string, avatar: string }>;
}

/**
 * MessageInput component - Input area for sending messages
 * Features:
 * - Text input for message composition
 * - Send/Join button with loading state
 * - Session key guard for secure operations
 * - Enter key support for sending messages
 * - Integrated channel joining and message sending functionality
 * - Token transfer functionality
 */
export function MessageInput({
    channelId,
    agentAddress = "",
    messagesEndRef,
    members = []
}: MessageInputProps) {
    const [inputMessage, setInputMessage] = useState("");
    const [showTokenForm, setShowTokenForm] = useState(false);
    const [selectedReceiver, setSelectedReceiver] = useState("");
    const [tokenAmount, setTokenAmount] = useState("0.1");
    const [tokenType, setTokenType] = useState("RGAS");
    const [autoMentionAI, setAutoMentionAI] = useState(false);


    const packageId = useNetworkVariable("packageId");
    const session = useCurrentSession()
    const {mutate: createSession } = useCreateSessionKey()
    // Check if current user has joined the channel
    const { isJoined = false, refetch: refetchJoinStatus } = useChannelJoinedStatus(channelId);
    // Message sending functionality
    const { mutateAsync: sendMessage, isPending: sendingMessage } = useChannelMessageSend();
    // Channel joining functionality
    const { mutateAsync: joinChannel, isPending: joiningChannel } = useChannelJoin();
    // Get total message count and refetch function
    const { refetch: refetchMessageCount } = useChannelMessageCount(channelId);
    // TODO:
    // Fetch messages and provide refetch function
    const { refetch: refetchMsg } = useChannelMessages({
        channelId,
        page: 0,
        size: 100,
    });

    // TODO: remove this with sdk-kit export session config
    const sessionCfg = {
                appName: "Nuwa AI Agents",
                appUrl: "https://nuwa.rooch.io/",
                scopes: [`${packageId}::*::*`],
                maxInactiveInterval: 3600,
              }
    /**
     * Handle message sending and channel joining
     * If user hasn't joined the channel, join first
     * Then send the message and update the UI
     */
    const handleSendMessage = async (message: string) => {
        if (!isJoined) {
            try {
                await joinChannel({ id: channelId });
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
                    mentions: autoMentionAI && agentAddress ? [agentAddress] : [],
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

    /**
     * Handle token transfer
     */
    const handleTokenTransfer = async () => {
        if (!selectedReceiver || parseFloat(tokenAmount) <= 0) {
            return;
        }
        // TODO: imp this
        // Build transfer message content
        const transferMessage = `transfer::coin ${tokenAmount} ${tokenType} to ${selectedReceiver}`;

        try {
            await handleSendMessage(transferMessage);
            // Reset form and hide
            setShowTokenForm(false);
            setSelectedReceiver("");
            setTokenAmount("0.1");
        } catch (e) {
            console.log("Transfer failed:", e);
        }
    };

    const handleAction = () => {
        if (!session) {
            createSession(sessionCfg)
            return 
        }
        if (inputMessage.trim() && isJoined) {
            handleSendMessage(inputMessage);
            setInputMessage("");
        } else if (!isJoined) {
            handleSendMessage("");
        }
    };

    const toggleTokenForm = () => {
        setShowTokenForm(!showTokenForm);
        // If there are members, select the first one by default
        if (members.length > 0 && !selectedReceiver) {
            setSelectedReceiver(members[0].address);
        }
    };

    return (
        <div className="shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
            {/* Token Transfer Form */}
            {showTokenForm && isJoined && (
                <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                    <div className="flex space-x-3 items-end">
                        {/* Receiver Selection */}
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Receiver</label>
                            <select
                                value={selectedReceiver}
                                onChange={(e) => setSelectedReceiver(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                onKeyPress={(e) => e.key === "Enter" && handleTokenTransfer()}
                            >
                                <option value="">Select receiver</option>
                                {agentAddress && (
                                    <option value={agentAddress}>
                                        Agent ({agentAddress.substring(0, 8)}...{agentAddress.substring(agentAddress.length - 6)})
                                    </option>
                                )}
                                {members.map((member) => (
                                    <option key={member.address} value={member.address}>
                                        {member.address.substring(0, 8)}...{member.address.substring(member.address.length - 6)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Token Type Selection */}
                        <div className="w-1/5">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Token</label>
                            <select
                                value={tokenType}
                                onChange={(e) => setTokenType(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                onKeyPress={(e) => e.key === "Enter" && handleTokenTransfer()}
                            >
                                <option value="RGAS">RGAS</option>
                            </select>
                        </div>

                        {/* Amount Input */}
                        <div className="w-1/5">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                            <input
                                type="number"
                                min="0.000001"
                                step="0.000001"
                                value={tokenAmount}
                                onChange={(e) => setTokenAmount(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                onKeyPress={(e) => e.key === "Enter" && handleTokenTransfer()}
                            />
                        </div>

                        {/* Send button integrated into the form line */}
                        <SessionKeyGuard onClick={handleTokenTransfer}>
                            <button
                                className="h-10 px-4 rounded-lg bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                disabled={!selectedReceiver || parseFloat(tokenAmount) <= 0}
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </SessionKeyGuard>

                        {/* Close button */}
                        <button
                            onClick={() => setShowTokenForm(false)}
                            className="h-10 px-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex space-x-2">
                {/* Token Button - only shown when joined - now on the left side */}
                {isJoined && (
                    <SessionKeyGuard onClick={toggleTokenForm}>
                        <button
                            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <CurrencyDollarIcon className="w-5 h-5" />
                        </button>
                    </SessionKeyGuard>
                )}

                {/* Message input field - only shown when joined */}
                {isJoined && (
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleAction()}
                            placeholder="Type a message..."
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-24"
                        />
                        {agentAddress && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoMentionAI}
                                        onChange={(e) => setAutoMentionAI(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                </label>
                                <span>Talk to Agent</span>
                            </div>
                        )}
                    </div>
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