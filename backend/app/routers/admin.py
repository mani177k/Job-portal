from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Job, Application, Company, RecruiterProfile
from ..schemas import UserResponse, JobResponse, ApplicationResponse
from ..auth import require_role

router = APIRouter()

@router.get("/dashboard")
def get_admin_dashboard(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_candidates = db.query(User).filter(User.role == "candidate").count()
    total_recruiters = db.query(User).filter(User.role == "recruiter").count()
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.is_active == True).count()
    total_applications = db.query(Application).count()
    total_companies = db.query(Company).count()

    recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    recent_jobs = db.query(Job).order_by(Job.created_at.desc()).limit(5).all()

    return {
        "stats": {
            "total_users": total_users,
            "total_candidates": total_candidates,
            "total_recruiters": total_recruiters,
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "total_applications": total_applications,
            "total_companies": total_companies
        },
        "recent_users": recent_users,
        "recent_jobs": recent_jobs
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    role: Optional[str] = None,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role and role != "all":
        query = query.filter(User.role == role)
    return query.order_by(User.created_at.desc()).all()

@router.put("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    is_active: bool,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot toggle your own admin status")
    
    user.is_active = is_active
    db.commit()
    return {"message": f"User status updated to {'active' if is_active else 'suspended'}"}

@router.get("/jobs", response_model=List[JobResponse])
def get_all_admin_jobs(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    for j in jobs:
        j.applications_count = db.query(Application).filter(Application.job_id == j.id).count()
    return jobs

@router.put("/jobs/{job_id}/status")
def toggle_job_status(
    job_id: int,
    is_active: bool,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.is_active = is_active
    db.commit()
    return {"message": f"Job status updated to {'active' if is_active else 'inactive'}"}
