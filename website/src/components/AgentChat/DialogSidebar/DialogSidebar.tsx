import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { useChannelCreateTopic } from "../../../hooks/use-channel-create-topic";
import { SessionKeyGuard } from "@roochnetwork/rooch-sdk-kit";

/**
 * Props for the DialogSidebar component
 */
interface DialogSidebarProps {
  /** Current channel ID */
  channels: {
    title: string,
    id: string
  }[];
  onChannelSelect: (id: string) => void
}

/**
 * DialogSidebar component - Displays the list of available dialogs
 * Features:
 * - List of chat dialogs
 * - Unread message indicators
 * - Active dialog highlighting
 */
export function DialogSidebar({ channels, onChannelSelect }: DialogSidebarProps) {
  const { mutateAsync, isPending } = useChannelCreateTopic();

  const handleCreateTopic = async () => {
    mutateAsync({
        channelId: channels[0].id,
        topic: "New Topic",
        joinPolicy: 0, // 0 for public, 1 for private
        })
        .then(() => {
            console.log("Topic created successfully");
        })
        .catch((error) => {
            console.error("Error creating topic:", error);
    })
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
  {/* Dialog list header */}
  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      Dialog List
    </h2>
  </div>
  {/* Scrollable list of dialogs */}
  <div className="overflow-y-auto max-h-[calc(100vh-10rem)]">
    {/* Single dialog item */}
    {channels.map((channel) => (
      <div
        key={channel.id}
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 bg-purple-50 dark:bg-purple-900/20 transition-colors"
        onClick={() => onChannelSelect(channel.id)}
      >
        <button className="flex items-center space-x-3 w-full">
          <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {channel.title}
            </p>
          </div>
        </button>
      </div>
    ))}
  </div>
  <SessionKeyGuard onClick={handleCreateTopic}>
    <button
      disabled={isPending}
      className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors mt-2 ${
        isPending
          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-400 dark:text-purple-500 cursor-not-allowed"
          : "bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300"
      }`}
    >
      <span className="font-medium">
        {isPending ? 'Creating Topic...' : 'Create Topic'}
      </span>
    </button>
  </SessionKeyGuard>
</div>

  );
}
