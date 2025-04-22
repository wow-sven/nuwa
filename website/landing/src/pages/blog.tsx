import { ExpandableNavBar } from "@/components/navigation/ExpandableNavBar";
import { NAV_LINKS } from "@/components/navigation/DesktopLinks";
import { Footer } from "@/components/footer/Footer";
import { font } from "@/fonts";
import { getAllBlogPosts, getAllTags } from "@/lib/blog";
import { GetStaticProps } from "next";
import { useState } from "react";
import { BlogFilter } from "@/components/blog/BlogFilter";
import { BlogGrid } from "@/components/blog/BlogGrid";

interface BlogPageProps {
    posts: {
        slug: string;
        title: string;
        date: string;
        author: string;
        excerpt: string;
        coverImage: string;
        tag: string;
    }[];
    tags: string[];
}

export default function Blog({ posts: initialPosts, tags }: BlogPageProps) {
    const [filteredPosts, setFilteredPosts] = useState(initialPosts);

    return (
        <main className={`${font.className} overflow-hidden`}>
            <ExpandableNavBar links={NAV_LINKS} />
            <div className="bg-zinc-50 py-16 md:py-24">
                <div className="mx-auto max-w-6xl px-4">
                    <h1 className="mb-8 text-4xl font-bold md:text-5xl">Nuwa Blog</h1>
                    <p className="mb-12 text-lg text-zinc-600">
                        Explore our latest articles, insights, and updates
                    </p>

                    <BlogFilter
                        tags={tags}
                        posts={initialPosts}
                        onFilterChange={setFilteredPosts}
                    />

                    <BlogGrid posts={filteredPosts} />
                </div>
            </div>
            <Footer />
        </main>
    );
}

export const getStaticProps: GetStaticProps<BlogPageProps> = async () => {
    const posts = getAllBlogPosts();
    const tags = getAllTags();

    return {
        props: {
            posts,
            tags,
        },
    };
}; 