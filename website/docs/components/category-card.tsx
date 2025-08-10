import { motion } from "framer-motion";
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
            <motion.div
                className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay, duration: 0.6 }}
            >
                <div className="size-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                    {icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </motion.div>
        </Link>
    );
};