'use client'

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FiAward } from "react-icons/fi";
import { getLeaderboardData, LeaderboardUser } from "@/app/services/airtable";
import { BarLoader } from "../shared/BarLoader";

// 使用Airtable数据接口
interface User extends LeaderboardUser { }


const TableRows = ({ user }: { user: User }) => {
    // 使用字符串的最后一个字符作为数字用于条件判断
    const idLastChar = parseInt(user.id.slice(-1), 10);

    return (
        <motion.tr
            layoutId={`row-${user.id}`}
            className={`text-sm ${(user.rank ?? 0) % 2 === 0 ? "bg-white" : "bg-slate-100"}`}
        >
            <td className="p-4">
                <div
                    className={`flex items-center gap-2 font-medium ${user.rank === 1 && "text-violet-500"
                        }`}
                >
                    <span>#{user.rank}</span>
                    {user.rank === 1 && <FiAward className="text-xl" />}
                </div>
            </td>

            <td className="p-4 flex items-center gap-3 overflow-hidden">
                <a
                    href={`https://x.com/${user.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                    <img
                        src={user.avatar}
                        alt={`${user.name}'s avatar`}
                        className="w-10 h-10 rounded-full bg-slate-300 object-cover object-top shrink-0"
                    />
                    <div>
                        <span className="block mb-1 font-medium">{user.name}</span>
                        <span className="block text-xs text-slate-500">@{user.handle}</span>
                    </div>
                </a>
            </td>

            <td className="p-4 font-medium">{user.points}</td>
        </motion.tr>
    );
};

const Table = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getLeaderboardData();
                setUsers(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching leaderboard data:", err);
                setError("Failed to load leaderboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="w-full p-8 text-center min-h-[200px] flex items-center justify-center">
                <BarLoader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full bg-white shadow-lg rounded-lg p-8 text-center text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <p>No leaderboard data available</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-white shadow-lg rounded-lg overflow-x-scroll max-w-4xl mx-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b-[1px] border-slate-200 text-slate-400 text-sm uppercase">
                        <th className="text-start p-4 font-medium">Rank</th>
                        <th className="text-start p-4 font-medium">User</th>
                        <th className="text-start p-4 font-medium">Points</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((user) => (
                        <TableRows key={user.id} user={user} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const Leaderboard = () => {
    return (
        <div className="p-8 w-full">
            <Table />
        </div>
    );
}; 