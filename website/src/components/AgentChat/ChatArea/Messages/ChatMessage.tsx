import { Message, MESSAGE_TYPE } from "../../../../types/channel";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { formatTimestamp } from "../../../../utils/time";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState, ComponentPropsWithoutRef } from "react";
import { ClipboardDocumentIcon, ShareIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { shortenAddress } from "../../../../utils/address";
import { Link } from "react-router-dom";
import { RoochAddress } from "@roochnetwork/rooch-sdk";
import useAgent from "../../../../hooks/use-agent";
import useUserInfo from "../../../../hooks/use-user-info";
import React from "react";

// Add interface for parsed action event
interface ActionEvent {
  action: string;
  args: string;
  success: boolean;
  error?: string;
}

// 添加转账附件的类型定义
interface TransferAttachment {
  amount: string;
  coin_type: string;
  to: string;
  memo?: string;
}

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  isAI: boolean;
  agentName?: string;
  agentId?: string;
  hasPaidContent?: boolean;
  messages?: Message[];
}

export function ChatMessage({
  message,
  isCurrentUser,
  isAI,
  agentName,
  agentId,
  hasPaidContent,
  messages,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const timestamp = message.timestamp;
  const isActionEvent = message.message_type === MESSAGE_TYPE.ACTION_EVENT;
  const { agent } = useAgent(agentId);
  const { userInfo } = useUserInfo(message.sender);

  // 检查消息是否包含转账附件
  const hasTransferAttachment = React.useMemo(() => {
    return message.attachments.some(attachment => {
      try {
        const data = JSON.parse(attachment.attachment_json) as TransferAttachment;
        return data.amount && data.coin_type && data.to;
      } catch (error) {
        return false;
      }
    });
  }, [message.attachments]);

  // 获取转账附件信息
  const transferAttachment = React.useMemo(() => {
    if (!hasTransferAttachment) return null;
    const attachment = message.attachments.find(attachment => {
      try {
        const data = JSON.parse(attachment.attachment_json) as TransferAttachment;
        return data.amount && data.coin_type && data.to;
      } catch (error) {
        return false;
      }
    });
    return attachment ? JSON.parse(attachment.attachment_json) as TransferAttachment : null;
  }, [message.attachments, hasTransferAttachment]);

  //TODO use the scanUrl via the network.
  const roochscanBaseUrl = "https://test.roochscan.io";

  const senderAddress = new RoochAddress(message.sender).toBech32Address();

  // 检查消息是否发送给 AI
  const isToAI = React.useMemo(() => {
    if (!agent?.address) return false;
    return message.mentions.some(mention => {
      try {
        const mentionAddress = new RoochAddress(mention).toBech32Address();
        return mentionAddress === agent.address;
      } catch (error) {
        console.error('Error parsing mention address:', error);
        return false;
      }
    });
  }, [message.mentions, agent?.address]);

  // Use the agent's actual name if provided, otherwise fallback to address
  const displayName = isAI
    ? agentName || "AI Agent"
    : userInfo?.name || shortenAddress(senderAddress);

  const handleCopy = async () => {
    const shareText = `${message.content}\n\n${window.location.href}`;
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const shareText = `${message.content}\n\n${window.location.href}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, "_blank");
  };

  // Parse action event if message type is ACTION_EVENT
  const parseActionEvent = (): ActionEvent | null => {
    if (!isActionEvent) return null;

    try {
      return JSON.parse(message.content);
    } catch (error) {
      console.error("Failed to parse action event:", error);
      return null;
    }
  };


  // Format action arguments for display
  const formatActionArgs = (argsJson: string): any => {
    try {
      return JSON.parse(argsJson);
    } catch (error) {
      return argsJson;
    }
  };

  // Get a human-friendly event message based on action type
  const getActionEventMessage = (actionEvent: ActionEvent): JSX.Element => {
    const args = formatActionArgs(actionEvent.args);

    // For transfer actions
    if (actionEvent.action.startsWith("transfer::")) {
      // For transfer::coin action
      if (actionEvent.action === "transfer::coin") {
        const amount = args.amount || "some";
        const coinType = args.coin_type
          ? args.coin_type.split("::").pop()
          : "coins";
        const recipient = args.to ? shortenAddress(args.to) : "someone";

        return (
          <span>
            {actionEvent.success ? "Transferred " : "Failed to transfer "}
            <span className="font-medium">
              {amount} {coinType}
            </span>{" "}
            to{" "}
            <a
              href={`${roochscanBaseUrl}/account/${args.to}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {recipient}
            </a>
            {args.memo && <span className="italic"> — "{args.memo}"</span>}
          </span>
        );
      }
    }

    // For memory actions
    else if (actionEvent.action.startsWith("memory::")) {
      if (actionEvent.action === "memory::add") {
        const args = formatActionArgs(actionEvent.args);
        return (
          <span>Added a new memory about {shortenAddress(args.addr)}</span>
        );
      } else if (actionEvent.action === "memory::update") {
        const args = formatActionArgs(actionEvent.args);
        return (
          <span>
            Updated memory at index {args.index} for {shortenAddress(args.addr)}
          </span>
        );
      } else if (actionEvent.action === "memory::remove") {
        const args = formatActionArgs(actionEvent.args);
        return (
          <span>
            Removed memory at index {args.index} for {shortenAddress(args.addr)}
          </span>
        );
      } else if (actionEvent.action === "memory::compact") {
        const args = formatActionArgs(actionEvent.args);
        return <span>Compacted memories for {shortenAddress(args.addr)}</span>;
      } else if (actionEvent.action === "memory::none") {
        const args = formatActionArgs(actionEvent.args);
        return (
          <span>
            No new memories saved{args.reason ? ` — ${args.reason}` : ""}
          </span>
        );
      }
    }

    // Default fallback for other actions
    const actionName = actionEvent.action.split("::").join("::");
    return (
      <span>
        Executed <span className="font-medium">{actionName}</span>
        {actionEvent.success ? "" : " (failed)"}
      </span>
    );
  };

  // Render action event content in IM-style
  const renderActionEvent = () => {
    const actionEvent = parseActionEvent();
    if (!actionEvent)
      return <div className="text-red-500">Invalid action event format</div>;

    // Get appropriate icon based on action type
    const getActionIcon = () => {
      if (actionEvent.action.startsWith("transfer::")) {
        return "💸";
      } else if (actionEvent.action.startsWith("memory::")) {
        return "🧠";
      } else {
        return "⚙️";
      }
    };

    // Get status icon
    const getStatusIcon = () => {
      if (actionEvent.success) {
        return "✅";
      } else {
        return "❌";
      }
    };

    return (
      <div className="text-center py-1 text-sm text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <span>{getActionIcon()}</span>
          {getActionEventMessage(actionEvent)}
          {actionEvent.error ? (
            <span className="text-red-500 ml-1">
              — Error: {actionEvent.error}
            </span>
          ) : (
            ""
          )}
        </span>
      </div>
    );
  };

  // For action events, return a simplified centered message
  if (isActionEvent) {
    return (
      <div className="flex justify-center w-full my-1">
        <div className="w-full">{renderActionEvent()}</div>
      </div>
    );
  }

  // 获取被回复的消息
  const getReplyToMessage = () => {
    if (!messages || message.reply_to === -1) return null;
    return messages.find(m => m.index === message.reply_to);
  };

  const replyToMessage = getReplyToMessage();
  const { userInfo: replyToUserInfo } = useUserInfo(replyToMessage?.sender);

  // For normal messages, use the existing format
  return (
    <div className="flex w-full">
      <div className="w-full flex gap-3">
        {!isCurrentUser && (
          <div className="flex-shrink-0 w-8 h-8">
            {isAI ? (
              // Wrap the avatar in a Link component if agentId is provided
              agentId ? (
                <Link
                  to={`/agent/${agentId}`}
                  className="block w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                  title={`View ${agentName || "AI Agent"}'s profile`}
                >
                  {agent?.avatar ? (
                    <img
                      src={agent.avatar}
                      alt={agentName || "AI Agent"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                      {agentName ? agentName.substring(0, 2).toUpperCase() : "AI"}
                    </div>
                  )}
                </Link>
              ) : (
                // Original div if no agentId provided
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  {agentName ? agentName.substring(0, 2).toUpperCase() : "AI"}
                </div>
              )
            ) : (
              // User avatar with Roochscan link
              <a
                href={`${roochscanBaseUrl}/account/${senderAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-8 h-8 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all rounded-full"
                title={`View ${shortenAddress(senderAddress)} on Roochscan`}
              >
                {userInfo?.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt={userInfo.name || shortenAddress(senderAddress)}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-gray-400" />
                )}
              </a>
            )}
          </div>
        )}
        <div
          className={`flex flex-col flex-1 ${isCurrentUser ? "items-end" : "items-start"}`}
        >
          <div className="flex gap-2 text-xs text-gray-500 mb-1">
            <span className="font-medium">
              {isCurrentUser ? (
                "You"
              ) : isAI ? (
                displayName
              ) : (
                <a
                  href={`${roochscanBaseUrl}/account/${senderAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 hover:underline transition-colors"
                  title={`View ${senderAddress} on Roochscan`}
                >
                  {displayName}
                </a>
              )}
            </span>
            {!isCurrentUser && !isAI && userInfo?.username && (
              <>
                <span>•</span>
                <span className="text-gray-400">@{userInfo.username}</span>
              </>
            )}
            <span>•</span>
            <span>{formatTimestamp(timestamp)}</span>
            {hasPaidContent && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Paid Message
              </span>
            )}
            {isCurrentUser && isToAI && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                To Agent
              </span>
            )}
          </div>
          {replyToMessage && (
            <div className="mb-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
              <div className="flex flex-col gap-1">
                <span className="font-medium">
                  Reply to {`@` + replyToUserInfo?.username || replyToUserInfo?.name || shortenAddress(new RoochAddress(replyToMessage.sender).toBech32Address())}
                </span>
                <span>
                  {replyToMessage.content.length > 50
                    ? `${replyToMessage.content.substring(0, 50)}...`
                    : replyToMessage.content}
                </span>
              </div>
            </div>
          )}
          <div className="relative group">
            <div
              className={`rounded-lg px-2 py-0.5 ${isCurrentUser
                ? isToAI
                  ? "bg-green-100 text-green-900 border border-green-200 dark:bg-green-800 dark:text-white dark:border-green-700"
                  : hasTransferAttachment
                    ? "bg-yellow-100 text-yellow-900 border border-yellow-200 dark:bg-yellow-800 dark:text-white dark:border-yellow-700"
                    : "bg-blue-100 text-blue-900 border border-blue-200 dark:bg-blue-700 dark:text-white dark:border-blue-600"
                : isAI
                  ? "bg-purple-100 text-purple-900 border border-purple-200 dark:bg-purple-700 dark:text-white dark:border-purple-600"
                  : hasTransferAttachment
                    ? "bg-yellow-100 text-yellow-900 border border-yellow-200 dark:bg-yellow-800 dark:text-white dark:border-yellow-700"
                    : "bg-gray-100 text-gray-900 border border-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                }`}
            >
              {hasTransferAttachment && transferAttachment && (
                <div className="mb-2 p-2 bg-white/50 dark:bg-black/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-yellow-600 dark:text-yellow-400">💸</span>
                    <span>Transfer</span>
                    <span className="font-medium">{transferAttachment.amount}</span>
                    <span>{transferAttachment.coin_type.split("::").pop()}</span>
                    <span>to Agent ({`@` + agent?.username || agent?.name || agent?.address.substring(0, 8) + '...' + agent?.address.substring(agent.address.length - 6)})</span>

                    {transferAttachment.memo && (
                      <span className="italic"> — "{transferAttachment.memo}"</span>
                    )}
                  </div>
                </div>
              )}
              {(
                <div className="flex flex-col justify-between items-start">
                  <div className="text-sm leading-tight">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      className="prose prose-sm max-w-none dark:prose-invert prose-p:m-0 prose-ul:m-0 prose-ol:m-0 prose-li:m-0 prose-pre:m-0 prose-headings:m-0 prose-hr:m-0 prose-blockquote:m-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p:last-child]:mb-0"
                      components={{
                        pre: ({ children }) => children,
                        code: ({
                          inline,
                          className,
                          children,
                          ...props
                        }: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          const language = match ? match[1] : "";

                          return !inline ? (
                            <div className="my-1">
                              <SyntaxHighlighter
                                language={language}
                                style={oneLight}
                                customStyle={{
                                  backgroundColor: "var(--tw-prose-pre-bg, #f8fafc)",
                                  padding: "0.75rem",
                                  margin: 0,
                                  borderRadius: "0.375rem",
                                  border: "1px solid var(--tw-prose-pre-border, #e2e8f0)",
                                }}
                                className="dark:!bg-gray-800 dark:border-gray-700"
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code
                              className={`px-1.5 py-0.5 rounded ${isCurrentUser
                                ? "bg-blue-200/70 text-blue-800 dark:bg-blue-500/30 dark:text-white"
                                : "bg-gray-200/70 text-gray-800 dark:bg-gray-500/30 dark:text-white"
                                }`}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* 按钮移到气泡外部 */}
              <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-full bg-gray-800/80 text-white hover:bg-gray-700 transition-colors"
                  title="复制消息"
                >
                  {copied ? (
                    <CheckIcon className="w-3 h-3 text-green-500" />
                  ) : (
                    <ClipboardDocumentIcon className="w-3 h-3" />
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="p-1 rounded-full bg-gray-800/80 text-white hover:bg-gray-700 transition-colors"
                  title="分享到推特"
                >
                  <ShareIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {isCurrentUser && (
          <div className="flex-shrink-0 w-8 h-8">
            {/* Add Roochscan link for current user's avatar too */}
            {senderAddress && (
              <a
                href={`${roochscanBaseUrl}/account/${senderAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-8 h-8 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all rounded-full"
                title={`View your account on Roochscan`}
              >
                {userInfo?.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt={userInfo.name || shortenAddress(senderAddress)}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-blue-400" />
                )}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
