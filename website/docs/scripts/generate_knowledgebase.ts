import fs from 'fs/promises';
import path from 'path';

const CONTENT_DIR = path.resolve('content');
const OUTPUT_FILE = path.resolve('public/knowledgebase.md');
const ALLOWED_EXTS = ['.md', '.mdx'];
const DOCS_PREFIX = 'https://nuwa.dev';

function parseMetaOrder(metaContent: string): string[] {
    const order: string[] = [];
    for (const line of metaContent.split('\n')) {
      const match = /^ *([\w-]+):/.exec(line);
      if (match && !match[1].startsWith('separator')) {
        order.push(match[1]);
      }
    }
    return order;
  }

async function getAllMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllMarkdownFiles(fullPath)));
    } else if (ALLOWED_EXTS.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function cleanMdxContent(content: string): string {
  // 删除 import ... from ...
  content = content.replace(/^import .+from .+;?$/gm, '');
  // 删除 <Component ...> 和 <Component .../> 及 </Component>
  content = content.replace(/^[ \t]*<[^>]+>[ \t]*$/gm, '');
  content = content.replace(/^[ \t]*<[^/>]+\/>[ \t]*$/gm, '');
  content = content.replace(/^[ \t]*<\/[A-Za-z0-9_-]+>[ \t]*$/gm, '');
  return content;
}

function replaceLinks(content: string): string {
  // [xxx](/docs/...) => [xxx](https://nuwa.dev/docs/...)
  return content.replace(/\]\((\/docs\/[^)]+)\)/g, `](${DOCS_PREFIX}$1)`);
}

function extractTitle(content: string, fileName: string): string {
  // frontmatter 以 --- 包裹，title: xxx
  const match = /^---[\s\S]*?title:\s*['"]?([^'"\n]+)['"]?/m.exec(content);
  if (match) {
    return match[1].trim();
  }
  return fileName;
}

async function main() {
  // 1. 解析 meta 顺序
  const metaPath = path.join(CONTENT_DIR, '_meta.ts');
  const metaContent = await fs.readFile(metaPath, 'utf8');
  const metaOrder = parseMetaOrder(metaContent);

  // 2. 收集所有 md/mdx 文件
  const allFiles = await getAllMarkdownFiles(CONTENT_DIR);
  // 3. 生成文件名到路径的映射
  const fileMap: Record<string, string> = {};
  for (const file of allFiles) {
    const rel = path.relative(CONTENT_DIR, file).replace(/\\/g, '/');
    // 只保留主文件名（不含扩展名和子目录）
    const key = rel.startsWith('nips/') ? rel : path.basename(rel, path.extname(rel));
    fileMap[key] = file;
  }

  // 4. 按 meta 顺序聚合
  let orderedFiles: string[] = [];
  for (const key of metaOrder) {
    if (key === 'nips') {
      // nips 目录特殊处理
      const nipsDir = path.join(CONTENT_DIR, 'nips');
      const nipsFiles = (await fs.readdir(nipsDir))
        .filter(f => ALLOWED_EXTS.includes(path.extname(f)) && f !== '_meta.ts')
        .sort();
      // overview.md 优先
      if (nipsFiles.includes('overview.md')) {
        orderedFiles.push(path.join(nipsDir, 'overview.md'));
      }
      for (const f of nipsFiles) {
        if (f !== 'overview.md') {
          orderedFiles.push(path.join(nipsDir, f));
        }
      }
    } else if (fileMap[key]) {
      orderedFiles.push(fileMap[key]);
    }
  }
  // 5. 剩余未在 meta 的文件
  const used = new Set(orderedFiles.map(f => path.resolve(f)));
  const restFiles = allFiles.filter(f => !used.has(path.resolve(f))).sort();
  orderedFiles = [...orderedFiles, ...restFiles];

  // 6. 聚合内容
  let output = '';
  for (const file of orderedFiles) {
    const ext = path.extname(file);
    let content = await fs.readFile(file, 'utf8');
    if (ext === '.mdx') {
      content = cleanMdxContent(content);
    }
    content = replaceLinks(content);
    const fileName = path.basename(file, path.extname(file));
    const title = extractTitle(content, fileName);
    output += `\n\n# ${title}\n\n`;
    output += content.trim() + '\n';
  }
  await fs.writeFile(OUTPUT_FILE, output.trimStart(), 'utf8');
  console.log(`Knowledgebase generated: ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 