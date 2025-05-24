import { Client } from "@notionhq/client";
import { NotionAPI } from "notion-client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const notionApi = new NotionAPI();

const IMAGE_PROXY_SECRET = process.env.IMAGE_PROXY_SECRET;

export type NotionBlogPost = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  coverImage: string | null;
  tag: string;
  lastEditAt: string;
  slug: string;
};

export async function getBlogPostsFromNotion(
  databaseId: string
): Promise<NotionBlogPost[]> {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Publish",
      select: {
        equals: "Published",
      },
    },
    sorts: [
      {
        property: "Last Edit At",
        direction: "descending",
      },
    ],
  });

  return response.results.map((page: any) => {
    const properties = page.properties;
    const id = page.id;
    const authorPerson = properties["Author"]?.people?.[0];
    // extract raw image url
    const rawCover = properties["Cover Image"]?.files?.[0];
    // check if it is file or external link
    let coverUrl: string | null = null;
    if (rawCover?.file?.url) {
      coverUrl = `/api/image-proxy?url=${encodeURIComponent(rawCover.file.url)}&token=${IMAGE_PROXY_SECRET}`;
    } else if (rawCover?.external?.url) {
      // for external link, no proxy
      coverUrl = rawCover.external.url;
    }
    return {
      id,
      title: properties["Title"]?.title?.[0]?.plain_text || "",
      excerpt: properties["Excerpt"]?.rich_text?.[0]?.plain_text || "",
      author: authorPerson?.name || "",
      coverImage: coverUrl,
      tag: properties["Tag"]?.select?.name || "",
      lastEditAt: page["last_edited_time"],
      slug: properties["Slug"]?.rich_text?.[0]?.plain_text || "",
    };
  });
}

export async function getNotionPageBlocks(pageId: string) {
  return await notionApi.getPage(pageId);
}
