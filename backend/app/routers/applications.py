from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Application, ApplicationStatusHistory, Job, User, Resume
from ..schemas import ApplicationCreate, ApplicationResponse, ApplicationStatusUpdate
from ..auth import get_current_user, require_role

router = APIRouter()

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_for_job(
    app_data: ApplicationCreate,
    current_user: User = Depends(require_role(["candidate"])),
    db: Session = Depends(get_db)
):
    # Verify job exists and is active
    job = db.query(Job).filter(Job.id == app_data.job_id).first()
    if not job or not job.is_active:
        raise HTTPException(status_code=404, detail="Job opening not found or no longer active")

    # Prevent duplicate applications
    existing = db.query(Application).filter(
        Application.job_id == app_data.job_id,
        Application.candidate_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this position")

    # Check resume
    resume_id = app_data.resume_id
    if not resume_id:
        default_resume = db.query(Resume).filter(Resume.candidate_id == current_user.id, Resume.is_default == True).first()
        if default_resume:
            resume_id = default_resume.id

    new_app = Application(
        job_id=app_data.job_id,
        candidate_id=current_user.id,
        resume_id=resume_id,
        cover_letter=app_data.cover_letter,
        status="applied"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    # Add initial history event
    history = ApplicationStatusHistory(
        application_id=new_app.id,
        changed_by_user_id=current_user.id,
        previous_status=None,
        new_status="applied",
        notes="Candidate submitted application."
    )
    db.add(history)
    db.commit()

    return new_app

@router.get("/my-applications", response_model=List[ApplicationResponse])
def get_my_applications(
    current_user: User = Depends(require_role(["candidate"])),
    db: Session = Depends(get_db)
):
    apps = db.query(Application).filter(Application.candidate_id == current_user.id).order_by(Application.created_at.desc()).all()
    return apps

@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Auth check: only applicant, recruiter who posted job, or admin
    if current_user.role == "candidate" and app.candidate_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    elif current_user.role == "recruiter" and app.job.recruiter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    return app

@router.put("/{application_id}/status")
def update_application_status(
    application_id: int,
    status_update: ApplicationStatusUpdate,
    current_user: User = Depends(require_role(["recruiter", "admin"])),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    old_status = app.status
    app.status = status_update.status
    if status_update.recruiter_notes is not None:
        app.recruiter_notes = status_update.recruiter_notes
    if status_update.interview_date is not None:
        app.interview_date = status_update.interview_date
    if status_update.interview_link is not None:
        app.interview_link = status_update.interview_link

    history = ApplicationStatusHistory(
        application_id=app.id,
        changed_by_user_id=current_user.id,
        previous_status=old_status,
        new_status=status_update.status,
        notes=status_update.recruiter_notes or f"Status changed from {old_status} to {status_update.status}"
    )
    db.add(history)
    db.commit()
    return {"message": "Application status updated successfully", "status": app.status}

@router.delete("/{application_id}/withdraw")
def withdraw_application(
    application_id: int,
    current_user: User = Depends(require_role(["candidate"])),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(
        Application.id == application_id,
        Application.candidate_id == current_user.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(app)
    db.commit()
    return {"message": "Application withdrawn successfully"}
