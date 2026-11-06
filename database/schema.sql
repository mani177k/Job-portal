-- =====================================================================
-- HireHub Database Schema (MySQL 8.0+)
-- Complete Relational Schema for Job Portal System
-- =====================================================================

DROP DATABASE IF EXISTS hirehub_db;
CREATE DATABASE hirehub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hirehub_db;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('candidate', 'recruiter', 'admin') NOT NULL DEFAULT 'candidate',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NULL,
    avatar_url VARCHAR(500) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- 2. Companies Table
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_url VARCHAR(500) NULL,
    website VARCHAR(255) NULL,
    industry VARCHAR(100) NOT NULL,
    company_size VARCHAR(50) DEFAULT '11-50 employees',
    location VARCHAR(255) NOT NULL,
    about_text TEXT NULL,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_companies_name (name),
    INDEX idx_companies_industry (industry)
) ENGINE=InnoDB;

-- 3. Candidate Profiles Table
CREATE TABLE candidate_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    headline VARCHAR(255) NULL,
    bio TEXT NULL,
    experience_years DECIMAL(4,1) DEFAULT 0.0,
    current_location VARCHAR(255) NULL,
    portfolio_url VARCHAR(500) NULL,
    linkedin_url VARCHAR(500) NULL,
    github_url VARCHAR(500) NULL,
    expected_salary DECIMAL(12,2) NULL,
    education_json JSON NULL,
    experience_json JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_candidate_exp (experience_years)
) ENGINE=InnoDB;

-- 4. Recruiter Profiles Table
CREATE TABLE recruiter_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_id INT NOT NULL,
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(100) NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_recruiter_company (company_id)
) ENGINE=InnoDB;

-- 5. Jobs Table
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id INT NOT NULL,
    company_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    responsibilities TEXT NULL,
    location VARCHAR(255) NOT NULL,
    work_mode ENUM('remote', 'hybrid', 'onsite') DEFAULT 'remote',
    employment_type ENUM('full-time', 'part-time', 'contract', 'internship') DEFAULT 'full-time',
    experience_level ENUM('entry', 'mid', 'senior', 'lead', 'executive') DEFAULT 'mid',
    min_salary DECIMAL(12,2) NULL,
    max_salary DECIMAL(12,2) NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    application_deadline DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_jobs_title (title),
    INDEX idx_jobs_location (location),
    INDEX idx_jobs_work_mode (work_mode),
    INDEX idx_jobs_employment_type (employment_type),
    INDEX idx_jobs_exp_level (experience_level),
    INDEX idx_jobs_active (is_active)
) ENGINE=InnoDB;

-- 6. Skills Table
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) DEFAULT 'Technical',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_skills_name (name)
) ENGINE=InnoDB;

-- 7. Candidate Skills (Many-to-Many)
CREATE TABLE candidate_skills (
    candidate_profile_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (candidate_profile_id, skill_id),
    FOREIGN KEY (candidate_profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Job Skills (Many-to-Many)
CREATE TABLE job_skills (
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Resumes Table
CREATE TABLE resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_resumes_candidate (candidate_id)
) ENGINE=InnoDB;

-- 10. Applications Table
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    candidate_id INT NOT NULL,
    resume_id INT NULL,
    cover_letter TEXT NULL,
    status ENUM('applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected') DEFAULT 'applied',
    interview_date DATETIME NULL,
    interview_link VARCHAR(500) NULL,
    recruiter_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_job_candidate (job_id, candidate_id),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL,
    INDEX idx_applications_status (status)
) ENGINE=InnoDB;

-- 11. Application Status History Table
CREATE TABLE application_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    changed_by_user_id INT NOT NULL,
    previous_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_history_app (application_id)
) ENGINE=InnoDB;

-- 12. Saved Jobs Table
CREATE TABLE saved_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_job (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- Initial Seed Data
-- =====================================================================

-- Default Skills
INSERT INTO skills (name, category) VALUES
('React', 'Frontend'),
('TypeScript', 'Languages'),
('JavaScript', 'Languages'),
('Node.js', 'Backend'),
('Python', 'Backend'),
('FastAPI', 'Backend'),
('SQL', 'Database'),
('PostgreSQL', 'Database'),
('MySQL', 'Database'),
('Tailwind CSS', 'Frontend'),
('Next.js', 'Frontend'),
('Docker', 'DevOps'),
('AWS', 'Cloud'),
('GraphQL', 'Backend'),
('Machine Learning', 'Data Science'),
('UI/UX Design', 'Design'),
('Figma', 'Design'),
('Product Management', 'Management'),
('Go', 'Backend'),
('Kubernetes', 'DevOps');
