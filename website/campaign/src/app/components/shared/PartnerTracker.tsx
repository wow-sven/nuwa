"use client"
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";

export default function PartnerTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const partner = searchParams.get("partner");
        if (partner) {
            // Report custom event to Vercel Analytics
            track("partner_visit", { partner });
        }
    }, [searchParams]);

    return null;
} 