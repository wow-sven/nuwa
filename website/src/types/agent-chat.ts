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

export interface AgentChatContextType {
    agent: Agent | undefined;
    isAgentPending: boolean;
    channel: string | undefined;
    isChannelPending: boolean;
    members: Member[];
    memberCount: number | undefined;
    isJoined: boolean | undefined;
    refetchJoinStatus: () => Promise<QueryObserverResult<boolean, Error>>;
    refetchJoinedAgent: () => Promise<QueryObserverResult<Agent[], Error>>;
    refetchChannelMembers: () => Promise<QueryObserverResult<Member[], Error>>;
    refetchMessageCount: () => Promise<QueryObserverResult<number, Error>>;
    refetchMessages: () => void;
    currentAddress: string | undefined;
} 