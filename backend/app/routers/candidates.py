import os
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, CandidateProfile, Skill, Resume, SavedJob, Job
from ..schemas import CandidateProfileUpdate, ResumeResponse, JobResponse
from ..auth import get_current_user, require_role

router = APIRouter()

@router.get("/profile")
def get_candidate_profile(
    current_user: User = Depends(require_role(["candidate", "admin"])),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    skills = [s.name for s in profile.skills]
    education = json.loads(profile.education_json) if profile.education_json else []
    experience = json.loads(profile.experience_json) if profile.experience_json else []

    return {
        "user": current_user,
        "profile": {
            "id": profile.id,
            "headline": profile.headline,
            "bio": profile.bio,
            "experience_years": float(profile.experience_years) if profile.experience_years else 0,
            "current_location": profile.current_location,
            "portfolio_url": profile.portfolio_url,
            "linkedin_url": profile.linkedin_url,
            "github_url": profile.github_url,
            "expected_salary": float(profile.expected_salary) if profile.expected_salary else None,
            "skills": skills,
            "education": education,
            "experience": experience
        }
    }

@router.put("/profile")
def update_candidate_profile(
    profile_data: CandidateProfileUpdate,
    current_user: User = Depends(require_role(["candidate"])),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)

    if profile_data.headline is not None:
        profile.headline = profile_data.headline
    if profile_data.bio is not None:
        profile.bio = profile_data.bio
    if profile_data.experience_years is not None:
        profile.experience_years = profile_data.experience_years
    if profile_data.current_location is not None:
        profile.current_location = profile_data.current_location
    if profile_data.portfolio_url is not None:
        profile.portfolio_url = profile_data.portfolio_url
    if profile_data.linkedin_url is not None:
        profile.linkedin_url = profile_data.linkedin_url
    if profile_data.github_url is not None:
        profile.github_url = profile_data.github_url
    if profile_data.expected_salary is not None:
        profile.expected_salary = profile_data.expected_salary
    if profile_data.education is not None:
        profile.education_json = json.dumps(profile_data.education)
    if profile_data.experience is not None:
        profile.experience_json = json.dumps(profile_data.experience)

    if profile_data.skills is not None:
        profile.skills = []
        for s_name in profile_data.skills:
            skill = db.query(Skill).filter(Skill.name.ilike(s_name)).first()
            if not skill:
                skill = Skill(name=s_name.strip())
                db.add(skill)
                db.commit()
                db.refresh(skill)
            profile.skills.append(skill)

    db.commit()
    db.refresh(profile)
    return {"message": "Profile updated successfully"}

@router.post("/resume", response_model=ResumeResponse)
def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["candidate"])),
    db: Session = Depends(get_db)
):
    os.makedirs("uploads/resumes", exist_ok=True)
    filename = f"{current_user.id}_{int(os.times().system)}_{file.filename}"
    file_path = f"uploads/resumes/{filename}"
    
    with open(file_path, "wb") as f:
        content = file.file.read()
        f.write(content)
        file_size = len(content)

    # Set existing resumes default to false
    db.query(Resume).filter(Resume.candidate_id == current_user.id).update({"is_default": False})

    new_resume = Resume(
        candidate_id=current_user.id,
        file_name=file.filename,
        file_path=f"/uploads/resumes/{filename}",
        file_size=file_size,
        is_default=True
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    return new_resume

@router.get("/resumes", response_model=List[ResumeResponse])
def get_resumes(
    current_user: User = Depends(require_role(["candidate"])),
    db: Session = Depends(get_db)
):
    return db.query(Resume).filter(Resume.candidate_id == current_user.id).order_by(Resume.uploaded_at.desc()).all()
