import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SessionKeyGuard, useCurrentAddress } from "@roochnetwork/rooch-sdk-kit";
import { RoochAddress, Serializer } from "@roochnetwork/rooch-sdk";
import { useNetworkVariable } from "../../hooks/use-networks";
import useAgent from "../../hooks/use-agent";
import useAgentCaps from "../../hooks/use-agent-caps";
import useAgentTask from "../../hooks/use-agent-task";
import { useUpdateAgent } from "../../hooks/use-agent-update";
import { useUpdateAgentTaskTask } from "../../hooks/use-agent-task-update";
import { TaskSpecification } from "../../types/task-types";

interface AgentProfileContextType {
    agent: any;
    agentTask: TaskSpecification[] | undefined;
    isOwner: boolean;
    currentAddress: string | undefined;
    caps: Map<string, any>;
    refetchAgent: () => void;
    refetchAgentTask: () => void;
    updateAgent: (params: any) => Promise<any>;
    updateAgentTaskTask: (params: any) => Promise<any>;
    packageId: string;
    handleCopy: (text: string) => void;
}

interface AgentProfileProviderProps {
    children: ReactNode;
    address: string;
}

const AgentProfileContext = createContext<AgentProfileContextType | undefined>(undefined);

export const AgentProfileProvider = ({ children, address }: AgentProfileProviderProps) => {
    const currentAddress = useCurrentAddress()?.genRoochAddress().toHexAddress();
    const packageId = useNetworkVariable("packageId");
    const agentId = Serializer.accountNamedObjectID(
        new RoochAddress(address).toHexAddress(),
        {
            address: packageId,
            module: "agent",
            name: "Agent",
        }
    );

    const { agent, refetch: refetchAgent } = useAgent(agentId);
    const { caps } = useAgentCaps();
    const { agentTask, refetch: refetchAgentTask } = useAgentTask(agent?.id);
    const { mutateAsync: updateAgent } = useUpdateAgent();
    const { mutateAsync: updateAgentTaskTask } = useUpdateAgentTaskTask();

    const isOwner = (agent?.id && caps.has(agent.id)) || false;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        // the success notification is implemented in the component
    };

    const value = {
        agent,
        agentTask,
        isOwner,
        currentAddress,
        caps,
        refetchAgent,
        refetchAgentTask,
        updateAgent,
        updateAgentTaskTask,
        packageId,
        handleCopy
    };

    return (
        <AgentProfileContext.Provider value={value}>
            {children}
        </AgentProfileContext.Provider>
    );
};

export const useAgentProfile = () => {
    const context = useContext(AgentProfileContext);
    if (context === undefined) {
        throw new Error("useAgentProfile must be used within a AgentProfileProvider");
    }
    return context;
}; 