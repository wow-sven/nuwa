'use client'

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiAward, FiRefreshCw } from "react-icons/fi";
import { fetchUserRewardHistory, fetchMissions } from "@/app/services/apiClient";
import { BarLoader } from "@/app/components/shared/BarLoader";

interface PointsHistoryItem {
    id: string;
    points: number;
    mission: string;
    createdTime: string;
    missionTitle?: string;
    missionDescription?: string;
}

interface UserPointsHistoryProps {
    userName: string;
}

export const UserPointsHistory = ({ userName }: UserPointsHistoryProps) => {
    const [history, setHistory] = useState<PointsHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchHistory = async () => {
        try {
            setLoading(true);

            // 并行获取积分历史和所有任务信息
            const [historyData, allMissions] = await Promise.all([
                fetchUserRewardHistory(userName),
                fetchMissions()
            ]);

            // 创建任务ID到任务详情的映射
            const missionMap = new Map();
            allMissions.forEach(mission => {
                missionMap.set(mission.id, {
                    title: mission.title,
                    description: mission.description
                });
            });

            // 将任务详情添加到历史记录中
            const historyWithMissionDetails = historyData.map(item => {
                const missionDetails = missionMap.get(item.mission);
                return {
                    ...item,
                    missionTitle: missionDetails?.title || 'Unknown Mission',
                    missionDescription: missionDetails?.description || '',
                };
            });

            setHistory(historyWithMissionDetails);
            setError(null);
        } catch (err) {
            console.error('Error fetching points history:', err);
            setError('Failed to load points history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [userName]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchHistory();
        // 添加一个小延迟，使刷新动画更明显
        setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    };

    const shift = (id: string, direction: "up" | "down") => {
        const index = history.findIndex((item) => item.id === id);
        let historyCopy = [...history];

        if (direction === "up") {
            if (index > 0) {
                [historyCopy[index], historyCopy[index - 1]] = [
                    historyCopy[index - 1],
                    historyCopy[index],
                ];
            }
        } else {
            if (index < historyCopy.length - 1) {
                [historyCopy[index], historyCopy[index + 1]] = [
                    historyCopy[index + 1],
                    historyCopy[index],
                ];
            }
        }

        setHistory(historyCopy);
    };

    if (loading && !isRefreshing) {
        return <div className="w-full p-8 text-center min-h-[200px] flex items-center justify-center">
            <BarLoader />
        </div>;
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="p-8">
                <div className="text-gray-500 mb-4">No points history available</div>
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="w-full bg-white shadow-lg rounded-lg">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
                <h3 className="text-lg font-medium">Points History</h3>
                <button
                    onClick={handleRefresh}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                    title="Refresh data"
                >
                    <FiRefreshCw className="w-5 h-5" />
                </button>
            </div>
            <table className="w-full">
                <thead>
                    <tr className="border-b-[1px] border-slate-200 text-slate-400 text-sm uppercase">
                        <th className="pl-4 w-8"></th>
                        <th className="text-start p-4 font-medium">Mission</th>
                        <th className="text-start p-4 font-medium">Points</th>
                        <th className="text-start p-4 font-medium">Date</th>
                    </tr>
                </thead>

                <tbody>
                    {history.map((item, index) => (
                        <TableRow
                            key={item.id}
                            item={item}
                            index={index}
                            shift={shift}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const TableRow = ({
    item,
    index,
    shift
}: {
    item: PointsHistoryItem;
    index: number;
    shift: (id: string, direction: "up" | "down") => void;
}) => {
    // 使用原生JavaScript格式化日期
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = months[date.getMonth()];
            const day = date.getDate();
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');

            return `${month} ${day}, ${year} ${hours}:${minutes}`;
        } catch (error) {
            return 'Unknown date';
        }
    };

    const formattedDate = item.createdTime ? formatDate(item.createdTime) : 'Unknown date';

    return (
        <motion.tr
            layoutId={`row-${item.id}`}
            className={`text-sm ${index % 2 ? "bg-slate-100" : "bg-white"}`}
        >
            <td className="pl-4 w-8 text-lg">

            </td>

            <td className="p-4">
                <div>
                    <span className="block mb-1 font-medium">{item.missionTitle}</span>
                    <span className="block text-xs text-slate-500">{item.missionDescription}</span>
                </div>
            </td>

            <td className="p-4">
                <div className={`flex items-center gap-2 font-medium ${item.points > 0 ? "text-green-500" : "text-red-500"
                    }`}>
                    <span>{item.points > 0 ? `+${item.points}` : item.points}</span>
                    {item.points > 0 && <FiAward className="text-xl" />}
                </div>
            </td>

            <td className="p-4 font-medium text-slate-600">{formattedDate}</td>
        </motion.tr>
    );
}; 