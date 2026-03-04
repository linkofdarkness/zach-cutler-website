import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Zach Cutler',
  tagline: 'Software Developer | Web, Mobile & Data',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://zachcutler.me',
  baseUrl: '/',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'keywords',
        content:
          'Zach Cutler, software engineer, app developer, web development, ASP.NET, Angular, React, Blazor, .NET, C#, SQL, tech blog',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'author',
        content: 'Zach Cutler',
      },
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: {
          routeBasePath: 'blog',
          showReadingTime: true,
          blogTitle: "Zach Cutler's Tech Blog",
          blogDescription:
            'Discoveries, projects, and knowledge sharing from a software developer with 10+ years of experience in web and mobile development.',
          blogSidebarTitle: 'Recent Posts',
          blogSidebarCount: 10,
          postsPerPage: 10,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
            title: "Zach Cutler's Tech Blog",
            description:
              'Discoveries, projects, and knowledge sharing from a software developer.',
            copyright: `Copyright © ${new Date().getFullYear()} Zach Cutler`,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly' as const,
          priority: 0.5,
        },
        gtag: undefined,
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    metadata: [
      {
        name: 'og:type',
        content: 'website',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    ],
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Zach Cutler',
      items: [
        {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/about', label: 'About', position: 'left'},
        {
          href: 'https://github.com/linkofdarkness',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://linkedin.com/in/zacharytcutler',
          label: 'LinkedIn',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Site',
          items: [
            {label: 'Blog', to: '/blog'},
            {label: 'About', to: '/about'},
          ],
        },
        {
          title: 'Connect',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/zachcutler',
            },
            {
              label: 'LinkedIn',
              href: 'https://linkedin.com/in/zachcutler',
            },
          ],
        },
        {
          title: 'Subscribe',
          items: [
            {label: 'RSS Feed', href: 'https://zachcutler.me/blog/rss.xml'},
            {label: 'Atom Feed', href: 'https://zachcutler.me/blog/atom.xml'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Zach Cutler. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['csharp', 'sql', 'javascript', 'markup', 'bash', 'json', 'swift', 'xml-doc'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
