import { useRef, useEffect, useState, useCallback } from "react";
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
    const address = useCurrentAddress();
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

    // 优化1: 增加一个防抖函数来控制加载频率
    const debounce = useCallback((fn: Function, ms = 300) => {
        let timeoutId: ReturnType<typeof setTimeout>;
        return function (this: any, ...args: any[]) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), ms);
        };
    }, []);

    // 优化2: 使用一个更智能的加载触发函数
    const triggerPageLoad = useCallback((page: number) => {
        // 如果页面已经加载过，或者正在加载中，不再重复触发
        if (loadedPages.includes(page) || currentQueryPage === page) {
            console.log(`页面${page}已加载或正在加载中，跳过请求`);
            return false;
        }
        console.log(`触发页面${page}加载`);
        setCurrentQueryPage(page);
        return true;
    }, [loadedPages, currentQueryPage]);

    // 优化3: 更高效地检测需要加载的页面
    const loadLatestMessages = useCallback(() => {
        if (!validChannelId) return;

        if (messageCount <= 0) {
            // 如果没有消息，且还没加载过页面0，才尝试加载
            if (!loadedPages.includes(0) && currentQueryPage !== 0) {
                console.log('没有消息，尝试加载页面0');
                triggerPageLoad(0);
            }
            return;
        }

        // 有消息，计算最新页面并加载
        if (currentQueryPage === null) {
            console.log(`加载最新页面：${latestPage}`);
            triggerPageLoad(latestPage);

            // 添加：检查是否应该加载更早的页面
            setTimeout(() => {
                // 如果有多页消息，确保加载完整历史
                if (latestPage > 0 && allMessages.length < Math.min(messageCount, 20)) {
                    console.log(`检测到需要加载更早的页面，当前仅加载了 ${allMessages.length} 条消息`);
                    // 从最新页的前一页开始向前加载
                    for (let page = latestPage - 1; page >= Math.max(0, latestPage - 3); page--) {
                        if (!loadedPages.includes(page)) {
                            console.log(`计划加载更早的页面: ${page}`);
                            setTimeout(() => triggerPageLoad(page), (latestPage - page) * 200);
                        }
                    }
                }
            }, 1000); // 等待1秒确保最新页已加载完成
        }
    }, [validChannelId, messageCount, loadedPages, currentQueryPage, latestPage, triggerPageLoad, allMessages.length]);

    // 优化4: 替换自动加载的效果，移除setTimeout
    useEffect(() => {
        if (validChannelId && autoRefreshTrigger > 0 && currentQueryPage === null) {
            console.log(`准备加载消息：频道=${validChannelId}, 最新页=${latestPage}, 总消息数=${messageCount}`);
            loadLatestMessages();
        }
    }, [validChannelId, autoRefreshTrigger, currentQueryPage, loadLatestMessages]);

    // 优化5: 更有效的错误处理和重试
    useEffect(() => {
        if (isError && validChannelId) {
            console.error("查询消息时发生错误，将在1秒后重试");

            // 使用防抖处理错误重试，避免频繁触发
            const retryTimer = setTimeout(() => {
                if (currentQueryPage !== null) {
                    console.log("自动重试加载页面:", currentQueryPage);
                    // 重置页面查询以触发新请求
                    setCurrentQueryPage(null);
                    setTimeout(() => triggerPageLoad(currentQueryPage), 100);
                } else if (messageCount > 0) {
                    console.log("自动重试加载最新页面:", latestPage);
                    triggerPageLoad(latestPage);
                }
            }, 1000);

            return () => clearTimeout(retryTimer);
        }
    }, [isError, validChannelId, currentQueryPage, messageCount, latestPage, triggerPageLoad]);

    // 优化6: 改进新消息检测和加载逻辑
    useEffect(() => {
        // 首次加载不计数
        if (lastMessageCount === 0) {
            setLastMessageCount(messageCount);
            return;
        }

        // 检测新消息
        if (messageCount > lastMessageCount) {
            const newCount = messageCount - lastMessageCount;

            // 用户不在底部时，只更新计数器
            if (!isAtBottom) {
                setNewMessageCount(prev => prev + newCount);

                // 只在新消息可能在新页面时触发页面加载
                const newLatestPage = Math.floor((messageCount - 1) / MESSAGES_PER_PAGE);
                if (newLatestPage > Math.max(...loadedPages, 0)) {
                    console.log(`检测到新页面消息，加载页面${newLatestPage}`);
                    triggerPageLoad(newLatestPage);
                } else {
                    // 否则只刷新当前页
                    console.log("刷新当前最新页面的消息");
                    refetchMessages();
                }
            } else {
                // 用户在底部，直接加载最新消息并保持滚动
                console.log("用户在底部，加载最新消息");

                // 检查是否需要加载新页面
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

    // 优化7: 改进滚动加载历史消息的逻辑
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        // 使用防抖处理滚动事件，避免过于频繁的判断
        const debouncedScrollHandler = debounce(() => {
            // 判断是否接近底部
            const isNearBottom =
                container.scrollHeight - container.scrollTop - container.clientHeight < 100;

            setIsAtBottom(isNearBottom);
            setShowScrollToBottom(!isNearBottom);

            // 加载更早的消息逻辑
            if (container.scrollTop < 50 && !isLoadingMoreUp && !reachedTop && loadedPages.length > 0) {
                const oldestLoadedPage = Math.min(...loadedPages);

                // 只在有更早页面时加载
                if (oldestLoadedPage > 0) {
                    const nextPageToLoad = oldestLoadedPage - 1;

                    // 触发加载
                    if (triggerPageLoad(nextPageToLoad)) {
                        setIsLoadingMoreUp(true);
                        setLastScrollHeight(container.scrollHeight);
                    }
                } else if (oldestLoadedPage === 0) {
                    // 已经到第一页，标记为到达顶部
                    setReachedTop(true);
                }
            }
        }, 150); // 150ms的防抖时间

        const handleScroll = () => debouncedScrollHandler();
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [loadedPages, isLoadingMoreUp, reachedTop, debounce, triggerPageLoad]);

    // 添加：初始化加载检查 - 确保足够的消息被加载出来
    useEffect(() => {
        // 仅当消息已加载且数量明显少于预期时执行
        if (
            validChannelId &&
            !currentQueryPage &&
            loadedPages.length > 0 &&
            messageCount > 20 &&
            allMessages.length < 20 &&
            !isMessagesLoading
        ) {
            console.log(`初始化加载检查: 已加载 ${allMessages.length} 条消息，总共 ${messageCount} 条，尝试加载更多页面`);

            // 检查哪些页面没有加载
            const missingPages = [];
            for (let i = Math.max(0, latestPage - 2); i <= latestPage; i++) {
                if (!loadedPages.includes(i)) {
                    missingPages.push(i);
                }
            }

            // 加载缺失的页面
            if (missingPages.length > 0) {
                console.log(`发现缺失的页面: ${missingPages.join(', ')}`);
                missingPages.forEach((page, index) => {
                    setTimeout(() => triggerPageLoad(page), index * 300);
                });
            } else {
                // 如果最新的几页已经加载但消息数量仍不足，尝试加载更早的页面
                const earliestPage = Math.max(0, Math.min(...loadedPages) - 1);
                if (earliestPage >= 0 && !loadedPages.includes(earliestPage)) {
                    console.log(`尝试加载更早的页面: ${earliestPage}`);
                    triggerPageLoad(earliestPage);
                }
            }
        }
    }, [validChannelId, allMessages.length, messageCount, loadedPages, currentQueryPage, latestPage, isMessagesLoading, triggerPageLoad]);

    // Handle channel ID changes
    useEffect(() => {
        if (!channelId) return;

        console.log(`Channel ID changed to: ${channelId}`);

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

        // Increase auto-refresh trigger
        setAutoRefreshTrigger(prev => prev + 1);
    }, [channelId]);

    // Automatically trigger loading when message count is available
    useEffect(() => {
        // Only execute when channel ID changes or message count changes and no query is in progress
        if (validChannelId && autoRefreshTrigger > 0 && currentQueryPage === null) {
            console.log(`Ready to load messages: channel=${validChannelId}, latest page=${latestPage}, total messages=${messageCount}`);

            // Use setTimeout to ensure state updates are complete
            const timer = setTimeout(() => {
                if (messageCount > 0) {
                    console.log(`Loading latest page messages: page=${latestPage}`);
                    setCurrentQueryPage(latestPage);
                } else {
                    console.log("No messages or message data not loaded yet, trying to load page 0");
                    setCurrentQueryPage(0);
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [validChannelId, autoRefreshTrigger, currentQueryPage, latestPage, messageCount]);

    // Handle newly loaded message pages
    useEffect(() => {
        if (!pageMessages) return;

        if (currentQueryPage !== null) {
            console.log(`收到页面 ${currentQueryPage} 的查询结果: ${pageMessages.length} 条消息`);
        }

        if (pageMessages && pageMessages.length > 0 && currentQueryPage !== null) {
            console.log(`加载了 ${pageMessages.length} 条消息, 页面=${currentQueryPage}`);

            // Add current page to loaded pages list
            if (!loadedPages.includes(currentQueryPage)) {
                setLoadedPages(prev => [...prev, currentQueryPage]);
            }

            // Update message list, avoid duplicates
            setAllMessages(prev => {
                const existingIndices = new Set(prev.map(m => m.index));
                const newMessages = pageMessages.filter(msg => !existingIndices.has(msg.index));

                if (newMessages.length === 0) {
                    console.log("没有新消息需要添加");
                    return prev;
                }

                console.log(`添加 ${newMessages.length} 条新消息`);

                // Merge and sort
                const merged = [...prev, ...newMessages].sort((a, b) => a.index - b.index);
                return merged;
            });

            // 添加: 检查是否需要继续加载更多页面
            // 如果当前页消息数量少于预期，可能需要加载更多页面
            if (pageMessages.length < MESSAGES_PER_PAGE && currentQueryPage === latestPage && messageCount > MESSAGES_PER_PAGE) {
                console.log(`最新页 ${currentQueryPage} 消息数量(${pageMessages.length})少于预期(${MESSAGES_PER_PAGE})，尝试加载前一页`);

                // 设置延时以避免立即触发
                setTimeout(() => {
                    if (currentQueryPage > 0 && !loadedPages.includes(currentQueryPage - 1)) {
                        triggerPageLoad(currentQueryPage - 1);
                    }
                }, 500);
            }

            // Reset query page after loading is complete
            setCurrentQueryPage(null);
            setIsLoadingMoreUp(false);
        } else if (pageMessages && pageMessages.length === 0 && currentQueryPage !== null) {
            console.log(`页面 ${currentQueryPage} 没有返回任何消息`);

            // Mark as reached top (if it's page 0)
            if (currentQueryPage === 0) {
                console.log("Reached page 0, marking as beginning of conversation");
                setReachedTop(true);
            }

            // Add current page to loaded pages list to avoid repeated requests
            if (!loadedPages.includes(currentQueryPage)) {
                setLoadedPages(prev => [...prev, currentQueryPage]);
            }

            // Reset query page
            setCurrentQueryPage(null);
            setIsLoadingMoreUp(false);

            // If latest page has no messages but total message count is greater than 0
            if (currentQueryPage === latestPage && messageCount > 0 && latestPage > 0) {
                console.log(`Latest page (${latestPage}) has no messages, but total count is ${messageCount}, trying to load previous page`);
                setCurrentQueryPage(latestPage - 1);
            }

            // If all attempts have no messages but total count is greater than 0, try loading from the beginning
            if (loadedPages.length === 0 && messageCount > 0) {
                console.log("No messages loaded yet, trying to load from page 0");
                setCurrentQueryPage(0);
            }
        }
    }, [pageMessages, currentQueryPage, loadedPages, latestPage, messageCount]);

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
                        console.log(`Loading earlier messages: page ${nextPageToLoad}`);
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
        return message.sender === address?.genRoochAddress().toHexAddress();
    }, [address]);

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