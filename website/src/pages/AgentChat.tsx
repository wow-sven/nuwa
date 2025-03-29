import { useParams } from "react-router-dom";
import { DialogSidebar, ChatArea, ChannelSidebar } from "../components/AgentChat";
import { useEffect } from "react";
import { AgentChatProvider, useAgentChat } from "../contexts/AgentChatContext";
import { LoadingScreen } from "../components/layout/LoadingScreen";
import { NotFound } from "./NotFound";

/**
 * AgentChat component - Main chat interface for interacting with an AI agent
 * Features:
 * - Real-time messaging with AI agent
 * - Channel management (join/leave)
 * - Member list display
 * - Message history
 */
export function AgentChat() {
  const { username } = useParams<{ username: string }>();

  if (!username) {
    return <NotFound />
  }

  return (
    <AgentChatProvider agentUsername={username}>
      <AgentChatContent />
    </AgentChatProvider>
  );
}

function AgentChatContent() {
  const { agent, channels, isChannelsPending, isAgentPending, selectedChannel, setSelectedChannel, refetchChannels } = useAgentChat();

  useEffect(() => {
    if (!selectedChannel && channels) {
      setSelectedChannel(channels[0].id)
    }
  }, [channels, selectedChannel, setSelectedChannel])

  // Show loading state for agent or channels
  if (isAgentPending || isChannelsPending || !channels) {
    return <LoadingScreen agentName={agent?.name} />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar showing dialog list */}
        <DialogSidebar channels={channels} onChannelSelect={setSelectedChannel} onRefresh={refetchChannels} />

        {/* Main chat area with messages and input */}
        <ChatArea />

        {/* Right sidebar showing channel info and members */}
        <ChannelSidebar />
      </div>
    </div>
  );
}
