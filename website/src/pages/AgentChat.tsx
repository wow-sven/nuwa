import { useParams } from "react-router-dom";
import useAgentChannels from "../hooks/use-agent-channels";
import useChannelMembers from "../hooks/use-channel-member";
import { DialogSidebar, ChatArea, ChannelSidebar } from "../components/AgentChat";

/**
 * AgentChat component - Main chat interface for interacting with an AI agent
 * Features:
 * - Real-time messaging with AI agent
 * - Channel management (join/leave)
 * - Member list display
 * - Message history
 */
export function AgentChat() {
  // Get agent ID from URL parameters
  const { id } = useParams<{ id: string }>();

  // Fetch channel information for the current agent
  const { channels } = useAgentChannels(id);
  const channelId = channels?.[0]?.id || '';

  // Get list of channel members
  const { members } = useChannelMembers({
    channelId,
    limit: '10'
  })

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar showing dialog list */}
        <DialogSidebar channels={channelId} />

        {/* Main chat area with messages and input */}
        <ChatArea agentId={id} channels={channelId} />

        {/* Right sidebar showing channel info and members */}
        <ChannelSidebar
          agentId={id}
          members={members}
        />
      </div>
    </div>
  );
}
