import { getBlogPostsFromNotion } from "@/lib/notion";
import BlogPageClient from "./pageclient";

export const revalidate = 60; // 60 seconds auto refresh

export default async function BlogPage() {
  const posts = await getBlogPostsFromNotion(
    process.env.NOTION_BLOG_DATABASE_ID!
  );

  return <BlogPageClient posts={posts} />;
}
