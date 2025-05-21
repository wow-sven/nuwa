import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import dotenv from "dotenv";
import cliProgress from "cli-progress";
import { createClient } from "@supabase/supabase-js";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" });
  dotenv.config({ path: ".env.development.local", override: true });
}

// 初始化 OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const contentDir = path.join(process.cwd(), "content");

function splitText(text: string, maxLen = 500): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const chunks: string[] = [];
  let current = "";
  for (const p of paragraphs) {
    if ((current + "\n\n" + p).length > maxLen) {
      chunks.push(current.trim());
      current = p;
    } else {
      current += "\n\n" + p;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

async function extractTextFromMarkdown(filePath: string): Promise<string[]> {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(raw);
  const tree = unified().use(remarkParse).parse(content);
  const texts: string[] = [];

  visit(tree, "paragraph", (node: any) => {
    const paragraph = node.children.map((n: any) => n.value || "").join("");
    if (paragraph) texts.push(paragraph);
  });

  return splitText(texts.join("\n\n"));
}

function getAllMarkdownFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(filePath));
    } else if (file.endsWith(".md") || file.endsWith(".mdx")) {
      results.push(filePath);
    }
  }
  return results;
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const files = getAllMarkdownFiles(contentDir);

  // 统计总 chunk 数
  let totalChunks = 0;
  const fileChunks: { file: string; count: number }[] = [];
  for (const filePath of files) {
    const chunks = await extractTextFromMarkdown(filePath);
    fileChunks.push({ file: filePath, count: chunks.length });
    totalChunks += chunks.length;
  }

  // 初始化进度条
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(totalChunks, 0);

  let processed = 0;
  for (const { file } of fileChunks) {
    const relativeFile = path.relative(contentDir, file);
    const chunks = await extractTextFromMarkdown(file);
    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i];
      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      const { error } = await supabase.from("knowledge_embeddings").insert({
        airtable_id: `${relativeFile}#${i}`,
        content: text,
        embedding: embeddingRes.data[0].embedding,
      });
      if (error) {
        console.error(
          `❌ Failed to insert embedding for ${relativeFile}#${i}:`,
          error
        );
      }
      processed++;
      bar.update(processed);
    }
  }

  bar.stop();
  console.log(`✅ Embeddings uploaded to Supabase knowledge_embeddings table.`);
}

main().catch(console.error);
