import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

/**
 * Props for the DialogSidebar component
 */
interface DialogSidebarProps {
    /** Current channel ID */
    channel: string | undefined;
}

/**
 * DialogSidebar component - Displays the list of available dialogs
 * Features:
 * - List of chat dialogs
 * - Unread message indicators
 * - Active dialog highlighting
 */
export function DialogSidebar({ channel }: DialogSidebarProps) {
    return (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {/* Dialog list header */}
            <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Dialog List
                </h2>
            </div>
            {/* Scrollable list of dialogs */}
            <div className="overflow-y-auto">
                {/* Single dialog item (placeholder for future multiple dialogs) */}
                <div
                    key={channel}
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 bg-purple-50 dark:bg-purple-900/20"
                    onClick={() => { }}
                >
                    <div className="flex items-center space-x-3">
                        <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                Home Channel
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}