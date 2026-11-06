from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str
    company_name: Optional[str] = None # For recruiter registration
    industry: Optional[str] = None
    designation: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Company schemas
class CompanyBase(BaseModel):
    name: str
    logo_url: Optional[str] = None
    website: Optional[str] = None
    industry: str
    company_size: Optional[str] = "11-50 employees"
    location: str
    about_text: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: int
    slug: str
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Skill schema
class SkillResponse(BaseModel):
    id: int
    name: str
    category: str

    class Config:
        from_attributes = True

# Job schemas
class JobBase(BaseModel):
    title: str
    department: str
    description: str
    requirements: str
    responsibilities: Optional[str] = None
    location: str
    work_mode: str = "remote"
    employment_type: str = "full-time"
    experience_level: str = "mid"
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    currency: str = "USD"
    is_active: bool = True
    is_featured: bool = False
    application_deadline: Optional[datetime] = None

class JobCreate(JobBase):
    skills: List[str] = []

class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    employment_type: Optional[str] = None
    experience_level: Optional[str] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    currency: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    application_deadline: Optional[datetime] = None
    skills: Optional[List[str]] = None

class JobResponse(JobBase):
    id: int
    recruiter_id: int
    company_id: int
    company: Optional[CompanyResponse] = None
    skills: List[SkillResponse] = []
    created_at: datetime
    updated_at: datetime
    applications_count: Optional[int] = 0
    has_applied: Optional[bool] = False
    is_saved: Optional[bool] = False

    class Config:
        from_attributes = True

# Candidate schemas
class CandidateProfileUpdate(BaseModel):
    headline: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[float] = None
    current_location: Optional[str] = None
    portfolio_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    expected_salary: Optional[float] = None
    skills: Optional[List[str]] = None
    education: Optional[List[Any]] = None
    experience: Optional[List[Any]] = None

# Resume schemas
class ResumeResponse(BaseModel):
    id: int
    candidate_id: int
    file_name: str
    file_path: str
    file_size: int
    is_default: bool
    uploaded_at: datetime

    class Config:
        from_attributes = True

# Application schemas
class ApplicationCreate(BaseModel):
    job_id: int
    resume_id: Optional[int] = None
    cover_letter: Optional[str] = None

class StatusHistoryResponse(BaseModel):
    id: int
    previous_status: Optional[str]
    new_status: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    resume_id: Optional[int]
    cover_letter: Optional[str]
    status: str
    interview_date: Optional[datetime]
    interview_link: Optional[str]
    recruiter_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    job: Optional[JobResponse] = None
    candidate: Optional[UserResponse] = None
    resume: Optional[ResumeResponse] = None
    history: List[StatusHistoryResponse] = []

    class Config:
        from_attributes = True

class ApplicationStatusUpdate(BaseModel):
    status: str
    recruiter_notes: Optional[str] = None
    interview_date: Optional[datetime] = None
    interview_link: Optional[str] = None
