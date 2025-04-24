import { BarLoader } from "@/components/shared/BarLoader";

export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <BarLoader />
        </div>
    );
} 