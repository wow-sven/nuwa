import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { CurrencyDollarIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { SessionKeyGuard, useCreateSessionKey, useCurrentSession } from "@roochnetwork/rooch-sdk-kit";
import { LoadingButton } from "./LoadingButton";
import { useState, useRef, useEffect } from "react";
import { useChannelMessageSend } from "../../../../hooks/use-channel-message-send";
import { useChannelJoin } from "../../../../hooks/use-channel-join";
import { useNetworkVariable } from "../../../../hooks/use-networks";
import { useAgentChat } from "../../../../contexts/AgentChatContext";
import { RoochAddress } from "@roochnetwork/rooch-sdk";

/**
 * Props for the MessageInput component
 */
interface MessageInputProps {
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
 * - Token transfer functionality
 */
export function MessageInput({
    messagesEndRef,
}: MessageInputProps) {
    const [inputMessage, setInputMessage] = useState("");
    const [showTokenForm, setShowTokenForm] = useState(false);
    const [tokenAmount, setTokenAmount] = useState("0.1");
    const [autoMentionAI, setAutoMentionAI] = useState(false);
    const [showMentionList, setShowMentionList] = useState(false);
    const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
    const [mentionSearchText, setMentionSearchText] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentions, setMentions] = useState<Array<{ id: string, text: string, type: 'user' | 'agent' }>>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const mentionListRef = useRef<HTMLDivElement>(null);

    const packageId = useNetworkVariable("packageId");
    const session = useCurrentSession()
    const { mutate: createSession } = useCreateSessionKey()
    const { agent, selectedChannel, members, isJoined, refetchJoinStatus, refetchJoinedAgent, refetchChannelMembers, refetchMessageCount, refetchMessages } = useAgentChat();

    // Message sending functionality
    const { mutateAsync: sendMessage, isPending: sendingMessage } = useChannelMessageSend();
    // Channel joining functionality
    const { mutateAsync: joinChannel, isPending: joiningChannel } = useChannelJoin();

    // TODO: remove this with sdk-kit export session config
    const sessionCfg = {
        appName: "Nuwa AI Agents",
        appUrl: "https://nuwa.rooch.io/",
        scopes: [`${packageId}::*::*`, `0x3::*::*`],
        maxInactiveInterval: 3600,
    }

    // Add auto-scroll effect
    useEffect(() => {
        if (showMentionList && mentionListRef.current) {
            const selectedElement = mentionListRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                const container = mentionListRef.current;
                const containerRect = container.getBoundingClientRect();
                const elementRect = selectedElement.getBoundingClientRect();

                // If the selected element is below the container bottom
                if (elementRect.bottom > containerRect.bottom) {
                    container.scrollTop += elementRect.bottom - containerRect.bottom;
                }
                // If the selected element is above the container top
                else if (elementRect.top < containerRect.top) {
                    container.scrollTop -= containerRect.top - elementRect.top;
                }
            }
        }
    }, [selectedIndex, showMentionList]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                mentionListRef.current &&
                !mentionListRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setShowMentionList(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    /**
     * Handle message sending and channel joining
     * If user hasn't joined the channel, join first
     * Then send the message and update the UI
     */
    const handleSendMessage = async (message: string) => {
        if ((message.trim() || mentions.length > 0) && selectedChannel && agent) {
            try {
                // 构建包含 mentions 的消息内容
                const mentionText = mentions.map(m => `@${m.text}`).join(' ');
                const fullMessage = `${mentionText} ${message}`.trim();

                // 如果显示转账表单，添加 payment 属性
                const messageData: any = {
                    channelId: selectedChannel,
                    content: fullMessage,
                    mentions: [...mentions.map(m => m.id), ...(autoMentionAI && agent.address ? [agent.address] : [])],
                    aiAddress: agent.address,
                };

                if (showTokenForm && parseFloat(tokenAmount) > 0) {
                    const rawAmount = (parseFloat(tokenAmount) * 100000000).toFixed(0);
                    messageData.payment = parseInt(rawAmount);
                    messageData.content = message;
                }

                await sendMessage(messageData);
                await refetchMessageCount();
                await refetchMessages();
                messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
                // Clear mentions and reset token form
                setMentions([]);
                setShowTokenForm(false);
                setTokenAmount("0.1");
            } catch (e) {
                console.log(e);
            }
        }
    };

    const handleAction = async () => {
        if (!session) {
            createSession(sessionCfg)
            return
        }

        if (!isJoined) {
            try {
                if (!selectedChannel) {
                    console.log('No channel selected');
                    return;
                }
                await joinChannel({ id: selectedChannel });
                await refetchJoinStatus();
                await refetchJoinedAgent();
                await refetchChannelMembers();
                return;
            } catch (e) {
                console.log(e);
                return;
            }
        }

        if (inputMessage.trim()) {
            handleSendMessage(inputMessage);
            setInputMessage("");
        }
    };

    const toggleTokenForm = () => {
        setShowTokenForm(!showTokenForm);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const cursorPosition = e.target.selectionStart || 0;
        const lastAtSymbol = value.lastIndexOf("@", cursorPosition);

        if (lastAtSymbol !== -1) {
            const searchText = value.slice(lastAtSymbol + 1, cursorPosition);
            setMentionSearchText(searchText);

            if (inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect();
                const textBeforeCursor = value.slice(0, cursorPosition);
                const tempSpan = document.createElement('span');
                tempSpan.style.visibility = 'hidden';
                tempSpan.style.position = 'absolute';
                tempSpan.style.whiteSpace = 'pre-wrap';
                tempSpan.style.font = window.getComputedStyle(inputRef.current).font;
                tempSpan.textContent = textBeforeCursor;
                document.body.appendChild(tempSpan);

                document.body.removeChild(tempSpan);

                // Calculate dropdown list position
                const itemHeight = 48; // Estimated height for each list item
                const maxVisibleItems = 4; // Maximum number of visible items
                const padding = 16; // List padding
                const searchLower = searchText.toLowerCase();
                const filteredCount = allMembers.filter(member =>
                    member.name?.toLowerCase().includes(searchLower) ||
                    member.username?.toLowerCase().includes(searchLower) ||
                    member.address.toLowerCase().includes(searchLower)
                ).length;

                const listHeight = Math.min(filteredCount * itemHeight + padding, maxVisibleItems * itemHeight + padding);
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                const shouldShowUp = spaceBelow < listHeight && spaceAbove > spaceBelow;

                setMentionPosition({
                    top: shouldShowUp
                        ? rect.top - listHeight
                        : rect.bottom,
                    left: rect.left
                });
            }

            setShowMentionList(true);
        } else {
            setShowMentionList(false);
        }

        setInputMessage(value);
    };

    const handleMentionSelect = (member: { address: string, name?: string, username?: string, isAgent?: boolean }) => {
        const displayName = member.username || member.name || member.address;

        // Add new mention
        setMentions(prev => [...prev, {
            id: member.address,
            text: displayName,
            type: member.isAgent ? 'agent' : 'user'
        }]);

        // Keep the text after @ symbol
        const cursorPosition = inputRef.current?.selectionStart || 0;
        const lastAtSymbol = inputMessage.lastIndexOf("@", cursorPosition);
        if (lastAtSymbol !== -1) {
            const textBeforeAt = inputMessage.slice(0, lastAtSymbol);
            const textAfterCursor = inputMessage.slice(cursorPosition);
            const newMessage = textBeforeAt + " " + textAfterCursor;
            setInputMessage(newMessage);
        }

        setShowMentionList(false);

        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleRemoveMention = (mentionId: string) => {
        setMentions(prev => prev.filter(m => m.id !== mentionId));
    };

    // Add agent to the member list
    const allMembers = members.map(member => {
        if (member.address === agent?.address) {
            return {
                ...member,
                name: agent.name,
                username: agent.username,
                avatar: agent.avatar || member.avatar,
                isAgent: true
            };
        }
        return {
            ...member,
            isAgent: false
        };
    });

    // Move agent to the top of the list
    const sortedMembers = [...members].sort((a, b) => {
        const aAddr = new RoochAddress(a.address).toHexAddress();
        const bAddr = new RoochAddress(b.address).toHexAddress();
        const agentAddr = new RoochAddress(agent?.address || '').toHexAddress();
        if (aAddr === agentAddr) return -1;
        if (bAddr === agentAddr) return 1;
        return 0;
    });

    // Filter member list based on search text
    const filteredMembers = sortedMembers.filter(member => {
        const searchLower = mentionSearchText.toLowerCase();
        return (
            (member.name?.toLowerCase().includes(searchLower) ||
                member.username?.toLowerCase().includes(searchLower) ||
                member.address.toLowerCase().includes(searchLower))
        );
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (showMentionList && filteredMembers.length > 0) {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev < filteredMembers.length - 1 ? prev + 1 : 0
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredMembers.length - 1
                    );
                    break;
                case "Enter":
                    e.preventDefault();
                    if (filteredMembers[selectedIndex]) {
                        handleMentionSelect(filteredMembers[selectedIndex]);
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    setShowMentionList(false);
                    setSelectedIndex(0);
                    break;
            }
        } else if (e.key === "Backspace" && inputMessage === "" && mentions.length > 0) {
            // When input is empty and there are tags, delete the last tag
            e.preventDefault();
            const lastMention = mentions[mentions.length - 1];
            handleRemoveMention(lastMention.id);
        }
    };

    if (!agent || !selectedChannel) {
        return null;
    }

    return (
        <div className="shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
            {/* Token Transfer Form */}
            {showTokenForm && isJoined && (
                <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Send RGAS to Agent ({agent.name || agent.username || agent.address.substring(0, 8) + '...' + agent.address.substring(agent.address.length - 6)})
                    </div>
                    <div className="flex space-x-3 items-end">
                        {/* Amount Input */}
                        <div className="flex-1">
                            <input
                                type="number"
                                value={tokenAmount}
                                onChange={(e) => setTokenAmount(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                onKeyPress={(e) => e.key === "Enter" && handleAction()}
                            />
                        </div>

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
                        <div className="flex flex-wrap gap-1 items-center w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500">
                            {mentions.map((mention) => (
                                <div
                                    key={mention.id}
                                    className={`inline-flex items-center text-xs px-2 py-1 rounded-full group relative cursor-pointer ${mention.type === 'agent'
                                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                        }`}
                                    onClick={() => handleRemoveMention(mention.id)}
                                >
                                    <span className="leading-none group-hover:invisible">@{mention.text}</span>
                                    <XMarkIcon className="w-3.5 h-3.5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:block" />
                                </div>
                            ))}
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={handleInputChange}
                                onKeyPress={(e) => e.key === "Enter" && handleAction()}
                                onKeyDown={handleKeyDown}
                                placeholder={mentions.length > 0 ? "" : "Type a message..."}
                                className="flex-1 bg-transparent outline-none text-sm ml-1"
                            />
                        </div>

                        {/* Mention List */}
                        {showMentionList && filteredMembers.length > 0 && (
                            <div
                                ref={mentionListRef}
                                className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-y-auto"
                                style={{
                                    top: mentionPosition.top,
                                    left: mentionPosition.left,
                                    minWidth: "200px",
                                    maxHeight: `${Math.min(filteredMembers.length * 48 + 16, 4 * 48 + 16)}px`
                                }}
                            >
                                {filteredMembers.map((member, index) => {
                                    const isAgent = new RoochAddress(member.address).toHexAddress() === new RoochAddress(agent?.address || '').toHexAddress();
                                    return (
                                        <div
                                            key={member.address}
                                            className={`px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                }`}
                                            onClick={() => {
                                                setSelectedIndex(index);
                                                handleMentionSelect(member);
                                            }}
                                        >
                                            <div className="font-medium flex items-center">
                                                {member.name || member.username || member.address}
                                                {isAgent && (
                                                    <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded font-semibold">
                                                        AI Agent
                                                    </span>
                                                )}
                                            </div>
                                            {member.name && member.username && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    @{member.username}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {agent.address && (
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
                                <span>Always @AI</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Send/Join button with session key guard */}
                <SessionKeyGuard onClick={handleAction}>
                    <LoadingButton
                        isPending={sendingMessage || joiningChannel}
                        className={isJoined ? '' : 'w-full'}
                        onClick={() => { }}
                        disabled={isJoined && !inputMessage.trim() && mentions.length === 0}
                    >
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