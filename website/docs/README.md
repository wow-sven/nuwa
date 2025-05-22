# @docs Documentation Site

This project is the documentation and blog site for Nuwa, built with the [Nextra](https://nextra.site/) framework. Blog and documentation content are fetched from Notion, and several scripts are provided to generate AI-friendly content, such as embeddings and plain text files for downstream applications.

## Tech Stack

- [Nextra](https://nextra.site/) (Next.js-based documentation framework)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Notion](https://www.notion.so/) (content source)
- [pnpm](https://pnpm.io/) for package management

## Quick Start

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the development server:
   ```bash
   pnpm dev
   ```
3. Open your browser and visit [http://localhost:3000](http://localhost:3000)

## Directory Structure

- `app/` - Main Next.js application directory
- `components/` - Reusable React components
- `content/` - Markdown/MDX content (auto-generated or manually written)
- `public/` - Static assets
- `lib/` - Utility libraries and helpers
- `scripts/` - Scripts for content fetching, processing, and AI-friendly data generation

## Scripts for AI-friendly Content

The `scripts/` directory contains tools to:

- Fetch and sync content from Notion
- Generate plain text exports of documentation
- Create embeddings for AI and search applications

Refer to the scripts' source code and comments for usage details.

## Customized Commands

- `pnpm prebuild` Fetch Notion content or NIPS papers before building (see scripts/fetch_nips.ts)
- `pnpm postbuild` Generate static search indexes using Pagefind after build
- `pnpm generate-embeddings` Generate embeddings from markdown content for AI/search applications
