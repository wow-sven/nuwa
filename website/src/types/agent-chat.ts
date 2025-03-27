import { Member } from "./channel";
import { QueryObserverResult } from "@tanstack/react-query";

export interface Agent {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    description?: string;
    agent_address: string;
    address: string;
}

export interface Channel {
    id: string;
    title: string;
}

export interface AgentChatContextType {
    agent: Agent | undefined;
    isAgentPending: boolean;
    channels: Channel[] | undefined;
    isChannelsPending: boolean;
    refetchChannels: () => Promise<QueryObserverResult<Channel[], Error>>;
    members: Member[];
    memberCount: number | undefined;
    isJoined: boolean | undefined;
    refetchJoinStatus: () => Promise<QueryObserverResult<boolean, Error>>;
    refetchJoinedAgent: () => Promise<QueryObserverResult<Agent[], Error>>;
    refetchChannelMembers: () => Promise<QueryObserverResult<Member[], Error>>;
    refetchMessageCount: () => Promise<QueryObserverResult<number, Error>>;
    refetchMessages: () => void;
    currentAddress: string | undefined;
    selectedChannel: string | undefined;
    setSelectedChannel: (channelId: string | undefined) => void;
} 