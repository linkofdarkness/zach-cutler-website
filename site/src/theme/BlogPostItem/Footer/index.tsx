import React from 'react';
import OriginalBlogPostItemFooter from '@theme-original/BlogPostItem/Footer';
import type {Props} from '@theme/BlogPostItem/Footer';

export default function BlogPostItemFooter(props: Props): JSX.Element {
  return (
    <>
      <OriginalBlogPostItemFooter {...props} />
      {props.isBlogPostPage ? (
        <section className="author-disclaimer-footer">
          <h2 className="author-disclaimer-footer__title">About the Author</h2>
          <p>
            I&apos;m Zach Cutler, a software developer sharing practical notes
            from real projects and experiments in web, mobile, and data
            development.
          </p>
          <h3 className="author-disclaimer-footer__subtitle">Disclaimer</h3>
          <p>
            This is a personal, for-fun blog. I don&apos;t claim expertise on
            every topic covered here, and while I strive for accuracy, some
            details may be incomplete, incorrect, or become outdated over time.
            Please verify details against official documentation before applying
            them in production.
          </p>
        </section>
      ) : null}
    </>
  );
}
