import { createContext, useContext, ReactNode } from 'react';
import useAgent from '../hooks/use-agent';
import useAgentChannels from '../hooks/use-agent-channel';
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
    const { channel, isPending: isChannelPending } = useAgentChannels(agentId);
    const { memberCount } = useChannelMemberCount(channel);
    const { members, refetch: refetchChannelMembers } = useChannelMembers({
        channelId: channel,
        limit: '100',
    });
    const { isJoined, refetch: refetchJoinStatus } = useChannelJoinedStatus(channel);
    const { refetch: refetchJoinedAgent } = useAgentJoined();
    const { refetch: refetchMessageCount } = useChannelMessageCount(channel);
    const { refetch: refetchMessages } = useChannelMessages({
        channelId: channel,
        page: 0,
        size: 100,
    });
    const currentAddress = useCurrentAddress();

    const value: AgentChatContextType = {
        agent,
        isAgentPending,
        channel,
        isChannelPending,
        members,
        memberCount,
        isJoined,
        refetchJoinStatus,
        refetchJoinedAgent,
        refetchChannelMembers,
        refetchMessageCount,
        refetchMessages,
        currentAddress: currentAddress?.genRoochAddress().toHexAddress(),
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