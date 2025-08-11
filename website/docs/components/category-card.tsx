import Link from "next/link";

interface CategoryCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    delay?: number;
}

export const CategoryCard = ({ title, description, icon, href, delay }: CategoryCardProps) => {
    return (
        <Link href={href} className="block">
            <div
                className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm border border-gray-200 dark:border-zinc-700 rounded-lg p-6 hover:shadow-lg dark:hover:shadow-zinc-900/30 transition-shadow cursor-pointer"
            >
                <div className="size-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center mb-4">
                    {icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{description}</p>
            </div>
        </Link>
    );
};