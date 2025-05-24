import Link from "next/link";
import Image from "next/image";
import { NotionBlogPost } from "@/lib/notion";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const BlogPostCard = ({ post }: { post: NotionBlogPost }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  return (
    <Link
      key={post.id}
      href={`/blog/${post.slug}`}
      className="block"
      tabIndex={0}
      aria-label={post.title}
    >
      <article className="relative isolate flex flex-col gap-8 lg:flex-row hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors rounded-2xl p-2">
        <div className="relative aspect-video sm:aspect-2/1 lg:w-96 lg:shrink-0">
          {post.coverImage && (
            <>
              {!isImageLoaded && (
                <Skeleton className="absolute inset-0 rounded-2xl" />
              )}
              <Image
                alt={post.title}
                src={post.coverImage}
                width={600}
                height={338}
                className="rounded-2xl object-cover"
                priority={true}
                onLoadingComplete={() => setIsImageLoaded(true)}
                style={{ display: isImageLoaded ? "block" : "none" }}
                unoptimized
              />
            </>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center gap-x-4 text-xs">
            <time
              dateTime={post.lastEditAt}
              className="text-gray-500 dark:text-gray-400"
            >
              {new Date(post.lastEditAt).toLocaleDateString()}
            </time>
            {post.tag && (
              <span className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                {post.tag}
              </span>
            )}
          </div>
          <div className="group relative max-w-xl">
            <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600 dark:text-white">
              {post.title}
            </h3>
            <p className="mt-5 text-sm/6 text-gray-600 line-clamp-3 dark:text-gray-300">
              {post.excerpt}
            </p>
          </div>
          <div className="mt-1 flex border-t border-gray-900/5 pt-2 dark:border-gray-100/5">
            <div className="relative flex items-center gap-x-4">
              <div className="text-sm/6">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {post.author}
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};
