import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type SkillArea = {
  title: string;
  icon: string;
  description: ReactNode;
  technologies: string[];
};

const SkillAreas: SkillArea[] = [
  {
    title: 'Web Development',
    icon: '🌐',
    description: (
      <>
        Full-stack web development with modern frameworks. Building performant,
        scalable applications from backend APIs to rich interactive frontends.
      </>
    ),
    technologies: [
      'ASP.NET / ASP.NET Core',
      'Angular',
      'React',
      'Blazor',
      'TypeScript',
      'C#',
    ],
  },
  {
    title: 'Mobile Development',
    icon: '📱',
    description: (
      <>
        Cross-platform and native mobile application development, from iOS-first
        experiences to shared codebases that run everywhere.
      </>
    ),
    technologies: [
      'iOS (Objective-C)',
      'Swift',
      'Xamarin',
      '.NET MAUI',
    ],
  },
  {
    title: 'Data & Backend',
    icon: '🗄️',
    description: (
      <>
        Database design, optimization, and backend systems. Writing efficient
        queries and building reliable data layers that applications depend on.
      </>
    ),
    technologies: [
      'T-SQL',
      'SQL Server',
      'Entity Framework',
      'REST APIs',
      '.NET',
    ],
  },
];

function SkillCard({title, icon, description, technologies}: SkillArea) {
  return (
    <div className={clsx('col col--4')}>
      <div className="skill-card">
        <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>{icon}</div>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <div className="tech-tags">
          {technologies.map((tech) => (
            <span key={tech} className="tech-tag">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={clsx(styles.features, 'skills-section')}>
      <div className="container">
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <Heading as="h2">What I Work With</Heading>
          <p style={{fontSize: '1.1rem', opacity: 0.8}}>
            10+ years of building software across the full stack
          </p>
        </div>
        <div className="row">
          {SkillAreas.map((props, idx) => (
            <SkillCard key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
