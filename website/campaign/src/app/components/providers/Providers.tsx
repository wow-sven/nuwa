'use client'

import { SessionProvider, useSession } from "next-auth/react";
import { FloatingNav } from "../navigation/FloatingNav";
import { MissionsProvider } from "../../context/MissionsContext";

function NavWrapper() {
    const { data: session, status } = useSession();

    if (status === "loading" || !session) {
        return null;
    }

    return <FloatingNav />;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <MissionsProvider>
                <NavWrapper />
                {children}
            </MissionsProvider>
        </SessionProvider>
    );
} 