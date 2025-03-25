import {
    UserCircleIcon,
    UserGroupIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import useAgent from "../../../hooks/use-agent";

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
 * - Profile navigation button
 */
export function AgentInfo({ agentId, membersCount }: AgentInfoProps) {
    const navigate = useNavigate();
    const { agent, isPending, isError } = useAgent(agentId);

    if (isPending) {
        return (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="animate-pulse">
                    <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                    <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
                    <div className="mt-1 h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="text-center text-red-500">
                    Failed to load agent information
                </div>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="text-center text-gray-500">
                    No agent information available
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            {/* Agent avatar and name */}
            <div className="flex flex-col items-center">
                <img
                    src={agent.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=" + agent.id}
                    alt="AI Avatar"
                    className="w-16 h-16 rounded-full"
                />
                <div className="mt-2 text-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {agent.name}
                    </h2>
                    <div className="text-sm text-purple-600 dark:text-purple-400">
                        @{agent.username}
                    </div>
                    <div className="mt-1 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                        <UserGroupIcon className="w-4 h-4 mr-1" />
                        {membersCount} Members
                    </div>
                </div>
            </div>

            {/* Profile navigation button */}
            <button
                onClick={() => navigate(`/agent/profile/${agentId}`)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 mt-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg transition-colors"
            >
                <UserCircleIcon className="w-5 h-5" />
                <span className="font-medium">Profile</span>
            </button>
        </div>
    );
} 