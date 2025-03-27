import { ChatBubbleLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useChannelCreateTopic } from "../../../hooks/use-channel-create-topic";
import { SessionKeyGuard } from "@roochnetwork/rooch-sdk-kit";
import { useState } from "react";
import { useAgentChat } from "../../../contexts/AgentChatContext";

/**
 * Props for the DialogSidebar component
 */
interface DialogSidebarProps {
  /** Current channel ID */
  channels: {
    title: string,
    id: string
  }[];
  onChannelSelect: (id: string) => void;
  /** Callback to refresh the dialog list */
  onRefresh?: () => void;
}

/**
 * DialogSidebar component - Displays the list of available dialogs
 * Features:
 * - List of chat dialogs
 * - Unread message indicators
 * - Active dialog highlighting
 */
export function DialogSidebar({ channels, onChannelSelect, onRefresh }: DialogSidebarProps) {
  const { mutateAsync, isPending } = useChannelCreateTopic();
  const [showInput, setShowInput] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [joinPolicy, setJoinPolicy] = useState<0 | 1>(0); // 0 for public, 1 for private
  const { selectedChannel } = useAgentChat();

  const handleCreateTopic = async () => {
    if (!topicName.trim()) return;

    try {
      // 如果是第一个 topic，强制使用 "homechannel" 作为名称
      const finalTopicName = channels.length === 0 ? "homechannel" : topicName;

      await mutateAsync({
        channelId: channels[0].id,
        topic: finalTopicName,
        joinPolicy,
      });
      console.log("Topic created successfully");
      setShowInput(false);
      setTopicName("");
      setJoinPolicy(0); // 重置为默认值
      onRefresh?.(); // 刷新对话列表
    } catch (error) {
      console.error("Error creating topic:", error);
    }
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Dialog list header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Dialog List
          </h2>
          <SessionKeyGuard onClick={() => setShowInput(true)}>
            <button
              disabled={isPending}
              className={`p-2 rounded-lg transition-colors ${isPending
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-400 dark:text-purple-500 cursor-not-allowed"
                : "bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                }`}
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </SessionKeyGuard>
        </div>
        {showInput && (
          <div className="mt-2 flex flex-col gap-2">
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="Enter topic name"
              className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="public"
                  name="access"
                  value={0}
                  checked={joinPolicy === 0}
                  onChange={(e) => setJoinPolicy(Number(e.target.value) as 0 | 1)}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                />
                <label htmlFor="public" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  Public
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="private"
                  name="access"
                  value={1}
                  checked={joinPolicy === 1}
                  onChange={(e) => setJoinPolicy(Number(e.target.value) as 0 | 1)}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                />
                <label htmlFor="private" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  Private
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateTopic}
                disabled={isPending || !topicName.trim()}
                className="flex-1 px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowInput(false);
                  setTopicName("");
                  setJoinPolicy(0); // 重置为默认值
                }}
                className="flex-1 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Scrollable list of dialogs */}
      <div className="overflow-y-auto max-h-[calc(100vh-10rem)]">
        {/* Single dialog item */}
        {channels.map((channel) => (
          <div
            key={channel.id}
            className={`py-2.5 px-4 cursor-pointer transition-colors border-b dark:border-gray-700 ${selectedChannel === channel.id
              ? "border-l-4 border-l-purple-500 dark:border-l-purple-400"
              : "hover:border-l-4 hover:border-l-purple-300 dark:hover:border-l-purple-500"
              }`}
            onClick={() => onChannelSelect(channel.id)}
          >
            <div className="flex items-center space-x-3 w-full bg-transparent hover:ring-none hover:border-none">
              <ChatBubbleLeftIcon className={`w-4 h-5 ${selectedChannel === channel.id
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-400"
                }`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${selectedChannel === channel.id
                  ? "text-purple-700 dark:text-purple-300"
                  : "text-gray-600 dark:text-gray-300"
                  }`}>
                  {channel.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
