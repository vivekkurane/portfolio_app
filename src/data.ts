export const profile = {
  name: 'Vivekanand Kurane',
  email: 'vivekkurane90@gmail.com',
  phone: '+919767600446',
  phoneDisplay: '+91 97676 00446',
  linkedin: 'https://linkedin.com/in/vivekanand-kurane-47732a207',
  location: 'Pune, Maharashtra',
  roles: ['agentic AI platforms', 'LangGraph pipelines', 'full-stack web apps', 'human-in-the-loop systems'],
  lead: 'Software Engineer with 5+ years across full-stack enterprise apps and agentic AI platform engineering — turning complex requirements into reliable, human-in-the-loop systems.',
  about: 'I own work end-to-end — from backend services and data pipelines to polished frontends — in Agile, cross-functional teams. At Deloitte I help build SAGE, an agentic platform that converts ERP requirements documents into reviewed, executed Workday configuration builds. Before that, I spent four-plus years at TCS shipping enterprise Angular, Node.js and Spring Boot applications.',
};

export const stats = [
  { n: 5, suffix: '+', label: 'Years of experience' },
  { n: 75, suffix: '%', label: 'Faster mortgage processing' },
  { n: 10, suffix: '+', label: 'Production issues root-caused' },
  { n: 14, suffix: '', label: 'Angular v4 → v14 migration' },
];

export const experience = [
  { title: 'Software Engineer', company: 'Deloitte · Pune', period: 'Jun 2026 – Present', points: [
    'Building SAGE, an agentic AI platform in Deloitte’s “Future of Delivery” initiative that turns ERP BRDs into executed Workday configuration builds.',
    'Full-stack contributions: Python/FastAPI, a LangGraph Map → Plan → Human Review → Execute pipeline, Postgres/pgvector retrieval, Claude-driven reasoning and a Next.js/React review UI.',
    'Built a missing executor and custom key-value parser for a non-standard BRD layout, backed by regression tests.',
    'Root-caused a name-normalization bug silently failing allowlist checks and fixed it with a targeted alias table.',
    'Contributed to a plugin-style architecture of dozens of object-type packages behind human-review and dry-run/canary safety gates.',
  ] },
  { title: 'System Engineer', company: 'Tata Consultancy Services · Pune', period: 'Dec 2021 – Jun 2026', points: [
    'Spearheaded an Angular 4 → 14 migration, improving performance and maintainability with Ivy and strict typing.',
    'Built in-memory caching and RxJS data-binding patterns for real-time updates, cutting retrieval time and latency.',
    'Optimized customer-facing interfaces for a 20% reduction in turnaround time; improved reporting accuracy by 4%.',
    'Root-caused 10+ production issues and worked with cross-functional teams on requirements and roadmaps.',
  ] },
];

export const projects = [
  { name: 'SAGE', meta: 'Deloitte · 2026 – Present', text: 'Agentic AI platform converting ERP Business Requirements Documents into executed configuration builds, with a human-in-the-loop approval gate.', tags: ['Python', 'FastAPI', 'LangGraph', 'Claude', 'pgvector', 'Next.js'] },
  { name: 'RDD – Renewal Due Diligence', meta: 'TCS · 2023 – 2026', text: 'Enterprise renewal due-diligence application on the MEAN stack with real-time data views and optimized API performance.', tags: ['Angular', 'Node.js', 'Express', 'MongoDB'] },
  { name: 'MMortgage', meta: 'TCS · 2021 – 2022', text: 'Mortgage renewal system with real-time selection tools, achieving a 75% reduction in processing time via API and data-pipeline optimization.', tags: ['Angular', 'Spring Boot'] },
];

export const skills = [
  { group: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'SQL', 'Java', 'HTML/CSS'] },
  { group: 'Backend & AI', items: ['FastAPI', 'Node.js', 'LangGraph', 'LangChain', 'LangFuse', 'RAG', 'PostgreSQL', 'REST', 'Microservices'] },
  { group: 'Frontend', items: ['Next.js', 'React', 'Angular', 'RxJS', 'NgRx', 'Bootstrap'] },
  { group: 'Data & DevOps', items: ['MongoDB', 'CI/CD', 'Git', 'Agile/Scrum'] },
];

export const extras = [
  { title: 'Certifications', items: ['Claude Associate, Developer & Architect — Foundational', 'Associate & Professional Cloud Developer', 'GitHub Foundations · MEAN Stack · Bootstrap 4 · JavaScript'] },
  { title: 'Awards · TCS-CIBC', items: ['Outstanding Performance Award', 'Service & Commitment Award', 'On the Spot Award'] },
  { title: 'Education', items: ['B.Tech, Mechanical Engineering — Sharad Institute of Technology (2021)', 'Diploma, Mechanical Engineering — New Polytechnic Kolhapur (2018)'] },
];

export const sections = [
  { id: 'about', label: 'About' }, { id: 'exp', label: 'Experience' }, { id: 'work', label: 'Projects' },
  { id: 'skills', label: 'Skills' }, { id: 'contact', label: 'Contact' },
];
