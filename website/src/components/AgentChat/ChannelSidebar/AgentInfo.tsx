import {
    UserCircleIcon,
    UserGroupIcon,
    CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import useAgent from "../../../hooks/use-agent";
import useAgentBalance from "../../../hooks/use-agent-balance";

/**
 * Props for the AgentProfile component
 */
interface AgentInfoProps {
    /** ID of the current agent */
    agentId?: string;
    /** Number of members in the channel */
    membersCount: number;
}

/**
 * AgentProfile component - Displays agent information and channel statistics
 * Features:
 * - Agent avatar and name
 * - Channel member count
 * - Agent balance
 * - Profile navigation button
 */
export function AgentInfo({ agentId, membersCount }: AgentInfoProps) {
    const navigate = useNavigate();
    const { agent, isPending, isError } = useAgent(agentId);
    const { balance, isPending: isBalancePending } = useAgentBalance(agent?.agent_address);

    if (isPending) {
        return (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="animate-pulse space-y-4">
                    <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                    <div className="space-y-2">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    Failed to load agent information
                </div>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="text-center text-gray-500 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    No agent information available
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center space-y-4">
                {/* Avatar Section */}
                <div className="relative">
                    <img
                        src={agent.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=" + agent.id}
                        alt="AI Avatar"
                        className="w-20 h-20 rounded-full ring-4 ring-purple-100 dark:ring-purple-900/30"
                    />
                </div>

                {/* Info Section */}
                <div className="text-center space-y-2">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {agent.name}
                        </h2>
                        <div className="text-sm text-purple-600 dark:text-purple-400">
                            @{agent.username}
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="flex items-center justify-center space-x-4 mt-3">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <UserGroupIcon className="w-4 h-4 mr-1" />
                            <span>{membersCount}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                            {isBalancePending ? (
                                <span className="animate-pulse">...</span>
                            ) : (
                                <span>{(Number(balance?.balance || 0) / 1e8).toFixed(0)} RGAS</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Button */}
                <button
                    onClick={() => navigate(`/profile/${agent.agent_address}`)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg transition-colors mt-2"
                >
                    <UserCircleIcon className="w-5 h-5" />
                    <span className="font-medium">View Profile</span>
                </button>
            </div>
        </div>
    );
} 