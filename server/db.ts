import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_PATH = path.resolve(process.cwd(), 'hirehub.sqlite');
export const db = new DatabaseSync(DB_PATH);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'candidate',
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      avatar_url TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_verified INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      logo_url TEXT,
      website TEXT,
      industry TEXT NOT NULL,
      company_size TEXT DEFAULT '11-50 employees',
      location TEXT NOT NULL,
      about_text TEXT,
      verified INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS candidate_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      headline TEXT,
      bio TEXT,
      experience_years REAL DEFAULT 0.0,
      current_location TEXT,
      portfolio_url TEXT,
      linkedin_url TEXT,
      github_url TEXT,
      expected_salary REAL,
      education_json TEXT,
      experience_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recruiter_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      company_id INTEGER NOT NULL,
      designation TEXT NOT NULL,
      department TEXT,
      is_approved INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      category TEXT DEFAULT 'Technical',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS candidate_skills (
      candidate_profile_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      PRIMARY KEY (candidate_profile_id, skill_id),
      FOREIGN KEY (candidate_profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recruiter_id INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT NOT NULL,
      responsibilities TEXT,
      location TEXT NOT NULL,
      work_mode TEXT DEFAULT 'remote',
      employment_type TEXT DEFAULT 'full-time',
      experience_level TEXT DEFAULT 'mid',
      min_salary REAL,
      max_salary REAL,
      currency TEXT DEFAULT 'USD',
      is_active INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      application_deadline TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS job_skills (
      job_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      PRIMARY KEY (job_id, skill_id),
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      is_default INTEGER DEFAULT 0,
      uploaded_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      candidate_id INTEGER NOT NULL,
      resume_id INTEGER,
      cover_letter TEXT,
      status TEXT DEFAULT 'applied',
      interview_date TEXT,
      interview_link TEXT,
      recruiter_notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(job_id, candidate_id),
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS application_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      changed_by_user_id INTEGER NOT NULL,
      previous_status TEXT,
      new_status TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
      FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS saved_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL,
      saved_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, job_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );
  `);

  // Seed default data if empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  console.log('Seeding HireHub database with realistic sample data...');

  const passwordHash = bcrypt.hashSync('password123', 10);
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);

  // 1. Insert Skills
  const defaultSkills = [
    ['React', 'Frontend'],
    ['TypeScript', 'Languages'],
    ['JavaScript', 'Languages'],
    ['Node.js', 'Backend'],
    ['Python', 'Backend'],
    ['FastAPI', 'Backend'],
    ['SQL', 'Database'],
    ['PostgreSQL', 'Database'],
    ['MySQL', 'Database'],
    ['Tailwind CSS', 'Frontend'],
    ['Next.js', 'Frontend'],
    ['Docker', 'DevOps'],
    ['AWS', 'Cloud'],
    ['GraphQL', 'Backend'],
    ['Machine Learning', 'Data Science'],
    ['UI/UX Design', 'Design'],
    ['Figma', 'Design'],
    ['Kubernetes', 'DevOps'],
    ['Go', 'Backend'],
    ['Product Management', 'Management']
  ];

  const insertSkill = db.prepare('INSERT INTO skills (name, category) VALUES (?, ?)');
  for (const [name, cat] of defaultSkills) {
    insertSkill.run(name, cat);
  }

  // 2. Insert Companies
  const insertCompany = db.prepare(`
    INSERT INTO companies (name, slug, logo_url, website, industry, company_size, location, about_text, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  insertCompany.run(
    'TechNova Solutions',
    'technova-solutions',
    'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80',
    'https://technova.io',
    'Enterprise Software',
    '51-200 employees',
    'San Francisco, CA',
    'TechNova builds scalable cloud management platforms and AI orchestration tools for modern digital enterprises worldwide.'
  );

  insertCompany.run(
    'CloudScale Systems',
    'cloudscale-systems',
    'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
    'https://cloudscale.systems',
    'Cloud & Infrastructure',
    '201-500 employees',
    'Seattle, WA',
    'Providing ultra-low latency serverless infrastructure and developer productivity suites for high-growth tech companies.'
  );

  insertCompany.run(
    'NexaHealth AI',
    'nexahealth-ai',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&auto=format&fit=crop&q=80',
    'https://nexahealth.ai',
    'HealthTech & AI',
    '11-50 employees',
    'Boston, MA',
    'Transforming clinical diagnosis and patient care through state-of-the-art multimodal vision and language models.'
  );

  insertCompany.run(
    'Finova Capital',
    'finova-capital',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80',
    'https://finovacapital.com',
    'FinTech',
    '51-200 employees',
    'New York, NY',
    'Next-generation algorithmic trading, embedded payments, and secure cross-border treasury solutions.'
  );

  insertCompany.run(
    'PulseCreative Studio',
    'pulsecreative-studio',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    'https://pulsecreative.design',
    'Design & Creative',
    '11-50 employees',
    'Austin, TX',
    'Award-winning product design and digital brand identity studio partnering with visionary tech founders.'
  );

  // 3. Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, role, first_name, last_name, phone, avatar_url, is_active, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)
  `);

  // Candidate: Alex Chen
  insertUser.run(
    'alex.candidate@example.com',
    passwordHash,
    'candidate',
    'Alex',
    'Chen',
    '+1 (555) 234-5678',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );

  // Candidate 2: Maya Patel
  insertUser.run(
    'maya.candidate@example.com',
    passwordHash,
    'candidate',
    'Maya',
    'Patel',
    '+1 (555) 876-5432',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  );

  // Recruiter 1: Sarah Jenkins (TechNova)
  insertUser.run(
    'sarah.recruiter@technova.io',
    passwordHash,
    'recruiter',
    'Sarah',
    'Jenkins',
    '+1 (555) 345-6789',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  );

  // Recruiter 2: Marcus Vance (CloudScale)
  insertUser.run(
    'marcus.recruiter@cloudscale.com',
    passwordHash,
    'recruiter',
    'Marcus',
    'Vance',
    '+1 (555) 987-6543',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  );

  // Admin: David Miller
  insertUser.run(
    'admin@hirehub.com',
    adminPasswordHash,
    'admin',
    'David',
    'Miller',
    '+1 (555) 123-9999',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  );

  // 4. Candidate Profiles
  const insertCandidateProfile = db.prepare(`
    INSERT INTO candidate_profiles (
      user_id, headline, bio, experience_years, current_location, 
      portfolio_url, linkedin_url, github_url, expected_salary, education_json, experience_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const alexEducation = JSON.stringify([
    {
      degree: 'B.S. in Computer Science',
      institution: 'University of California, Berkeley',
      year: '2019 - 2023',
      grade: '3.8 GPA'
    }
  ]);

  const alexExperience = JSON.stringify([
    {
      title: 'Senior Software Engineer',
      company: 'AppVenture Labs',
      location: 'San Francisco, CA',
      period: '2023 - Present',
      description: 'Architected microservices using React, Node.js, and TypeScript serving 1.2M monthly active users.'
    },
    {
      title: 'Full Stack Developer Intern',
      company: 'ByteLogic Inc.',
      location: 'Oakland, CA',
      period: 'Summer 2022',
      description: 'Built customer onboarding dashboards and automated REST API test coverage.'
    }
  ]);

  insertCandidateProfile.run(
    1,
    'Senior Full-Stack Engineer | React, TypeScript & Node.js',
    'Passionate engineer with 5+ years building performant web apps and scalable distributed backends. Enthusiastic about TypeScript, clean architecture, and modern developer ergonomics.',
    5.0,
    'San Francisco, CA (Open to Remote)',
    'https://alexchen.dev',
    'https://linkedin.com/in/alexchen-dev',
    'https://github.com/alexchen-dev',
    155000,
    alexEducation,
    alexExperience
  );

  // Link Alex to skills
  const linkSkill = db.prepare('INSERT INTO candidate_skills (candidate_profile_id, skill_id) VALUES (?, ?)');
  [1, 2, 3, 4, 10, 12].forEach(skillId => linkSkill.run(1, skillId));

  // Maya profile
  insertCandidateProfile.run(
    2,
    'Data Scientist & ML Engineer | Python, PyTorch & SQL',
    'Specialized in predictive models, deep neural networks, and scalable feature engineering.',
    3.5,
    'New York, NY',
    'https://mayapatel.ai',
    'https://linkedin.com/in/mayapatel-ai',
    'https://github.com/mayapatel-ai',
    140000,
    JSON.stringify([{ degree: 'M.S. in Data Science', institution: 'Columbia University', year: '2021 - 2023' }]),
    JSON.stringify([{ title: 'Machine Learning Engineer', company: 'QuantMetrics', period: '2023 - Present', description: 'Trained LLM fine-tuning pipelines and tabular forecasting models.' }])
  );
  [5, 6, 7, 8, 15].forEach(skillId => linkSkill.run(2, skillId));

  // 5. Recruiter Profiles
  const insertRecruiterProfile = db.prepare(`
    INSERT INTO recruiter_profiles (user_id, company_id, designation, department)
    VALUES (?, ?, ?, ?)
  `);
  insertRecruiterProfile.run(3, 1, 'Head of Technical Recruiting', 'Talent Acquisition');
  insertRecruiterProfile.run(4, 2, 'VP of People & Talent', 'Executive Recruiting');

  // 6. Resumes
  const insertResume = db.prepare(`
    INSERT INTO resumes (candidate_id, file_name, file_path, file_size, is_default)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertResume.run(1, 'Alex_Chen_Senior_FullStack_Resume_2026.pdf', '/uploads/sample_resume_alex.pdf', 124500, 1);
  insertResume.run(2, 'Maya_Patel_DataScience_Resume.pdf', '/uploads/sample_resume_maya.pdf', 98400, 1);

  // 7. Insert Jobs
  const insertJob = db.prepare(`
    INSERT INTO jobs (
      recruiter_id, company_id, title, department, description, requirements, responsibilities,
      location, work_mode, employment_type, experience_level, min_salary, max_salary, currency,
      is_active, is_featured, application_deadline
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USD', 1, ?, datetime('now', '+30 days'))
  `);

  // Job 1
  insertJob.run(
    3, 1,
    'Senior Full-Stack Engineer (React & Node.js)',
    'Engineering',
    'We are looking for a Senior Full-Stack Engineer to lead development of our core cloud orchestrator UI and high-throughput real-time APIs. You will work closely with product managers and distributed teams to build world-class enterprise SaaS experiences.',
    '• 5+ years of production experience with React, TypeScript, and Node.js\n• Deep understanding of browser internals, state management, and modern CSS\n• Experience designing RESTful APIs and PostgreSQL/MySQL databases\n• Familiarity with Docker, CI/CD pipelines, and cloud deployments (AWS/GCP)',
    '• Design, implement, and maintain scalable frontend components and backend services\n• Collaborate with UX designers to craft intuitive user workflows\n• Mentor junior and mid-level engineers through code reviews and technical guidance\n• Optimize application performance, bundle size, and response latencies',
    'San Francisco, CA',
    'remote',
    'full-time',
    'senior',
    145000, 185000,
    1 // featured
  );

  // Job 2
  insertJob.run(
    4, 2,
    'Lead Backend Architect (Python, FastAPI & Cloud)',
    'Infrastructure',
    'CloudScale Systems is scaling its real-time analytics core. We need a Lead Backend Architect who understands high-concurrency systems, asynchronous Python, and cloud-native architecture.',
    '• 7+ years of backend development experience, including extensive Python & FastAPI\n• Strong expertise in relational and non-relational database design (PostgreSQL, Redis)\n• Proven track record architecting microservices with Kubernetes & Terraform\n• Exceptional problem-solving skills and communication',
    '• Architect resilient microservices handling tens of thousands of requests per second\n• Establish engineering standards, telemetry, and automated deployment pipelines\n• Partner with product leadership on technical roadmap and architecture reviews',
    'Seattle, WA',
    'hybrid',
    'full-time',
    'lead',
    170000, 220000,
    1
  );

  // Job 3
  insertJob.run(
    3, 1,
    'Frontend React Developer (Design Systems)',
    'Engineering',
    'Join our Design Systems team to build and maintain the shared component library used across all TechNova web applications. Ensure accessibility, high performance, and visual polish.',
    '• 3+ years experience with React and modern CSS architectures (Tailwind, CSS-in-JS)\n• Passion for accessible UI (WCAG 2.1 AA compliant) and component documentation\n• Proficiency with TypeScript, Jest, and Storybook',
    '• Build clean, modular, and accessible React UI components\n• Work alongside Figma product designers to unify design language\n• Maintain npm packages and interactive component documentation',
    'San Francisco, CA',
    'remote',
    'full-time',
    'mid',
    115000, 145000,
    0
  );

  // Job 4
  insertJob.run(
    4, 2,
    'DevOps & Platform Engineer (Kubernetes & AWS)',
    'DevOps',
    'Help us automate our global cloud footprint. You will create resilient multi-region infrastructure, monitor service health, and empower developer autonomy.',
    '• 4+ years in SRE or DevOps roles supporting production cloud workloads\n• Strong command of Kubernetes, Docker, Helm, and AWS ecosystem\n• Infrastructure as Code experience using Terraform or Pulumi',
    '• Manage multi-tenant Kubernetes clusters and automated canary deployments\n• Implement proactive alerting, tracing, and log aggregation\n• Drive zero-downtime database migrations and backup verification',
    'Seattle, WA',
    'onsite',
    'full-time',
    'mid',
    130000, 165000,
    0
  );

  // Job 5
  insertJob.run(
    3, 1,
    'Junior Full Stack Developer (Intern / Entry)',
    'Engineering',
    'Exciting opportunity for recent graduates or early-career developers. Learn from senior staff and ship production code to thousands of global customers.',
    '• Basic proficiency in JavaScript/TypeScript, React, and Python or Node.js\n• Good understanding of Git, web standards, and relational databases\n• Eagerness to learn, take feedback, and collaborate in an agile team',
    '• Implement feature enhancements and fix frontend/backend bugs\n• Write unit and integration tests\n• Participate in sprint planning and daily standups',
    'San Francisco, CA',
    'remote',
    'internship',
    'entry',
    50000, 65000,
    0
  );

  // Job 6
  insertJob.run(
    4, 2,
    'Senior Product Designer (UI/UX)',
    'Design',
    'We are seeking a thoughtful Product Designer to translate complex developer infrastructure concepts into clean, delightful consumer-grade SaaS interfaces.',
    '• 5+ years designing responsive web and desktop SaaS interfaces\n• Mastery of Figma, auto-layout, interactive prototyping, and design systems\n• Strong portfolio showcasing end-to-end user research to final implementation',
    '• Lead discovery workshops, user interviews, and journey mapping\n• Design high-fidelity wireframes, interactive prototypes, and design specs\n• Partner closely with frontend engineers during delivery sprints',
    'Seattle, WA',
    'remote',
    'full-time',
    'senior',
    135000, 175000,
    1
  );

  // 8. Link Job Skills
  const linkJobSkill = db.prepare('INSERT INTO job_skills (job_id, skill_id) VALUES (?, ?)');
  // Job 1 (React, TS, Node, SQL, Docker)
  [1, 2, 4, 7, 10, 12].forEach(sid => linkJobSkill.run(1, sid));
  // Job 2 (Python, FastAPI, SQL, Docker, AWS)
  [5, 6, 7, 12, 13, 18].forEach(sid => linkJobSkill.run(2, sid));
  // Job 3 (React, TS, Tailwind, Figma)
  [1, 2, 10, 17].forEach(sid => linkJobSkill.run(3, sid));
  // Job 4 (Docker, AWS, Kubernetes)
  [12, 13, 18].forEach(sid => linkJobSkill.run(4, sid));
  // Job 5 (React, TS, JS)
  [1, 2, 3].forEach(sid => linkJobSkill.run(5, sid));
  // Job 6 (UI/UX, Figma)
  [16, 17].forEach(sid => linkJobSkill.run(6, sid));

  // 9. Applications
  const insertApp = db.prepare(`
    INSERT INTO applications (job_id, candidate_id, resume_id, cover_letter, status, interview_date, interview_link, recruiter_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Alex applied to Job 1 (Senior Full-Stack at TechNova) -> Under Review / Interview Scheduled!
  insertApp.run(
    1, 1, 1,
    'I have been tracking TechNova’s rapid growth in the cloud orchestration space. With my background in React, TypeScript, and high-concurrency Node.js microservices, I am confident I can immediately deliver impact to your engineering roadmap.',
    'interview_scheduled',
    '2026-11-12 14:00:00',
    'https://meet.google.com/hhr-zqwk-ptx',
    'Impressive portfolio and strong open source track record. Scheduled round 2 technical design interview.'
  );

  // Alex applied to Job 2 (CloudScale) -> Shortlisted
  insertApp.run(
    2, 1, 1,
    'Excited about CloudScale systems architecture. My previous work with distributed cache layers and FastAPI makes me an ideal fit.',
    'shortlisted',
    null, null,
    'Strong background in distributed systems. Moving to shortlist for architecture team review.'
  );

  // Maya applied to Job 2 -> Under Review
  insertApp.run(
    2, 2, 2,
    'I bring over 3 years of hands-on data and Python engineering experience, with a focus on data pipelines and high-throughput systems.',
    'under_review',
    null, null,
    'Reviewing code samples.'
  );

  // 10. Application Status History
  const insertHistory = db.prepare(`
    INSERT INTO application_status_history (application_id, changed_by_user_id, previous_status, new_status, notes)
    VALUES (?, ?, ?, ?, ?)
  `);

  // History for App 1
  insertHistory.run(1, 1, null, 'applied', 'Candidate submitted application.');
  insertHistory.run(1, 3, 'applied', 'under_review', 'Recruiter Sarah reviewed resume.');
  insertHistory.run(1, 3, 'under_review', 'shortlisted', 'Candidate cleared initial recruiter screen.');
  insertHistory.run(1, 3, 'shortlisted', 'interview_scheduled', 'Technical Architecture interview scheduled with Lead Architect on Nov 12, 2026.');

  // History for App 2
  insertHistory.run(2, 1, null, 'applied', 'Candidate submitted application.');
  insertHistory.run(2, 4, 'applied', 'shortlisted', 'Shortlisted by Marcus Vance.');

  // 11. Saved Jobs for Alex
  const insertSaved = db.prepare('INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)');
  insertSaved.run(1, 3);
  insertSaved.run(1, 6);

  console.log('Database seeded successfully!');
}
