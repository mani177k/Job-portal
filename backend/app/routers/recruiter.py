from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Job, Application, User, Company, CandidateProfile, Skill
from ..schemas import JobResponse, ApplicationResponse, CompanyResponse, CompanyCreate
from ..auth import get_current_user, require_role

router = APIRouter()

@router.get("/dashboard")
def get_recruiter_dashboard_stats(
    current_user: User = Depends(require_role(["recruiter", "admin"])),
    db: Session = Depends(get_db)
):
    # Total jobs posted by this recruiter
    total_jobs = db.query(Job).filter(Job.recruiter_id == current_user.id).count()
    active_jobs = db.query(Job).filter(Job.recruiter_id == current_user.id, Job.is_active == True).count()
    
    # Applications received across their jobs
    my_job_ids = [j.id for j in db.query(Job.id).filter(Job.recruiter_id == current_user.id).all()]
    
    total_apps = db.query(Application).filter(Application.job_id.in_(my_job_ids)).count() if my_job_ids else 0
    shortlisted = db.query(Application).filter(Application.job_id.in_(my_job_ids), Application.status == "shortlisted").count() if my_job_ids else 0
    interviews = db.query(Application).filter(Application.job_id.in_(my_job_ids), Application.status == "interview_scheduled").count() if my_job_ids else 0
    rejected = db.query(Application).filter(Application.job_id.in_(my_job_ids), Application.status == "rejected").count() if my_job_ids else 0
    selected = db.query(Application).filter(Application.job_id.in_(my_job_ids), Application.status == "selected").count() if my_job_ids else 0

    recent_applications = (
        db.query(Application)
        .filter(Application.job_id.in_(my_job_ids))
        .order_by(Application.created_at.desc())
        .limit(6)
        .all()
    ) if my_job_ids else []

    return {
        "stats": {
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "total_applications": total_apps,
            "shortlisted": shortlisted,
            "interviews": interviews,
            "rejected": rejected,
            "selected": selected
        },
        "recent_applications": recent_applications
    }

@router.get("/jobs", response_model=List[JobResponse])
def get_recruiter_jobs(
    current_user: User = Depends(require_role(["recruiter", "admin"])),
    db: Session = Depends(get_db)
):
    jobs = db.query(Job).filter(Job.recruiter_id == current_user.id).order_by(Job.created_at.desc()).all()
    for j in jobs:
        j.applications_count = db.query(Application).filter(Application.job_id == j.id).count()
    return jobs

@router.get("/jobs/{job_id}/applications", response_model=List[ApplicationResponse])
def get_job_applications(
    job_id: int,
    status: Optional[str] = None,
    current_user: User = Depends(require_role(["recruiter", "admin"])),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if current_user.role != "admin" and job.recruiter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    query = db.query(Application).filter(Application.job_id == job_id)
    if status and status != "all":
        query = query.filter(Application.status == status)

    return query.order_by(Application.created_at.desc()).all()

@router.get("/company", response_model=CompanyResponse)
def get_recruiter_company(
    current_user: User = Depends(require_role(["recruiter"])),
    db: Session = Depends(get_db)
):
    if not current_user.recruiter_profile:
        raise HTTPException(status_code=400, detail="No company associated with recruiter")
    return current_user.recruiter_profile.company

@router.put("/company", response_model=CompanyResponse)
def update_recruiter_company(
    company_data: CompanyCreate,
    current_user: User = Depends(require_role(["recruiter", "admin"])),
    db: Session = Depends(get_db)
):
    company = current_user.recruiter_profile.company
    for k, v in company_data.dict().items():
        setattr(company, k, v)
    db.commit()
    db.refresh(company)
    return company
