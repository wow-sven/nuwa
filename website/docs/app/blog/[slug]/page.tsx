import { getNotionPageBlocks, getBlogPostsFromNotion } from "@/lib/notion";
import BlogPostClient from "./BlogPostClient";

export async function generateMetadata({ params }) {
  const posts = await getBlogPostsFromNotion(
    process.env.NOTION_BLOG_DATABASE_ID!
  );
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://nuwa.dev/blog/${post.slug}`,
      type: "article",
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              alt: post.title,
              width: 1200,
              height: 630,
            },
          ]
        : undefined,
      publishedTime: post.lastEditAt,
      modifiedTime: post.lastEditAt,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPost(props) {
  const { slug } = await props.params;
  // 获取所有文章，找到当前id对应的meta
  const posts = await getBlogPostsFromNotion(
    process.env.NOTION_BLOG_DATABASE_ID!
  );
  const post = posts.find((p) => p.slug === slug);
  if (!post) return <div>Not found</div>;

  const recordMap = await getNotionPageBlocks(post.id);

  return <BlogPostClient post={post} recordMap={recordMap} />;
}
