import { MessageList } from "./Messages/MessageList";
import { MessageInput } from "./UserInput/MessageInput";
import { useAgentChat } from "../../../contexts/AgentChatContext";

/**
 * Chat component - Main chat interface component
 * Features:
 * - Chat header with agent name
 * - Message list with auto-scrolling
 * - Message input with send/join functionality
 * - Token transfer functionality
 */
export function ChatArea() {
    const { agent, channel } = useAgentChat();

    if (!agent || !channel) {
        return null;
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-800">
            {/* Chat header with agent name */}
            <div className="flex-none border-b border-gray-200 dark:border-gray-700">
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {agent.name || 'Agent'} Home
                    </h2>
                </div>
            </div>

            {/* Message list with auto-scroll */}
            <div className="flex-1 overflow-hidden">
                <MessageList
                    channelId={channel}
                    agentName={agent.name}
                    agentId={agent.id}
                    agentAddress={agent.address}
                />
            </div>

            {/* Message input and send/join button */}
            <div className="flex-none border-t border-gray-200 dark:border-gray-700">
                <MessageInput />
            </div>
        </div>
    );
}
