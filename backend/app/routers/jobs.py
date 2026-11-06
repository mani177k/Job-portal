from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Job, Company, Skill, User, SavedJob, Application, job_skills
from ..schemas import JobCreate, JobUpdate, JobResponse
from ..auth import get_current_user, require_role

router = APIRouter()

@router.get("", response_model=List[JobResponse])
def get_jobs(
    search: Optional[str] = None,
    location: Optional[str] = None,
    employment_type: Optional[str] = None,
    experience_level: Optional[str] = None,
    work_mode: Optional[str] = None,
    min_salary: Optional[float] = None,
    sort_by: Optional[str] = "latest",
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.is_active == True)

    if search:
        search_filter = f"%{search}%"
        query = query.join(Company).filter(
            (Job.title.ilike(search_filter)) | 
            (Job.description.ilike(search_filter)) |
            (Company.name.ilike(search_filter))
        )
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if employment_type and employment_type != "all":
        query = query.filter(Job.employment_type == employment_type)
    if experience_level and experience_level != "all":
        query = query.filter(Job.experience_level == experience_level)
    if work_mode and work_mode != "all":
        query = query.filter(Job.work_mode == work_mode)
    if min_salary:
        query = query.filter(Job.min_salary >= min_salary)

    if sort_by == "latest":
        query = query.order_by(Job.created_at.desc())
    elif sort_by == "salary_high":
        query = query.order_by(Job.max_salary.desc().nullslast())
    elif sort_by == "featured":
        query = query.order_by(Job.is_featured.desc(), Job.created_at.desc())

    jobs = query.all()
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
def get_job_detail(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    current_user: User = Depends(require_role(["recruiter", "admin"])),
    db: Session = Depends(get_db)
):
    if not current_user.recruiter_profile:
        raise HTTPException(status_code=400, detail="User does not have an associated recruiter company profile")
    
    company_id = current_user.recruiter_profile.company_id
    new_job = Job(
        recruiter_id=current_user.id,
        company_id=company_id,
        title=job_in.title,
        department=job_in.department,
        description=job_in.description,
        requirements=job_in.requirements,
        responsibilities=job_in.responsibilities,
        location=job_in.location,
        work_mode=job_in.work_mode,
        employment_type=job_in.employment_type,
        experience_level=job_in.experience_level,
        min_salary=job_in.min_salary,
        max_salary=job_in.max_salary,
        currency=job_in.currency,
        is_active=job_in.is_active,
        is_featured=job_in.is_featured,
        application_deadline=job_in.application_deadline
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # Attach skills
    for skill_name in job_in.skills:
        skill = db.query(Skill).filter(Skill.name.ilike(skill_name)).first()
        if not skill:
            skill = Skill(name=skill_name.strip())
            db.add(skill)
            db.commit()
            db.refresh(skill)
        new_job.skills.append(skill)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_update: JobUpdate,
    current_user: User = Depends(require_role(["recruiter", "admin"])),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if current_user.role != "admin" and job.recruiter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this job")

    update_data = job_update.dict(exclude_unset=True)
    skills = update_data.pop("skills", None)

    for field, val in update_data.items():
        setattr(job, field, val)

    if skills is not None:
        job.skills = []
        for s_name in skills:
            skill = db.query(Skill).filter(Skill.name.ilike(s_name)).first()
            if not skill:
                skill = Skill(name=s_name.strip())
                db.add(skill)
                db.commit()
                db.refresh(skill)
            job.skills.append(skill)

    db.commit()
    db.refresh(job)
    return job

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    current_user: User = Depends(require_role(["recruiter", "admin"])),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if current_user.role != "admin" and job.recruiter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this job")
    db.delete(job)
    db.commit()
    return None
