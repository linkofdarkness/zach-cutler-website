# zachcutler.dev

Personal portfolio and tech blog built with [Docusaurus](https://docusaurus.io/).

## Quick Start

```bash
cd site
npm install
npm start
```

The site will be available at `http://localhost:3000`.

## Writing a Blog Post

Create a new directory in the `blog/` folder. The directory name should follow the format `YYYY-slug` (e.g., `2026-my-post`), and the main file should be named `index.md`. This folder-based layout allows you to co-locate images and other assets with your posts. For simple, asset-free posts, you can also write a standalone file named `YYYY-slug.md`.

### Minimal post template

```markdown
---
slug: my-post-slug
title: "Post Title Here"
date: 2026-07-12
last_update:
  date: 2026-07-12
  author: Zach Cutler
authors:
  - name: Zach Cutler
tags: [dotnet, tips]
description: "A short description for SEO and social sharing."
keywords: [relevant, search, terms]
---

Intro paragraph shown on the blog listing page.

<!-- truncate -->

Rest of the post content goes here. Use standard Markdown.
```

### Front matter fields

| Field         | Required | Purpose                                    |
| ------------- | -------- | ------------------------------------------ |
| `slug`        | Yes      | URL path for the post (`/blog/{slug}`)     |
| `title`       | Yes      | Post title                                 |
| `date`        | Yes      | Original publication date (`YYYY-MM-DD`)    |
| `last_update` | No       | Last edit date and author override block   |
| `authors`     | Yes      | Inline author metadata for SEO tags        |
| `tags`        | Yes      | Tag key(s) from `blog/tags.yml`            |
| `description` | Yes      | SEO meta description / social card summary |
| `keywords`    | No       | Additional SEO keywords                    |
| `image`       | No       | Social sharing image (og:image)            |
| `draft`       | No       | Set to `true` to hide from production      |

### Adding new tags

Add entries to `blog/tags.yml`:

```yaml
newtag:
  label: New Tag
  permalink: /newtag
  description: Description for this tag.
```

## Building for Production

```bash
npm run build
```

Static output goes to `build/`. Serve it with any static file host.

## Project Structure

```
site/
├── blog/              # Blog posts (Markdown)
│   └── tags.yml       # Tag definitions
├── src/
│   ├── components/    # React components
│   ├── css/           # Global styles
│   └── pages/         # Static pages (home, about)
├── static/            # Static assets (images, favicon)
└── docusaurus.config.ts
```
