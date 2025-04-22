import React from "react";
import { TwitterLoginButton } from "@/app/components/auth/TwitterLoginButton";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";

export const UserProfilePanel = () => {
    const { data: session, status } = useSession();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-4 mb-6"
        >
            <div className="flex flex-col items-center">
                {status === "loading" ? (
                    <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                        <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                ) : session ? (
                    <div className="flex flex-col items-center">
                        <div className="flex items-center space-x-3 mb-3">
                            {session.user?.image && (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || "User avatar"}
                                    className="w-12 h-12 rounded-full border-2 border-indigo-500"
                                />
                            )}
                            <div className="text-left">
                                <p className="font-medium text-lg">{session.user?.name}</p>
                                <p className="text-sm text-gray-500">@{session.user?.twitterHandle}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="mb-3 text-gray-600">Sign in to participate in campaigns</p>
                        <TwitterLoginButton />
                    </div>
                )}
            </div>
        </motion.div>
    );
}; 