import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.profileImageShell}>
          <img
            src="/img/profile-image.png"
            alt="Portrait of Zach Cutler"
            className={styles.profileImage}
          />
        </div>
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className={clsx('hero__subtitle', styles.heroSubtitle)}>{siteConfig.tagline}</p>
        <p className={styles.introText}>
          Building modern web, mobile, and data-driven applications for over a
          decade. Welcome to my corner of the internet where I share what
          I&apos;m learning and building.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/blog">
            Read the Blog
          </Link>
          <Link
            className="button button--outline button--lg"
            style={{color: '#fff', borderColor: '#fff', marginLeft: '1rem'}}
            to="/about">
            About Me
          </Link>
        </div>
      </div>
    </header>
  );
}

function LatestPostsCTA(): ReactNode {
  return (
    <div className="cta-section">
      <div className="container">
        <Heading as="h2">From the Blog</Heading>
        <p className={styles.blogCtaText}>
          Discoveries, recent projects, and knowledge I think is worth sharing.
        </p>
        <Link className="button button--primary button--lg" to="/blog">
          Browse All Posts
        </Link>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Software Developer | Web, Mobile & Data"
      description="Zach Cutler — Software developer with 10+ years of experience in ASP.NET, Angular, React, Blazor, iOS, and more. Tech blog and portfolio.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <LatestPostsCTA />
      </main>
    </Layout>
  );
}
