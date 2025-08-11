"use client";

import Image from "next/image";
import useDarkMode from "@/hooks/use-dark-mode";

export default function Background({ children }) {
    const isDark = useDarkMode();

    if (isDark) {
        return <>{children}</>;
    }

    return (<>
        <div className="fixed inset-0 -z-10">
            <Image
                src="/assets/bg.png"
                alt="Hero background with gradient colors"
                fill
                className="object-cover opacity-20"
                priority
            />
            {/* overlay */}
            <div className="absolute inset-0 bg-white/10"></div>
        </div>
        <div className="relative z-10">
            {children}
        </div>
    </>
    );
}