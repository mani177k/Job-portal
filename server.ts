import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { db, initDatabase } from './server/db.ts';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'hirehub_super_secret_jwt_key_2026';

// Initialize SQLite database
initDatabase();

// Setup upload directory
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  }
});
const upload = multer({ storage });

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Create a dummy sample resume file if not exists
const sampleResumePath = path.join(UPLOADS_DIR, 'sample_resume_alex.pdf');
if (!fs.existsSync(sampleResumePath)) {
  fs.writeFileSync(sampleResumePath, 'Sample Resume Content for Alex Chen (HireHub Platform Candidate)');
}
const sampleResumeMaya = path.join(UPLOADS_DIR, 'sample_resume_maya.pdf');
if (!fs.existsSync(sampleResumeMaya)) {
  fs.writeFileSync(sampleResumeMaya, 'Sample Resume Content for Maya Patel (HireHub Platform Candidate)');
}

// Auth Helper
interface AuthPayload {
  id: number;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET) as AuthPayload;
    } catch (err) {
      // Ignore optional auth failure
    }
  }
  next();
}

function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Requires role: ${roles.join(' or ')}` });
    }
    next();
  };
}

// ---------------------------------------------------------------------
// Auth Routes
// ---------------------------------------------------------------------
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, role, firstName, lastName, phone, companyName, industry, designation } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Email, password, first name and last name are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const userRole = role === 'recruiter' ? 'recruiter' : 'candidate';
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName)}`;

  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, role, first_name, last_name, phone, avatar_url, is_active, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)
  `);
  const result = insertUser.run(email, passwordHash, userRole, firstName, lastName, phone || null, avatarUrl);
  const userId = Number(result.lastInsertRowid);

  if (userRole === 'candidate') {
    db.prepare(`
      INSERT INTO candidate_profiles (user_id, headline, bio)
      VALUES (?, 'Open to Opportunities', 'Software engineer excited about building great products.')
    `).run(userId);
  } else if (userRole === 'recruiter') {
    const compName = companyName || 'New Venture Inc';
    const slug = compName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let comp = db.prepare('SELECT id FROM companies WHERE slug = ?').get(slug) as { id: number } | undefined;
    if (!comp) {
      const compRes = db.prepare(`
        INSERT INTO companies (name, slug, industry, location)
        VALUES (?, ?, ?, 'Remote / Hybrid')
      `).run(compName, slug, industry || 'Technology');
      comp = { id: Number(compRes.lastInsertRowid) };
    }

    db.prepare(`
      INSERT INTO recruiter_profiles (user_id, company_id, designation)
      VALUES (?, ?, ?)
    `).run(userId, comp.id, designation || 'Recruiting Specialist');
  }

  const token = jwt.sign({ id: userId, email, role: userRole }, JWT_SECRET, { expiresIn: '7d' });
  const user = db.prepare('SELECT id, email, role, first_name, last_name, phone, avatar_url, is_active FROM users WHERE id = ?').get(userId);

  return res.status(201).json({
    access_token: token,
    token_type: 'bearer',
    user
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const safeUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
    avatar_url: user.avatar_url,
    is_active: user.is_active
  };

  return res.json({
    access_token: token,
    token_type: 'bearer',
    user: safeUser
  });
});

app.get('/api/auth/me', authenticateToken, (req: Request, res: Response) => {
  const user = db.prepare('SELECT id, email, role, first_name, last_name, phone, avatar_url, is_active, created_at FROM users WHERE id = ?').get(req.user!.id) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let extraData: any = {};
  if (user.role === 'candidate') {
    extraData.profile = db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(user.id);
  } else if (user.role === 'recruiter') {
    const recProf = db.prepare(`
      SELECT r.*, c.name as company_name, c.logo_url as company_logo, c.industry as company_industry
      FROM recruiter_profiles r
      JOIN companies c ON r.company_id = c.id
      WHERE r.user_id = ?
    `).get(user.id);
    extraData.recruiter_profile = recProf;
  }

  return res.json({ ...user, ...extraData });
});

// ---------------------------------------------------------------------
// Job Routes
// ---------------------------------------------------------------------
app.get('/api/jobs', optionalAuth, (req: Request, res: Response) => {
  const {
    search,
    location,
    employment_type,
    experience_level,
    work_mode,
    min_salary,
    category,
    sort_by
  } = req.query as Record<string, string>;

  let sql = `
    SELECT 
      j.*, 
      c.name as company_name, 
      c.logo_url as company_logo, 
      c.website as company_website,
      c.industry as company_industry,
      (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applications_count
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    WHERE j.is_active = 1
  `;

  const params: any[] = [];

  if (search) {
    sql += ` AND (j.title LIKE ? OR j.description LIKE ? OR c.name LIKE ? OR j.department LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  if (location && location !== 'all') {
    sql += ` AND j.location LIKE ?`;
    params.push(`%${location}%`);
  }

  if (employment_type && employment_type !== 'all') {
    sql += ` AND j.employment_type = ?`;
    params.push(employment_type);
  }

  if (experience_level && experience_level !== 'all') {
    sql += ` AND j.experience_level = ?`;
    params.push(experience_level);
  }

  if (work_mode && work_mode !== 'all') {
    sql += ` AND j.work_mode = ?`;
    params.push(work_mode);
  }

  if (category && category !== 'all') {
    sql += ` AND (j.department LIKE ? OR c.industry LIKE ?)`;
    params.push(`%${category}%`, `%${category}%`);
  }

  if (min_salary && !isNaN(Number(min_salary))) {
    sql += ` AND (j.max_salary >= ? OR j.min_salary >= ?)`;
    params.push(Number(min_salary), Number(min_salary));
  }

  if (sort_by === 'salary_high') {
    sql += ` ORDER BY j.max_salary DESC, j.created_at DESC`;
  } else if (sort_by === 'featured') {
    sql += ` ORDER BY j.is_featured DESC, j.created_at DESC`;
  } else {
    sql += ` ORDER BY j.created_at DESC`;
  }

  const jobs = db.prepare(sql).all(...params) as any[];

  // Attach skills and user application/saved state
  const userId = req.user?.id;
  const getJobSkills = db.prepare(`
    SELECT s.id, s.name, s.category 
    FROM skills s
    JOIN job_skills js ON s.id = js.skill_id
    WHERE js.job_id = ?
  `);

  const formattedJobs = jobs.map(job => {
    const skills = getJobSkills.all(job.id);
    let hasApplied = false;
    let isSaved = false;

    if (userId) {
      const appRecord = db.prepare('SELECT id FROM applications WHERE job_id = ? AND candidate_id = ?').get(job.id, userId);
      hasApplied = !!appRecord;
      const saveRecord = db.prepare('SELECT id FROM saved_jobs WHERE job_id = ? AND user_id = ?').get(job.id, userId);
      isSaved = !!saveRecord;
    }

    return {
      ...job,
      company: {
        id: job.company_id,
        name: job.company_name,
        logo_url: job.company_logo,
        website: job.company_website,
        industry: job.company_industry
      },
      skills,
      has_applied: hasApplied,
      is_saved: isSaved
    };
  });

  return res.json(formattedJobs);
});

app.get('/api/jobs/saved', authenticateToken, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const sql = `
    SELECT 
      j.*, 
      c.name as company_name, 
      c.logo_url as company_logo, 
      c.industry as company_industry,
      (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applications_count
    FROM saved_jobs sj
    JOIN jobs j ON sj.job_id = j.id
    JOIN companies c ON j.company_id = c.id
    WHERE sj.user_id = ?
    ORDER BY sj.saved_at DESC
  `;
  const jobs = db.prepare(sql).all(userId) as any[];
  const getJobSkills = db.prepare(`
    SELECT s.id, s.name, s.category 
    FROM skills s
    JOIN job_skills js ON s.id = js.skill_id
    WHERE js.job_id = ?
  `);

  const result = jobs.map(j => ({
    ...j,
    company: {
      id: j.company_id,
      name: j.company_name,
      logo_url: j.company_logo,
      industry: j.company_industry
    },
    skills: getJobSkills.all(j.id),
    is_saved: true
  }));

  return res.json(result);
});

app.post('/api/jobs/:id/save', authenticateToken, (req: Request, res: Response) => {
  const jobId = Number(req.params.id);
  const userId = req.user!.id;

  const existing = db.prepare('SELECT id FROM saved_jobs WHERE user_id = ? AND job_id = ?').get(userId, jobId);
  if (existing) {
    db.prepare('DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?').run(userId, jobId);
    return res.json({ saved: false, message: 'Job removed from saved items' });
  } else {
    db.prepare('INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)').run(userId, jobId);
    return res.json({ saved: true, message: 'Job saved successfully' });
  }
});

app.get('/api/jobs/:id', optionalAuth, (req: Request, res: Response) => {
  const jobId = Number(req.params.id);
  const sql = `
    SELECT 
      j.*, 
      c.name as company_name, 
      c.logo_url as company_logo, 
      c.website as company_website,
      c.industry as company_industry,
      c.company_size,
      c.about_text as company_about,
      c.location as company_headquarters,
      (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applications_count
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    WHERE j.id = ?
  `;
  const job = db.prepare(sql).get(jobId) as any;
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const skills = db.prepare(`
    SELECT s.id, s.name, s.category 
    FROM skills s
    JOIN job_skills js ON s.id = js.skill_id
    WHERE js.job_id = ?
  `).all(jobId);

  let hasApplied = false;
  let isSaved = false;
  let applicationDetails: any = null;

  if (req.user?.id) {
    const appRecord = db.prepare('SELECT * FROM applications WHERE job_id = ? AND candidate_id = ?').get(jobId, req.user.id) as any;
    if (appRecord) {
      hasApplied = true;
      applicationDetails = appRecord;
    }
    const saveRecord = db.prepare('SELECT id FROM saved_jobs WHERE job_id = ? AND user_id = ?').get(jobId, req.user.id);
    isSaved = !!saveRecord;
  }

  return res.json({
    ...job,
    company: {
      id: job.company_id,
      name: job.company_name,
      logo_url: job.company_logo,
      website: job.company_website,
      industry: job.company_industry,
      company_size: job.company_size,
      about_text: job.company_about,
      location: job.company_headquarters
    },
    skills,
    has_applied: hasApplied,
    is_saved: isSaved,
    application: applicationDetails
  });
});

app.post('/api/jobs', authenticateToken, requireRole(['recruiter', 'admin']), (req: Request, res: Response) => {
  const {
    title, department, description, requirements, responsibilities,
    location, work_mode, employment_type, experience_level,
    min_salary, max_salary, currency, is_featured, application_deadline, skills
  } = req.body;

  if (!title || !department || !description || !requirements || !location) {
    return res.status(400).json({ error: 'Title, department, description, requirements, and location are required' });
  }

  // Find recruiter's company
  let companyId = 1;
  const recProf = db.prepare('SELECT company_id FROM recruiter_profiles WHERE user_id = ?').get(req.user!.id) as any;
  if (recProf) {
    companyId = recProf.company_id;
  }

  const insertStmt = db.prepare(`
    INSERT INTO jobs (
      recruiter_id, company_id, title, department, description, requirements, responsibilities,
      location, work_mode, employment_type, experience_level, min_salary, max_salary, currency,
      is_active, is_featured, application_deadline
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `);

  const result = insertStmt.run(
    req.user!.id,
    companyId,
    title,
    department,
    description,
    requirements,
    responsibilities || null,
    location,
    work_mode || 'remote',
    employment_type || 'full-time',
    experience_level || 'mid',
    min_salary ? Number(min_salary) : null,
    max_salary ? Number(max_salary) : null,
    currency || 'USD',
    is_featured ? 1 : 0,
    application_deadline || null
  );

  const jobId = Number(result.lastInsertRowid);

  // Link skills
  if (Array.isArray(skills) && skills.length > 0) {
    const linkSkill = db.prepare('INSERT OR IGNORE INTO job_skills (job_id, skill_id) VALUES (?, ?)');
    for (const skillName of skills) {
      let skill = db.prepare('SELECT id FROM skills WHERE name = ? COLLATE NOCASE').get(skillName) as any;
      if (!skill) {
        const sRes = db.prepare('INSERT INTO skills (name, category) VALUES (?, "Technical")').run(skillName);
        skill = { id: Number(sRes.lastInsertRowid) };
      }
      linkSkill.run(jobId, skill.id);
    }
  }

  return res.status(201).json({ id: jobId, message: 'Job posted successfully!' });
});

app.put('/api/jobs/:id', authenticateToken, requireRole(['recruiter', 'admin']), (req: Request, res: Response) => {
  const jobId = Number(req.params.id);
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(jobId) as any;
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (req.user!.role !== 'admin' && job.recruiter_id !== req.user!.id) {
    return res.status(403).json({ error: 'You do not have permission to edit this job' });
  }

  const {
    title, department, description, requirements, responsibilities,
    location, work_mode, employment_type, experience_level,
    min_salary, max_salary, is_active, is_featured, application_deadline, skills
  } = req.body;

  db.prepare(`
    UPDATE jobs SET
      title = COALESCE(?, title),
      department = COALESCE(?, department),
      description = COALESCE(?, description),
      requirements = COALESCE(?, requirements),
      responsibilities = COALESCE(?, responsibilities),
      location = COALESCE(?, location),
      work_mode = COALESCE(?, work_mode),
      employment_type = COALESCE(?, employment_type),
      experience_level = COALESCE(?, experience_level),
      min_salary = COALESCE(?, min_salary),
      max_salary = COALESCE(?, max_salary),
      is_active = COALESCE(?, is_active),
      is_featured = COALESCE(?, is_featured),
      application_deadline = COALESCE(?, application_deadline),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title, department, description, requirements, responsibilities,
    location, work_mode, employment_type, experience_level,
    min_salary !== undefined ? Number(min_salary) : null,
    max_salary !== undefined ? Number(max_salary) : null,
    is_active !== undefined ? (is_active ? 1 : 0) : null,
    is_featured !== undefined ? (is_featured ? 1 : 0) : null,
    application_deadline,
    jobId
  );

  if (Array.isArray(skills)) {
    db.prepare('DELETE FROM job_skills WHERE job_id = ?').run(jobId);
    const linkSkill = db.prepare('INSERT OR IGNORE INTO job_skills (job_id, skill_id) VALUES (?, ?)');
    for (const sName of skills) {
      let skill = db.prepare('SELECT id FROM skills WHERE name = ? COLLATE NOCASE').get(sName) as any;
      if (!skill) {
        const sRes = db.prepare('INSERT INTO skills (name, category) VALUES (?, "Technical")').run(sName);
        skill = { id: Number(sRes.lastInsertRowid) };
      }
      linkSkill.run(jobId, skill.id);
    }
  }

  return res.json({ message: 'Job updated successfully' });
});

app.delete('/api/jobs/:id', authenticateToken, requireRole(['recruiter', 'admin']), (req: Request, res: Response) => {
  const jobId = Number(req.params.id);
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(jobId) as any;
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (req.user!.role !== 'admin' && job.recruiter_id !== req.user!.id) {
    return res.status(403).json({ error: 'You do not have permission to delete this job' });
  }

  db.prepare('DELETE FROM jobs WHERE id = ?').run(jobId);
  return res.json({ message: 'Job deleted successfully' });
});

// ---------------------------------------------------------------------
// Application Routes
// ---------------------------------------------------------------------
app.post('/api/applications', authenticateToken, requireRole(['candidate']), (req: Request, res: Response) => {
  const { job_id, resume_id, cover_letter } = req.body;
  const candidateId = req.user!.id;

  const job = db.prepare('SELECT id, is_active FROM jobs WHERE id = ?').get(job_id) as any;
  if (!job || !job.is_active) {
    return res.status(404).json({ error: 'This job posting is no longer active' });
  }

  const existing = db.prepare('SELECT id FROM applications WHERE job_id = ? AND candidate_id = ?').get(job_id, candidateId);
  if (existing) {
    return res.status(400).json({ error: 'You have already applied for this position' });
  }

  let finalResumeId = resume_id;
  if (!finalResumeId) {
    const defaultRes = db.prepare('SELECT id FROM resumes WHERE candidate_id = ? ORDER BY is_default DESC, uploaded_at DESC LIMIT 1').get(candidateId) as any;
    if (defaultRes) finalResumeId = defaultRes.id;
  }

  const appResult = db.prepare(`
    INSERT INTO applications (job_id, candidate_id, resume_id, cover_letter, status)
    VALUES (?, ?, ?, ?, 'applied')
  `).run(job_id, candidateId, finalResumeId || null, cover_letter || '');

  const appId = Number(appResult.lastInsertRowid);

  db.prepare(`
    INSERT INTO application_status_history (application_id, changed_by_user_id, previous_status, new_status, notes)
    VALUES (?, ?, NULL, 'applied', 'Application submitted by candidate.')
  `).run(appId, candidateId);

  return res.status(201).json({
    id: appId,
    message: 'Application submitted successfully!',
    status: 'applied'
  });
});

app.get('/api/applications/my-applications', authenticateToken, requireRole(['candidate']), (req: Request, res: Response) => {
  const sql = `
    SELECT 
      a.*,
      j.title as job_title,
      j.location as job_location,
      j.work_mode as job_work_mode,
      j.employment_type as job_employment_type,
      j.min_salary,
      j.max_salary,
      c.name as company_name,
      c.logo_url as company_logo,
      r.file_name as resume_file_name,
      r.file_path as resume_file_path
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN companies c ON j.company_id = c.id
    LEFT JOIN resumes r ON a.resume_id = r.id
    WHERE a.candidate_id = ?
    ORDER BY a.created_at DESC
  `;
  const apps = db.prepare(sql).all(req.user!.id) as any[];

  const getHistory = db.prepare(`
    SELECT h.*, u.first_name, u.last_name, u.role
    FROM application_status_history h
    JOIN users u ON h.changed_by_user_id = u.id
    WHERE h.application_id = ?
    ORDER BY h.created_at ASC
  `);

  const results = apps.map(appItem => ({
    ...appItem,
    job: {
      id: appItem.job_id,
      title: appItem.job_title,
      location: appItem.job_location,
      work_mode: appItem.job_work_mode,
      employment_type: appItem.job_employment_type,
      min_salary: appItem.min_salary,
      max_salary: appItem.max_salary,
      company: {
        name: appItem.company_name,
        logo_url: appItem.company_logo
      }
    },
    resume: appItem.resume_file_name ? {
      file_name: appItem.resume_file_name,
      file_path: appItem.resume_file_path
    } : null,
    history: getHistory.all(appItem.id)
  }));

  return res.json(results);
});

app.get('/api/applications/:id', authenticateToken, (req: Request, res: Response) => {
  const appId = Number(req.params.id);
  const sql = `
    SELECT 
      a.*,
      j.title as job_title,
      j.location as job_location,
      j.work_mode as job_work_mode,
      j.recruiter_id,
      c.name as company_name,
      c.logo_url as company_logo,
      r.file_name as resume_file_name,
      r.file_path as resume_file_path,
      u.first_name as candidate_first_name,
      u.last_name as candidate_last_name,
      u.email as candidate_email,
      u.phone as candidate_phone,
      u.avatar_url as candidate_avatar
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN companies c ON j.company_id = c.id
    JOIN users u ON a.candidate_id = u.id
    LEFT JOIN resumes r ON a.resume_id = r.id
    WHERE a.id = ?
  `;
  const appItem = db.prepare(sql).get(appId) as any;
  if (!appItem) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // Authorization check
  const u = req.user!;
  if (u.role === 'candidate' && appItem.candidate_id !== u.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  if (u.role === 'recruiter' && appItem.recruiter_id !== u.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const history = db.prepare(`
    SELECT h.*, u.first_name, u.last_name, u.role
    FROM application_status_history h
    JOIN users u ON h.changed_by_user_id = u.id
    WHERE h.application_id = ?
    ORDER BY h.created_at ASC
  `).all(appId);

  // Also fetch candidate's profile
  const candidateProfile = db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(appItem.candidate_id) as any;
  let candidateSkills: any[] = [];
  if (candidateProfile) {
    candidateSkills = db.prepare(`
      SELECT s.name 
      FROM skills s
      JOIN candidate_skills cs ON s.id = cs.skill_id
      WHERE cs.candidate_profile_id = ?
    `).all(candidateProfile.id).map((s: any) => s.name);
  }

  return res.json({
    ...appItem,
    candidate: {
      id: appItem.candidate_id,
      first_name: appItem.candidate_first_name,
      last_name: appItem.candidate_last_name,
      email: appItem.candidate_email,
      phone: appItem.candidate_phone,
      avatar_url: appItem.candidate_avatar,
      profile: candidateProfile ? {
        ...candidateProfile,
        skills: candidateSkills,
        education: candidateProfile.education_json ? JSON.parse(candidateProfile.education_json) : [],
        experience: candidateProfile.experience_json ? JSON.parse(candidateProfile.experience_json) : []
      } : null
    },
    history
  });
});

app.put('/api/applications/:id/status', authenticateToken, requireRole(['recruiter', 'admin']), (req: Request, res: Response) => {
  const appId = Number(req.params.id);
  const { status, recruiter_notes, interview_date, interview_link } = req.body;

  const validStatuses = ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid application status provided' });
  }

  const appItem = db.prepare(`
    SELECT a.*, j.recruiter_id 
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE a.id = ?
  `).get(appId) as any;

  if (!appItem) {
    return res.status(404).json({ error: 'Application not found' });
  }

  if (req.user!.role !== 'admin' && appItem.recruiter_id !== req.user!.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const oldStatus = appItem.status;

  db.prepare(`
    UPDATE applications SET
      status = ?,
      recruiter_notes = COALESCE(?, recruiter_notes),
      interview_date = COALESCE(?, interview_date),
      interview_link = COALESCE(?, interview_link),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(status, recruiter_notes || null, interview_date || null, interview_link || null, appId);

  // Add history record
  db.prepare(`
    INSERT INTO application_status_history (application_id, changed_by_user_id, previous_status, new_status, notes)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    appId,
    req.user!.id,
    oldStatus,
    status,
    recruiter_notes || `Status changed from ${oldStatus} to ${status}`
  );

  return res.json({ message: 'Status updated successfully', status });
});

app.delete('/api/applications/:id/withdraw', authenticateToken, requireRole(['candidate']), (req: Request, res: Response) => {
  const appId = Number(req.params.id);
  const appItem = db.prepare('SELECT id, candidate_id, status FROM applications WHERE id = ?').get(appId) as any;
  if (!appItem || appItem.candidate_id !== req.user!.id) {
    return res.status(404).json({ error: 'Application not found' });
  }

  db.prepare('DELETE FROM applications WHERE id = ?').run(appId);
  return res.json({ message: 'Application withdrawn successfully' });
});

// ---------------------------------------------------------------------
// Candidate Profile & Resume Routes
// ---------------------------------------------------------------------
app.get('/api/candidates/profile', authenticateToken, requireRole(['candidate', 'admin']), (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = db.prepare('SELECT id, email, first_name, last_name, phone, avatar_url FROM users WHERE id = ?').get(userId) as any;
  let profile = db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(userId) as any;

  if (!profile) {
    db.prepare('INSERT INTO candidate_profiles (user_id) VALUES (?)').run(userId);
    profile = db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(userId);
  }

  const skills = db.prepare(`
    SELECT s.name 
    FROM skills s
    JOIN candidate_skills cs ON s.id = cs.skill_id
    WHERE cs.candidate_profile_id = ?
  `).all(profile.id).map((s: any) => s.name);

  return res.json({
    user,
    profile: {
      ...profile,
      skills,
      education: profile.education_json ? JSON.parse(profile.education_json) : [],
      experience: profile.experience_json ? JSON.parse(profile.experience_json) : []
    }
  });
});

app.put('/api/candidates/profile', authenticateToken, requireRole(['candidate']), (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    headline, bio, experience_years, current_location,
    portfolio_url, linkedin_url, github_url, expected_salary,
    education, experience, skills, first_name, last_name, phone
  } = req.body;

  // Update user name/phone
  if (first_name || last_name || phone) {
    db.prepare(`
      UPDATE users SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        phone = COALESCE(?, phone),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(first_name || null, last_name || null, phone || null, userId);
  }

  let profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(userId) as any;
  if (!profile) {
    db.prepare('INSERT INTO candidate_profiles (user_id) VALUES (?)').run(userId);
    profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(userId) as any;
  }

  db.prepare(`
    UPDATE candidate_profiles SET
      headline = COALESCE(?, headline),
      bio = COALESCE(?, bio),
      experience_years = COALESCE(?, experience_years),
      current_location = COALESCE(?, current_location),
      portfolio_url = COALESCE(?, portfolio_url),
      linkedin_url = COALESCE(?, linkedin_url),
      github_url = COALESCE(?, github_url),
      expected_salary = COALESCE(?, expected_salary),
      education_json = COALESCE(?, education_json),
      experience_json = COALESCE(?, experience_json),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    headline,
    bio,
    experience_years !== undefined ? Number(experience_years) : null,
    current_location,
    portfolio_url,
    linkedin_url,
    github_url,
    expected_salary !== undefined ? Number(expected_salary) : null,
    education ? JSON.stringify(education) : null,
    experience ? JSON.stringify(experience) : null,
    profile.id
  );

  if (Array.isArray(skills)) {
    db.prepare('DELETE FROM candidate_skills WHERE candidate_profile_id = ?').run(profile.id);
    const linkSkill = db.prepare('INSERT OR IGNORE INTO candidate_skills (candidate_profile_id, skill_id) VALUES (?, ?)');
    for (const sName of skills) {
      let skill = db.prepare('SELECT id FROM skills WHERE name = ? COLLATE NOCASE').get(sName) as any;
      if (!skill) {
        const sRes = db.prepare('INSERT INTO skills (name, category) VALUES (?, "Technical")').run(sName);
        skill = { id: Number(sRes.lastInsertRowid) };
      }
      linkSkill.run(profile.id, skill.id);
    }
  }

  return res.json({ message: 'Profile updated successfully!' });
});

// Resumes
app.post('/api/candidates/resume', authenticateToken, requireRole(['candidate']), upload.single('resume'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const userId = req.user!.id;
  // Set others not default
  db.prepare('UPDATE resumes SET is_default = 0 WHERE candidate_id = ?').run(userId);

  const filePath = `/uploads/${req.file.filename}`;
  const insertStmt = db.prepare(`
    INSERT INTO resumes (candidate_id, file_name, file_path, file_size, is_default)
    VALUES (?, ?, ?, ?, 1)
  `);
  const result = insertStmt.run(userId, req.file.originalname, filePath, req.file.size);

  return res.status(201).json({
    id: Number(result.lastInsertRowid),
    file_name: req.file.originalname,
    file_path: filePath,
    file_size: req.file.size,
    is_default: 1,
    message: 'Resume uploaded successfully!'
  });
});

app.get('/api/candidates/resumes', authenticateToken, requireRole(['candidate']), (req: Request, res: Response) => {
  const resumes = db.prepare('SELECT * FROM resumes WHERE candidate_id = ? ORDER BY is_default DESC, uploaded_at DESC').all(req.user!.id);
  return res.json(resumes);
});

app.delete('/api/candidates/resumes/:id', authenticateToken, requireRole(['candidate']), (req: Request, res: Response) => {
  const resId = Number(req.params.id);
  db.prepare('DELETE FROM resumes WHERE id = ? AND candidate_id = ?').run(resId, req.user!.id);
  return res.json({ message: 'Resume deleted' });
});

// ---------------------------------------------------------------------
// Recruiter Routes
// ---------------------------------------------------------------------
app.get('/api/recruiter/dashboard', authenticateToken, requireRole(['recruiter', 'admin']), (req: Request, res: Response) => {
  const recruiterId = req.user!.id;

  const totalJobs = (db.prepare('SELECT COUNT(*) as c FROM jobs WHERE recruiter_id = ?').get(recruiterId) as any).c;
  const activeJobs = (db.prepare('SELECT COUNT(*) as c FROM jobs WHERE recruiter_id = ? AND is_active = 1').get(recruiterId) as any).c;

  const myJobIds = db.prepare('SELECT id FROM jobs WHERE recruiter_id = ?').all(recruiterId).map((j: any) => j.id);

  let totalApps = 0;
  let shortlisted = 0;
  let interviews = 0;
  let rejected = 0;
  let selected = 0;
  let recentApplications: any[] = [];
  let appsByJob: any[] = [];

  if (myJobIds.length > 0) {
    const placeholders = myJobIds.map(() => '?').join(',');
    
    totalApps = (db.prepare(`SELECT COUNT(*) as c FROM applications WHERE job_id IN (${placeholders})`).get(...myJobIds) as any).c;
    shortlisted = (db.prepare(`SELECT COUNT(*) as c FROM applications WHERE job_id IN (${placeholders}) AND status = 'shortlisted'`).get(...myJobIds) as any).c;
    interviews = (db.prepare(`SELECT COUNT(*) as c FROM applications WHERE job_id IN (${placeholders}) AND status = 'interview_scheduled'`).get(...myJobIds) as any).c;
    rejected = (db.prepare(`SELECT COUNT(*) as c FROM applications WHERE job_id IN (${placeholders}) AND status = 'rejected'`).get(...myJobIds) as any).c;
    selected = (db.prepare(`SELECT COUNT(*) as c FROM applications WHERE job_id IN (${placeholders}) AND status = 'selected'`).get(...myJobIds) as any).c;

    recentApplications = db.prepare(`
      SELECT 
        a.id, a.job_id, a.status, a.created_at,
        j.title as job_title,
        u.first_name, u.last_name, u.email, u.avatar_url
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.candidate_id = u.id
      WHERE a.job_id IN (${placeholders})
      ORDER BY a.created_at DESC
      LIMIT 6
    `).all(...myJobIds);

    appsByJob = db.prepare(`
      SELECT j.title, COUNT(a.id) as applications
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.recruiter_id = ?
      GROUP BY j.id
      LIMIT 6
    `).all(recruiterId);
  }

  return res.json({
    stats: {
      total_jobs: totalJobs,
      active_jobs: activeJobs,
      total_applications: totalApps,
      shortlisted,
      interviews,
      rejected,
      selected
    },
    recent_applications: recentApplications,
    apps_by_job: appsByJob
  });
});

app.get('/api/recruiter/jobs', authenticateToken, requireRole(['recruiter', 'admin']), (req: Request, res: Response) => {
  const jobs = db.prepare(`
    SELECT 
      j.*,
      c.name as company_name,
      c.logo_url as company_logo,
      (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applications_count
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    WHERE j.recruiter_id = ?
    ORDER BY j.created_at DESC
  `).all(req.user!.id) as any[];

  const getSkills = db.prepare(`
    SELECT s.name 
    FROM skills s
    JOIN job_skills js ON s.id = js.skill_id
    WHERE js.job_id = ?
  `);

  const results = jobs.map(j => ({
    ...j,
    skills: getSkills.all(j.id).map((s: any) => s.name)
  }));

  return res.json(results);
});

app.get('/api/recruiter/jobs/:id/applications', authenticateToken, requireRole(['recruiter', 'admin']), (req: Request, res: Response) => {
  const jobId = Number(req.params.id);
  const { status, search } = req.query as Record<string, string>;

  let sql = `
    SELECT 
      a.*,
      u.first_name as candidate_first_name,
      u.last_name as candidate_last_name,
      u.email as candidate_email,
      u.phone as candidate_phone,
      u.avatar_url as candidate_avatar,
      cp.headline as candidate_headline,
      cp.experience_years,
      r.file_name as resume_file_name,
      r.file_path as resume_file_path
    FROM applications a
    JOIN users u ON a.candidate_id = u.id
    LEFT JOIN candidate_profiles cp ON u.id = cp.user_id
    LEFT JOIN resumes r ON a.resume_id = r.id
    WHERE a.job_id = ?
  `;
  const params: any[] = [jobId];

  if (status && status !== 'all') {
    sql += ` AND a.status = ?`;
    params.push(status);
  }

  if (search) {
    sql += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR cp.headline LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  sql += ` ORDER BY a.created_at DESC`;

  const apps = db.prepare(sql).all(...params);
  return res.json(apps);
});

app.get('/api/recruiter/company', authenticateToken, requireRole(['recruiter']), (req: Request, res: Response) => {
  const profile = db.prepare('SELECT company_id FROM recruiter_profiles WHERE user_id = ?').get(req.user!.id) as any;
  if (!profile) {
    return res.status(404).json({ error: 'Company profile not found' });
  }

  const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(profile.company_id);
  return res.json(company);
});

app.put('/api/recruiter/company', authenticateToken, requireRole(['recruiter', 'admin']), (req: Request, res: Response) => {
  const profile = db.prepare('SELECT company_id FROM recruiter_profiles WHERE user_id = ?').get(req.user!.id) as any;
  if (!profile) {
    return res.status(404).json({ error: 'Company profile not found' });
  }

  const { name, logo_url, website, industry, company_size, location, about_text } = req.body;
  db.prepare(`
    UPDATE companies SET
      name = COALESCE(?, name),
      logo_url = COALESCE(?, logo_url),
      website = COALESCE(?, website),
      industry = COALESCE(?, industry),
      company_size = COALESCE(?, company_size),
      location = COALESCE(?, location),
      about_text = COALESCE(?, about_text),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(name, logo_url, website, industry, company_size, location, about_text, profile.company_id);

  const updated = db.prepare('SELECT * FROM companies WHERE id = ?').get(profile.company_id);
  return res.json(updated);
});

// ---------------------------------------------------------------------
// Admin Routes
// ---------------------------------------------------------------------
app.get('/api/admin/dashboard', authenticateToken, requireRole(['admin']), (_req: Request, res: Response) => {
  const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
  const candidates = (db.prepare('SELECT COUNT(*) as c FROM users WHERE role = "candidate"').get() as any).c;
  const recruiters = (db.prepare('SELECT COUNT(*) as c FROM users WHERE role = "recruiter"').get() as any).c;
  const totalJobs = (db.prepare('SELECT COUNT(*) as c FROM jobs').get() as any).c;
  const activeJobs = (db.prepare('SELECT COUNT(*) as c FROM jobs WHERE is_active = 1').get() as any).c;
  const totalApplications = (db.prepare('SELECT COUNT(*) as c FROM applications').get() as any).c;
  const totalCompanies = (db.prepare('SELECT COUNT(*) as c FROM companies').get() as any).c;

  const recentUsers = db.prepare('SELECT id, email, first_name, last_name, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 5').all();
  const recentJobs = db.prepare(`
    SELECT j.id, j.title, j.location, j.is_active, j.created_at, c.name as company_name
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    ORDER BY j.created_at DESC
    LIMIT 5
  `).all();

  return res.json({
    stats: {
      total_users: totalUsers,
      total_candidates: candidates,
      total_recruiters: recruiters,
      total_jobs: totalJobs,
      active_jobs: activeJobs,
      total_applications: totalApplications,
      total_companies: totalCompanies,
      success_rate: '84.2%'
    },
    recent_users: recentUsers,
    recent_jobs: recentJobs
  });
});

app.get('/api/admin/users', authenticateToken, requireRole(['admin']), (req: Request, res: Response) => {
  const { role, search } = req.query as Record<string, string>;
  let sql = 'SELECT id, email, first_name, last_name, role, phone, is_active, is_verified, created_at FROM users WHERE 1=1';
  const params: any[] = [];

  if (role && role !== 'all') {
    sql += ' AND role = ?';
    params.push(role);
  }

  if (search) {
    sql += ' AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  sql += ' ORDER BY created_at DESC';
  const users = db.prepare(sql).all(...params);
  return res.json(users);
});

app.put('/api/admin/users/:id/status', authenticateToken, requireRole(['admin']), (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  const { is_active } = req.body;

  if (userId === req.user!.id) {
    return res.status(400).json({ error: 'You cannot change your own admin account status' });
  }

  db.prepare('UPDATE users SET is_active = ?, updated_at = datetime("now") WHERE id = ?').run(is_active ? 1 : 0, userId);
  return res.json({ message: `User status updated to ${is_active ? 'active' : 'suspended'}` });
});

app.get('/api/admin/jobs', authenticateToken, requireRole(['admin']), (_req: Request, res: Response) => {
  const jobs = db.prepare(`
    SELECT 
      j.*,
      c.name as company_name,
      c.logo_url as company_logo,
      u.email as recruiter_email,
      (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applications_count
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    JOIN users u ON j.recruiter_id = u.id
    ORDER BY j.created_at DESC
  `).all();
  return res.json(jobs);
});

app.put('/api/admin/jobs/:id/status', authenticateToken, requireRole(['admin']), (req: Request, res: Response) => {
  const jobId = Number(req.params.id);
  const { is_active, is_featured } = req.body;

  if (is_active !== undefined) {
    db.prepare('UPDATE jobs SET is_active = ?, updated_at = datetime("now") WHERE id = ?').run(is_active ? 1 : 0, jobId);
  }
  if (is_featured !== undefined) {
    db.prepare('UPDATE jobs SET is_featured = ?, updated_at = datetime("now") WHERE id = ?').run(is_featured ? 1 : 0, jobId);
  }

  return res.json({ message: 'Job status updated' });
});

app.get('/api/admin/applications', authenticateToken, requireRole(['admin']), (_req: Request, res: Response) => {
  const apps = db.prepare(`
    SELECT 
      a.*,
      j.title as job_title,
      c.name as company_name,
      u.first_name, u.last_name, u.email
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN companies c ON j.company_id = c.id
    JOIN users u ON a.candidate_id = u.id
    ORDER BY a.created_at DESC
  `).all();
  return res.json(apps);
});

// ---------------------------------------------------------------------
// Vite / Static Frontend Integration
// ---------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`HireHub full-stack application running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
