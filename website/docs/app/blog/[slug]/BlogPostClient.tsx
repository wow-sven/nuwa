"use client";
import { NotionRenderer } from "react-notion-x";
import "react-notion-x/src/styles.css";
import "prismjs/themes/prism-tomorrow.css";
import Image from "next/image";
import "./notion-custom.css";

export default function BlogPostClient({ post, recordMap }) {
  return (
    <article className="bg-zinc-50 py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 mx-auto w-full max-w-4xl flex items-center justify-center bg-white rounded-lg overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1000}
            height={800}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">{post.title}</h1>
        <p className="mb-8 text-lg text-zinc-500">
          {new Date(post.lastEditAt).toLocaleDateString()} • {post.author}
        </p>
        <div className="prose prose-lg">
          <NotionRenderer
            recordMap={recordMap}
            fullPage={false}
            darkMode={false}
            components={{ Collection: () => null }}
          />
        </div>
      </div>
    </article>
  );
}
