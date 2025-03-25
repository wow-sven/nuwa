import { UserGroupIcon, PlusIcon } from "@heroicons/react/24/outline";
import { toShortStr } from "@roochnetwork/rooch-sdk";

/**
 * Interface for channel member data
 */
interface Member {
    /** Member's wallet address */
    address: string;
    /** Member's avatar URL */
    avatar: string;
}

/**
 * Props for the MembersList component
 */
interface MembersListProps {
    /** List of channel members */
    members: Member[];
}

/**
 * MembersList component - Displays the list of channel members
 * Features:
 * - Member avatars and addresses
 * - RGAS balance display
 * - Add member functionality (TODO)
 */
export function MembersList({ members }: MembersListProps) {
    return (
        <>
            {/* Members list header with add button */}
            <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <UserGroupIcon className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Members <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">({members.length})</span>
                    </h2>
                </div>
                {/* Add member button (TODO) */}
                <button
                    onClick={() => {
                        /* TODO: 实现添加成员功能 */
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
            {/* Scrollable list of members */}
            <div className="overflow-y-auto">
                {members.map((member) => (
                    <div
                        key={member.address}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <div className="flex items-center space-x-3">
                            {/* Member avatar */}
                            <img
                                src={member.avatar}
                                alt={toShortStr(member.address)}
                                className="w-10 h-10 rounded-full"
                            />
                            {/* Member info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {toShortStr(member.address)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
} 