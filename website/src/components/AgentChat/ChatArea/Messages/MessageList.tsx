import { useRef, useEffect, useState, useCallback } from "react";
import { ChatMessage } from "./ChatMessage";
import { Message } from "../../../../types/channel";
import useChannelMessageCount from "../../../../hooks/use-channel-message-count";
import useChannelMessages from "../../../../hooks/use-channel-messages";
import { useAgentChat } from "../../../../contexts/AgentChatContext";

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

const MESSAGES_PER_PAGE = 50;

/**
 * MessageList component - Displays the list of chat messages
 * Features:
 * - Auto-scrolling to latest messages
 * - Different styles for user and AI messages
 * - Message timestamps and sender information
 * - Internal user/AI message detection
 * - Integrated message fetching
 * - Infinite scroll loading
 */
export function MessageList({
    channelId,
    agentName,
    agentId,
    agentAddress
}: MessageListProps) {
    const { currentAddress } = useAgentChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Message state management
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const [loadedPages, setLoadedPages] = useState<number[]>([]);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [newMessageCount, setNewMessageCount] = useState(0);
    const [lastMessageCount, setLastMessageCount] = useState(0);
    const [reachedTop, setReachedTop] = useState(false);
    const [isLoadingMoreUp, setIsLoadingMoreUp] = useState(false);
    const [lastScrollHeight, setLastScrollHeight] = useState(0);
    const [autoRefreshTrigger, setAutoRefreshTrigger] = useState(0);

    // Ensure valid channel ID
    const validChannelId = channelId && channelId.length > 0 ? channelId : undefined;

    // Get total message count
    const { messageCount } = useChannelMessageCount(validChannelId);

    // Calculate latest page - correct calculation method
    const latestPage = messageCount <= 0 ? 0 : Math.floor((messageCount - 1) / MESSAGES_PER_PAGE);

    // State: Current querying page
    const [currentQueryPage, setCurrentQueryPage] = useState<number | null>(null);

    // Use custom hook to get messages for specific page
    const {
        messages: pageMessages,
        isPending: isMessagesLoading,
        refetch: refetchMessages,
        isError
    } = useChannelMessages({
        channelId: validChannelId,
        page: currentQueryPage !== null ? currentQueryPage : latestPage,
        size: MESSAGES_PER_PAGE,
    });

    // Optimization 1: Add a debounce function to control loading frequency
    const debounce = useCallback((fn: Function, ms = 300) => {
        let timeoutId: ReturnType<typeof setTimeout>;
        return function (this: any, ...args: any[]) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), ms);
        };
    }, []);

    // Optimization 2: Use a smarter loading trigger function
    const triggerPageLoad = useCallback((page: number) => {
        // If page is already loaded or currently loading, don't trigger again
        if (loadedPages.includes(page) || currentQueryPage === page) {
            // console.log(`Page ${page} already loaded or currently loading, skipping request`);
            return false;
        }
        // console.log(`Triggering page ${page} load`);
        setCurrentQueryPage(page);
        return true;
    }, [loadedPages, currentQueryPage]);

    // Optimization 3: More efficiently detect pages that need loading
    const loadLatestMessages = useCallback(() => {
        if (!validChannelId) return;

        if (messageCount <= 0) {
            // If no messages and page 0 hasn't been loaded, try loading it
            if (!loadedPages.includes(0) && currentQueryPage !== 0) {
                // console.log('No messages, trying to load page 0');
                triggerPageLoad(0);
            }
            return;
        }

        // Has messages, calculate and load latest page
        if (currentQueryPage === null) {
            // console.log(`Loading latest page: ${latestPage}`);
            triggerPageLoad(latestPage);

            // Add: Check if earlier pages should be loaded
            setTimeout(() => {
                // If there are multiple pages, ensure complete history is loaded
                if (latestPage > 0 && allMessages.length < Math.min(messageCount, 20)) {
                    // console.log(`Detected need to load earlier pages, currently only loaded ${allMessages.length} messages`);
                    // Load pages from previous to latest, going backwards
                    for (let page = latestPage - 1; page >= Math.max(0, latestPage - 3); page--) {
                        if (!loadedPages.includes(page)) {
                            // console.log(`Planning to load earlier page: ${page}`);
                            setTimeout(() => triggerPageLoad(page), (latestPage - page) * 200);
                        }
                    }
                }
            }, 1000); // Wait 1 second to ensure latest page is loaded
        }
    }, [validChannelId, messageCount, loadedPages, currentQueryPage, latestPage, triggerPageLoad, allMessages.length]);

    // Optimization 4: Replace auto-loading effect, remove setTimeout
    useEffect(() => {
        if (validChannelId && autoRefreshTrigger > 0 && currentQueryPage === null) {
            // console.log(`Preparing to load messages: channel=${validChannelId}, latest page=${latestPage}, total messages=${messageCount}`);
            loadLatestMessages();
        }
    }, [validChannelId, autoRefreshTrigger, currentQueryPage, loadLatestMessages]);

    // Optimization 5: More effective error handling and retry
    useEffect(() => {
        if (isError && validChannelId) {
            // console.error("Error occurred while querying messages, will retry in 1 second");

            // Use debounce for error retry to avoid frequent triggers
            const retryTimer = setTimeout(() => {
                if (currentQueryPage !== null) {
                    // console.log("Auto-retrying to load page:", currentQueryPage);
                    // Reset page query to trigger new request
                    setCurrentQueryPage(null);
                    setTimeout(() => triggerPageLoad(currentQueryPage), 100);
                } else if (messageCount > 0) {
                    // console.log("Auto-retrying to load latest page:", latestPage);
                    triggerPageLoad(latestPage);
                }
            }, 1000);

            return () => clearTimeout(retryTimer);
        }
    }, [isError, validChannelId, currentQueryPage, messageCount, latestPage, triggerPageLoad]);

    // Optimization 6: Improve new message detection and loading logic
    useEffect(() => {
        // First load doesn't count
        if (lastMessageCount === 0) {
            setLastMessageCount(messageCount);
            return;
        }

        // Detect new messages
        if (messageCount > lastMessageCount) {
            const newCount = messageCount - lastMessageCount;

            // When user is not at bottom, only update counter
            if (!isAtBottom) {
                setNewMessageCount(prev => prev + newCount);

                // Only trigger page load when new messages might be on new page
                const newLatestPage = Math.floor((messageCount - 1) / MESSAGES_PER_PAGE);
                if (newLatestPage > Math.max(...loadedPages, 0)) {
                    // console.log(`Detected messages on new page, loading page ${newLatestPage}`);
                    triggerPageLoad(newLatestPage);
                } else {
                    // Otherwise just refresh current page
                    // console.log("Refreshing messages on current latest page");
                    refetchMessages();
                }
            } else {
                // User is at bottom, directly load latest messages and maintain scroll
                // console.log("User is at bottom, loading latest messages");

                // Check if new page needs to be loaded
                const newLatestPage = Math.floor((messageCount - 1) / MESSAGES_PER_PAGE);
                if (newLatestPage > Math.max(...loadedPages, 0)) {
                    triggerPageLoad(newLatestPage);
                } else {
                    refetchMessages();
                }
            }
        }

        setLastMessageCount(messageCount);
    }, [messageCount, isAtBottom, lastMessageCount, loadedPages, refetchMessages, triggerPageLoad]);

    // Optimization 7: Improve scroll loading history messages logic
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        // Use debounce for scroll events to avoid too frequent checks
        const debouncedScrollHandler = debounce(() => {
            // Check if near bottom
            const isNearBottom =
                container.scrollHeight - container.scrollTop - container.clientHeight < 100;

            setIsAtBottom(isNearBottom);
            setShowScrollToBottom(!isNearBottom);

            // Load earlier messages logic
            if (container.scrollTop < 50 && !isLoadingMoreUp && !reachedTop && loadedPages.length > 0) {
                const oldestLoadedPage = Math.min(...loadedPages);

                // Only load if there are earlier pages
                if (oldestLoadedPage > 0) {
                    const nextPageToLoad = oldestLoadedPage - 1;

                    // Trigger loading
                    if (triggerPageLoad(nextPageToLoad)) {
                        setIsLoadingMoreUp(true);
                        setLastScrollHeight(container.scrollHeight);
                    }
                } else if (oldestLoadedPage === 0) {
                    // Already at first page, mark as reached top
                    setReachedTop(true);
                }
            }
        }, 150); // 150ms debounce time

        const handleScroll = () => debouncedScrollHandler();
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [loadedPages, isLoadingMoreUp, reachedTop, debounce, triggerPageLoad]);

    // Add: Initial load check - ensure enough messages are loaded
    useEffect(() => {
        // Only execute when messages are loaded and count is significantly less than expected
        if (
            validChannelId &&
            !currentQueryPage &&
            loadedPages.length > 0 &&
            messageCount > 20 &&
            allMessages.length < 20 &&
            !isMessagesLoading
        ) {
            // console.log(`Initial load check: loaded ${allMessages.length} messages, total ${messageCount}, trying to load more pages`);

            // Check which pages are missing
            const missingPages = [];
            for (let i = Math.max(0, latestPage - 2); i <= latestPage; i++) {
                if (!loadedPages.includes(i)) {
                    missingPages.push(i);
                }
            }

            // Load missing pages
            if (missingPages.length > 0) {
                // console.log(`Found missing pages: ${missingPages.join(', ')}`);
                missingPages.forEach((page, index) => {
                    setTimeout(() => triggerPageLoad(page), index * 300);
                });
            } else {
                // If latest pages are loaded but message count is still insufficient, try loading earlier pages
                const earliestPage = Math.max(0, Math.min(...loadedPages) - 1);
                if (earliestPage >= 0 && !loadedPages.includes(earliestPage)) {
                    // console.log(`Trying to load earlier page: ${earliestPage}`);
                    triggerPageLoad(earliestPage);
                }
            }
        }
    }, [validChannelId, allMessages.length, messageCount, loadedPages, currentQueryPage, latestPage, isMessagesLoading, triggerPageLoad]);

    // Handle channel ID changes
    useEffect(() => {
        if (!channelId) return;

        // Reset all states
        setAllMessages([]);
        setLoadedPages([]);
        setIsAtBottom(true);
        setShowScrollToBottom(false);
        setNewMessageCount(0);
        setLastMessageCount(0);
        setReachedTop(false);
        setIsLoadingMoreUp(false);
        setLastScrollHeight(0);
        setCurrentQueryPage(null);

        // 触发初始加载
        setAutoRefreshTrigger(prev => prev + 1);
    }, [channelId]);

    // 添加初始加载效果
    useEffect(() => {
        if (validChannelId) {
            // 立即触发一次加载
            setAutoRefreshTrigger(prev => prev + 1);

            // 设置一个定时器，确保在 messageCount 更新后再次触发
            const timer = setTimeout(() => {
                if (messageCount > 0) {
                    const latestPage = Math.floor((messageCount - 1) / MESSAGES_PER_PAGE);
                    setCurrentQueryPage(latestPage);
                } else {
                    setCurrentQueryPage(0);
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [validChannelId, messageCount]);

    // 修改自动加载逻辑
    useEffect(() => {
        if (validChannelId && autoRefreshTrigger > 0) {
            // 确保在 messageCount 更新后再设置页面
            if (messageCount > 0) {
                const latestPage = Math.floor((messageCount - 1) / MESSAGES_PER_PAGE);
                setCurrentQueryPage(latestPage);
            } else {
                setCurrentQueryPage(0);
            }
        }
    }, [validChannelId, autoRefreshTrigger, messageCount]);

    // 优化消息加载状态显示
    useEffect(() => {
        if (pageMessages && pageMessages.length > 0 && currentQueryPage !== null) {
            // Add current page to loaded pages list
            if (!loadedPages.includes(currentQueryPage)) {
                setLoadedPages(prev => [...prev, currentQueryPage]);
            }

            // Update message list, avoid duplicates
            setAllMessages(prev => {
                const existingIndices = new Set(prev.map(m => m.index));
                const newMessages = pageMessages.filter(msg => !existingIndices.has(msg.index));
                return [...prev, ...newMessages].sort((a, b) => a.index - b.index);
            });

            // Reset query page after loading is complete
            setCurrentQueryPage(null);
            setIsLoadingMoreUp(false);
        } else if (pageMessages && pageMessages.length === 0 && currentQueryPage !== null) {
            // Mark as reached top (if it's page 0)
            if (currentQueryPage === 0) {
                setReachedTop(true);
            }

            // Add current page to loaded pages list
            if (!loadedPages.includes(currentQueryPage)) {
                setLoadedPages(prev => [...prev, currentQueryPage]);
            }

            // Reset query page
            setCurrentQueryPage(null);
            setIsLoadingMoreUp(false);
        }
    }, [pageMessages, currentQueryPage, loadedPages]);

    // Scroll to bottom (when receiving new messages)
    useEffect(() => {
        if (isAtBottom && messagesEndRef.current && !isLoadingMoreUp) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [allMessages, isAtBottom, isLoadingMoreUp]);

    // Maintain scroll position (when loading earlier messages)
    useEffect(() => {
        if (!isLoadingMoreUp || !messagesContainerRef.current) return;

        const container = messagesContainerRef.current;

        if (lastScrollHeight > 0 && container.scrollHeight > lastScrollHeight) {
            container.scrollTop = container.scrollHeight - lastScrollHeight;
        }
    }, [allMessages, isLoadingMoreUp, lastScrollHeight]);

    // Listen for scroll events
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            // Determine if near bottom
            const isNearBottom =
                container.scrollHeight - container.scrollTop - container.clientHeight < 100;

            setIsAtBottom(isNearBottom);
            setShowScrollToBottom(!isNearBottom);

            // Load more old messages when reaching top
            if (container.scrollTop < 50 && !isLoadingMoreUp && !reachedTop && loadedPages.length > 0) {
                const oldestLoadedPage = Math.min(...loadedPages);

                // Only load if there are earlier pages available
                if (oldestLoadedPage > 0) {
                    const nextPageToLoad = oldestLoadedPage - 1;

                    // Prevent loading the same page repeatedly
                    if (!loadedPages.includes(nextPageToLoad)) {
                        // console.log(`Loading earlier messages: page ${nextPageToLoad}`);
                        setIsLoadingMoreUp(true);
                        setLastScrollHeight(container.scrollHeight);
                        setCurrentQueryPage(nextPageToLoad);
                    }
                }
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [loadedPages, isLoadingMoreUp, reachedTop]);

    // Detect new messages and update counter
    useEffect(() => {
        // First load doesn't count
        if (lastMessageCount === 0) {
            setLastMessageCount(messageCount);
            return;
        }

        // If there are new messages and user is not at bottom, show notification
        if (messageCount > lastMessageCount && !isAtBottom) {
            const newCount = messageCount - lastMessageCount;
            setNewMessageCount(prev => prev + newCount);
            // Refresh latest page messages
            if (!loadedPages.includes(latestPage)) {
                setCurrentQueryPage(latestPage);
            } else {
                refetchMessages();
            }
        } else if (messageCount > lastMessageCount && isAtBottom) {
            // User is at bottom, directly refresh latest messages
            if (!loadedPages.includes(latestPage)) {
                setCurrentQueryPage(latestPage);
            } else {
                refetchMessages();
            }
        }

        setLastMessageCount(messageCount);
    }, [messageCount, isAtBottom, lastMessageCount, latestPage, loadedPages, refetchMessages]);

    // Handler for scrolling to bottom
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            setIsAtBottom(true);
            setShowScrollToBottom(false);
            setNewMessageCount(0);
        }
    }, []);

    // Determine message sender type
    const isCurrentUser = useCallback((message: Message) => {
        return message.sender === currentAddress;
    }, [currentAddress]);

    const isAI = useCallback((message: Message) => {
        return message.sender === agentAddress;
    }, [agentAddress]);

    // Manually trigger loading (internal use, no button exposed)
    const triggerLoad = useCallback(() => {
        setAutoRefreshTrigger(prev => prev + 1);
    }, []);

    return (
        <div ref={messagesContainerRef} className="h-full overflow-y-auto p-4 space-y-4 relative">
            {/* Top loading status */}
            {isLoadingMoreUp && (
                <div className="text-center text-gray-500 py-2">
                    Loading more messages...
                </div>
            )}

            {/* Reached top notification */}
            {reachedTop && !isLoadingMoreUp && (
                <div className="text-center text-gray-500 py-2">
                    This is the beginning of the conversation
                </div>
            )}

            {/* Message loading status */}
            {allMessages.length === 0 && (isMessagesLoading || currentQueryPage !== null) && (
                <div className="flex justify-center py-4 flex-col items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mb-2"></div>
                    <div className="text-gray-500">Loading messages...</div>
                </div>
            )}

            {/* Message list */}
            {allMessages.length === 0 && !isMessagesLoading && currentQueryPage === null ? (
                <div className="text-center text-gray-500 py-2">
                    No messages yet, start chatting!
                </div>
            ) : (
                allMessages.map((message) => (
                    <ChatMessage
                        key={`${message.index}-${message.channel_id}`}
                        message={message}
                        isCurrentUser={isCurrentUser(message)}
                        isAI={isAI(message)}
                        agentName={agentName}
                        agentId={agentId}
                        messages={allMessages}
                    />
                ))
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />

            {/* Scroll to bottom button */}
            {showScrollToBottom && (
                <button
                    onClick={scrollToBottom}
                    className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors z-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>{newMessageCount > 0 ? `${newMessageCount} new messages` : "Scroll to bottom"}</span>
                </button>
            )}
        </div>
    );
} 