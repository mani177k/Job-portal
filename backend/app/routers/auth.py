from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, CandidateProfile, RecruiterProfile, Company
from ..schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from ..auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    new_user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        avatar_url=user_data.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.first_name}",
        is_active=True,
        is_verified=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # If candidate, create candidate profile
    if new_user.role == "candidate":
        cand_prof = CandidateProfile(
            user_id=new_user.id,
            headline=f"Software Engineer",
            bio="Motivated professional looking for exciting opportunities."
        )
        db.add(cand_prof)
        db.commit()

    # If recruiter, associate or create company
    elif new_user.role == "recruiter":
        company_name = user_data.company_name or "Tech Solutions Inc"
        slug = company_name.lower().replace(" ", "-").replace(".", "")
        company = db.query(Company).filter(Company.slug == slug).first()
        if not company:
            company = Company(
                name=company_name,
                slug=slug,
                industry=user_data.industry or "Technology",
                location="San Francisco, CA",
                website="https://example.com"
            )
            db.add(company)
            db.commit()
            db.refresh(company)

        rec_prof = RecruiterProfile(
            user_id=new_user.id,
            company_id=company.id,
            designation=user_data.designation or "Talent Acquisition Lead"
        )
        db.add(rec_prof)
        db.commit()

    token = create_access_token({"sub": new_user.id, "role": new_user.role})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is suspended or deactivated")

    token = create_access_token({"sub": user.id, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user
