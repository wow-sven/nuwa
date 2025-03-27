import { useParams } from "react-router-dom";
import { DialogSidebar, ChatArea, ChannelSidebar } from "../components/AgentChat";
import { useEffect, useState } from "react";
import { AgentChatProvider, useAgentChat } from "../contexts/AgentChatContext";

/**
 * AgentChat component - Main chat interface for interacting with an AI agent
 * Features:
 * - Real-time messaging with AI agent
 * - Channel management (join/leave)
 * - Member list display
 * - Message history
 */
export function AgentChat() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return null;
  }

  return (
    <AgentChatProvider agentId={id}>
      <AgentChatContent />
    </AgentChatProvider>
  );
}

function AgentChatContent() {
  const { agent, isAgentPending, channels, isChannelsPending, selectedChannel, setSelectedChannel } = useAgentChat();

  useEffect(() => {
    if (!selectedChannel && channels) {
      setSelectedChannel(channels[0].id)
    }
  }, [channels, selectedChannel, setSelectedChannel])

  // Show loading state
  if (isAgentPending || isChannelsPending || !channels) {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          {/* Logo */}
          <div className="relative w-32 h-32 animate-float">
            <img
              src="/nuwa-logo-horizontal-dark.svg"
              className="w-full h-full object-contain hidden dark:block"
              alt="Nuwa"
            />
            <img
              src="/nuwa-logo-horizontal.svg"
              className="w-full h-full object-contain dark:hidden"
              alt="Nuwa"
            />
          </div>
          {/* Loading Spinner */}
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
          </div>
          {/* Loading Text */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connecting to {agent?.name || 'AI'} assistant...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar showing dialog list */}
        <DialogSidebar channels={channels} onChannelSelect={setSelectedChannel} />

        {/* Main chat area with messages and input */}
        <ChatArea />

        {/* Right sidebar showing channel info and members */}
        <ChannelSidebar />
      </div>
    </div>
  );
}
