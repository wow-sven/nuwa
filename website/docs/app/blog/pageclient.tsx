"use client";
import { BlogPostCard } from "@/components/blog-post-card";
import { NotionBlogPost } from "@/lib/notion";
import BlogFilter from "@/components/blog-filter";
import { useState } from "react";

type BlogPageClientProps = {
  posts: NotionBlogPost[];
};

export default function BlogPageClient({ posts }: BlogPageClientProps) {
  const [filteredPosts, setFilteredPosts] = useState<NotionBlogPost[]>(posts);
  const tags = Array.from(new Set(posts.map((post) => post.tag)));

  const handleFilterChange = (filteredPosts: NotionBlogPost[]) => {
    setFilteredPosts(filteredPosts);
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Our Blog
          </h2>
          <p className="mt-2 text-lg/8 text-gray-600 dark:text-gray-300">
            Learn about our latest news and thoughts.
          </p>
          <BlogFilter
            tags={tags}
            onFilterChange={handleFilterChange}
            posts={posts}
          />
          <div className="mt-2 space-y-20 lg:space-y-20">
            {filteredPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
