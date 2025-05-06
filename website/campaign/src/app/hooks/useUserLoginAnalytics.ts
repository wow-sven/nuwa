"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { track } from "@vercel/analytics";

export function useUserLoginAnalytics() {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            // 只在本 session 上报一次
            const reported = sessionStorage.getItem("user_login_reported");
            if (!reported) {
                const partner = localStorage.getItem("partner");
                track("user_login", {
                    name: session.user.name ?? "",
                    email: session.user.email ?? "",
                    twitterHandle: session.user.twitterHandle ?? "",
                    partner: partner ?? "",
                });
                sessionStorage.setItem("user_login_reported", "1");
            }
        }
    }, [status, session]);
} 