import { createContext, useContext, ReactNode, useState } from 'react';
import useAgent from '../hooks/use-agent';
import useAgentChannel from '../hooks/use-agent-channel';
import useChannelMembers from '../hooks/use-channel-member';
import useChannelMemberCount from '../hooks/use-channel-member-count';
import useChannelJoinedStatus from '../hooks/use-channel-joined-status';
import useAgentJoined from '../hooks/use-agent-joined';
import useChannelMessageCount from '../hooks/use-channel-message-count';
import useChannelMessages from '../hooks/use-channel-messages';
import { useCurrentAddress } from "@roochnetwork/rooch-sdk-kit";
import { AgentChatContextType } from '../types/agent-chat';

const AgentChatContext = createContext<AgentChatContextType | undefined>(undefined);

export function AgentChatProvider({
    children,
    agentId
}: {
    children: ReactNode;
    agentId: string;
}) {
    const { agent, isPending: isAgentPending } = useAgent(agentId);
    const { channels, isPending: isChannelsPending, refetch: refetchChannels } = useAgentChannel(agentId);
    const [selectedChannel, setSelectedChannel] = useState<string>();
    const { memberCount } = useChannelMemberCount(selectedChannel || channels?.[0]?.id);
    const { members, refetch: refetchChannelMembers } = useChannelMembers({
        channelId: selectedChannel || channels?.[0]?.id,
        limit: '100',
    });
    const { isJoined, refetch: refetchJoinStatus } = useChannelJoinedStatus(selectedChannel || channels?.[0]?.id);
    const { refetch: refetchJoinedAgent } = useAgentJoined();
    const { refetch: refetchMessageCount } = useChannelMessageCount(selectedChannel || channels?.[0]?.id);
    const { refetch: refetchMessages } = useChannelMessages({
        channelId: selectedChannel || channels?.[0]?.id,
        page: 0,
        size: 100,
    });
    const currentAddress = useCurrentAddress();

    const value: AgentChatContextType = {
        agent,
        isAgentPending,
        channels,
        isChannelsPending,
        refetchChannels,
        members,
        memberCount,
        isJoined,
        refetchJoinStatus,
        refetchJoinedAgent,
        refetchChannelMembers,
        refetchMessageCount,
        refetchMessages,
        currentAddress: currentAddress?.genRoochAddress().toHexAddress(),
        selectedChannel,
        setSelectedChannel,
    };

    return (
        <AgentChatContext.Provider value={value}>
            {children}
        </AgentChatContext.Provider>
    );
}

export function useAgentChat() {
    const context = useContext(AgentChatContext);
    if (context === undefined) {
        throw new Error('useAgentChat must be used within an AgentChatProvider');
    }
    return context;
} 