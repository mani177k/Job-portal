# HireHub – Full-Stack Job Portal System

A modern, enterprise-ready full-stack job portal connecting job seekers with recruiters and companies. Built with a responsive React (Vite) frontend, RESTful API architecture, JWT authentication, role-based access control (Candidate, Recruiter, Admin), and full applicant tracking lifecycle.

---

## 🚀 Features

- **Three Dedicated Roles:**
  - **Candidate:** Profile builder, resume management, advanced job search & multi-faceted filtering, one-click application, stage-by-stage visual application progress tracker.
  - **Recruiter:** Company branding, job publishing & management, applicant evaluation dashboard, candidate profile viewer, resume downloads, status workflows & interview scheduling.
  - **Admin:** Platform overview, user moderation (suspend/activate), job listings oversight, platform-wide analytics and audit trail.
- **Relational Database Design:** Complete 12-table normalized schema with foreign keys, cascading constraints, and audit status history.
- **Visual Application Tracker:** Stages for Applied → Under Review → Shortlisted → Interview Scheduled → Selected / Rejected with timeline and notes.
- **Recharts Analytics:** Visual breakdown of applications, talent pipelines, and platform growth.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, Axios, Canvas Confetti.
- **Backend:** Node.js Express server running live with native SQLite relational engine (`node:sqlite`) for immediate zero-config execution + full Python FastAPI codebase (`backend/app`).
- **Database:** MySQL 8.0 schema (`database/schema.sql`) and SQLite relational store.

---

## 💻 Local Setup & Execution

### 1. Unified Web & Full-Stack Server (Live Mode)
This repository includes a unified dev server that launches the frontend along with the complete relational REST API and file storage:

```bash
# Install dependencies
npm install

# Run the dev server on port 3000
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 2. Standalone Python FastAPI Backend & MySQL (Optional)

If running the Python FastAPI backend separately with a local MySQL server:

#### A. Database Initialization
```bash
mysql -u root -p < database/schema.sql
```

#### B. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables
export DATABASE_URL="mysql+pymysql://root:password@localhost:3306/hirehub_db"
export JWT_SECRET="hirehub_super_secret_jwt_key_2026"

# Run FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔑 Pre-Configured Demo Credentials

For quick testing across roles, you can click the **Demo Login** buttons on the login page or enter:

| Role | Email | Password |
|---|---|---|
| **Candidate** | `alex.candidate@example.com` | `password123` |
| **Recruiter** | `sarah.recruiter@technova.io` | `password123` |
| **Admin** | `admin@hirehub.com` | `admin123` |
