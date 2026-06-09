# zachcutler.dev

Welcome to the public repository for **zachcutler.dev**, the personal portfolio website and technical blog of Zach Cutler.

## About Zach Cutler

I'm **Zach Cutler**, a software developer with over a decade of professional experience crafting robust, scalable applications across the web, mobile, and data tiers. My passion lies in writing clean, maintainable, and production-ready code while continuously learning and refining my engineering practices. 

Over my career, I've specialized in:
* **Web Development**: Building everything from enterprise line-of-business software to modern public-facing applications. My core expertise is in C#/.NET (ASP.NET Core APIs, Blazor, and MVC) combined with frontend ecosystems like Angular (TypeScript, RxJS) and React.
* **Mobile Engineering**: Shipping native iOS apps (Swift & Objective-C) and cross-platform solutions utilizing Xamarin and .NET MAUI.
* **Database & Data Architecture**: Designing high-performance data layers, complex T-SQL queries, and Entity Framework integrations on SQL Server.

For more details, check out my [About Me](/about) page on the live site.

## About The Blog & Projects

This repository acts as the public codebase for my technical blog and portfolio website. It serves as a living, documented catalog of my engineering journey. As I explore new frameworks, build self-hosted systems, and tackle complex software design challenges, I document my progress here.

Topics and project walkthroughs documented on the blog include:
* **Infrastructure & Containerization**: Setting up and orchestrating self-hosted platforms (e.g., Immich, Docker-managed agent setups).
* **Developer Workflows & Automation**: Establishing secure personal automation pipelines, such as integrating GitHub Apps for credentials-free repository operations.
* **Architectural Deep Dives**: Sharing insights, gotchas, and patterns across backend development, database optimization, and frontend architectures.

## Tech Stack of the Blog

The website is built with a modern, static-site generator framework designed for developers:
* **Core Framework**: [Docusaurus](https://docusaurus.io/) (v4), leveraging React and TypeScript to produce a highly performant single-page-application feel with static SEO benefits.
* **Visual Diagrams**: Integrated `@docusaurus/theme-mermaid` to render rich, interactive architectural diagrams directly in markdown posts.
* **Syntax Highlighting**: Custom [Prism](https://prismjs.com/) configuration supporting multiple languages including C#, T-SQL, Swift, Bash, JSON, and JavaScript.
* **Styling & Theme**: Responsive layout featuring default dark-mode styling with automatic user color scheme detection.
* **Syndication**: Out-of-the-box support for RSS and Atom feeds to make subscribing easy.

## Getting Started

To run the site locally for development:

```bash
cd site
npm install
npm start
```

The site will be available locally at `http://localhost:3000`.

For full documentation on writing new posts, configuring tags, or building for production, see the [site/README.md](site/README.md) file.

