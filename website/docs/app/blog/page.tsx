import { getBlogPostsFromNotion } from "@/lib/notion";
import BlogPageClient from "./pageclient";

export default async function BlogPage() {
  const posts = await getBlogPostsFromNotion(
    process.env.NOTION_BLOG_DATABASE_ID!
  );

  return <BlogPageClient posts={posts} />;
}
