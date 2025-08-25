from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import hashlib
from datetime import datetime
import json
from typing import Optional, List, Dict
from dynamic_scoring import DynamicRiskScorer
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import secrets
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./credit_risk.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    name = Column(String)
    phone = Column(String)
    address = Column(String)
    date_of_birth = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class LoanApplication(Base):
    __tablename__ = "loan_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    monthly_income = Column(Float)
    existing_debt = Column(Float)
    loan_purpose = Column(String)
    requested_amount = Column(Float)
    status = Column(String, default="pending")  # pending, approved, rejected, review
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class CreditScore(Base):
    __tablename__ = "credit_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, index=True)
    user_id = Column(Integer, index=True)
    score = Column(Integer)
    grade = Column(String)
    eligibility = Column(String)
    max_loan_amount = Column(Float)
    recommended_amount = Column(Float)
    interest_rate = Column(Float)
    emi_amount = Column(Float)
    emi_to_income_ratio = Column(Float)
    rbi_compliant = Column(Boolean)
    factors = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    transaction_type = Column(String)  # electricity, mobile, salary, bnpl, paylater
    amount = Column(Float)
    status = Column(String)  # paid_on_time, paid_late, failed
    due_date = Column(String)
    paid_date = Column(String)
    days_late = Column(Integer, default=0)
    provider = Column(String)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class ScoreHistory(Base):
    __tablename__ = "score_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    old_score = Column(Integer)
    new_score = Column(Integer)
    change_reason = Column(String)
    transaction_id = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    phone: str
    address: str
    date_of_birth: str

class UserLogin(BaseModel):
    email: str
    password: str

class LoanApplicationCreate(BaseModel):
    monthly_income: float
    existing_debt: float
    loan_purpose: str
    requested_amount: float

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    phone: str
    address: str
    date_of_birth: str

class CreditScoreResponse(BaseModel):
    score: int
    grade: str
    eligibility: str
    max_loan_amount: float
    recommended_amount: float
    interest_rate: float
    emi_amount: float
    emi_to_income_ratio: float
    rbi_compliant: bool
    factors: dict

class TransactionRequest(BaseModel):
    transaction_type: str  # 'electricity', 'mobile', 'salary', 'bnpl', 'paylater'
    amount: float
    status: str  # 'paid_on_time', 'paid_late', 'failed'
    due_date: Optional[str] = None
    paid_date: Optional[str] = None
    days_late: Optional[int] = 0
    provider: Optional[str] = None
    description: Optional[str] = None

# FastAPI app
app = FastAPI(title="Micro Credit Risk Analyzer API")

# Initialize dynamic scorer
scorer = DynamicRiskScorer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Utility functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def calculate_credit_score(monthly_income: float, existing_debt: float, 
                         loan_purpose: str, requested_amount: float) -> dict:
    """Calculate credit score based on financial parameters"""
    score = 50
    
    # Income factor (0-30 points)
    if monthly_income >= 50000:
        score += 30
    elif monthly_income >= 25000:
        score += 20
    elif monthly_income >= 15000:
        score += 15
    elif monthly_income >= 10000:
        score += 10
    else:
        score += 5
    
    # Debt factor (0-25 points)
    debt_to_income_ratio = (existing_debt / monthly_income) * 100
    if debt_to_income_ratio <= 20:
        score += 25
    elif debt_to_income_ratio <= 40:
        score += 15
    elif debt_to_income_ratio <= 60:
        score += 10
    else:
        score += 5
    
    # Purpose factor (0-15 points)
    purpose_scores = {
        'business': 15,
        'agriculture': 12,
        'education': 10,
        'medical': 8,
        'personal': 5
    }
    score += purpose_scores.get(loan_purpose, 5)
    
    # Amount factor (0-10 points)
    if requested_amount <= 25000:
        score += 10
    elif requested_amount <= 50000:
        score += 8
    elif requested_amount <= 75000:
        score += 6
    elif requested_amount <= 100000:
        score += 4
    else:
        score += 2
    
    # Calculate other metrics
    max_loan_amount = min(125000, monthly_income * 50)
    recommended_amount = min(requested_amount, max_loan_amount * 0.8)
    interest_rate = 18 if score >= 70 else 22 if score >= 50 else 26
    emi_amount = (recommended_amount * (interest_rate/100/12) * 
                  pow(1 + interest_rate/100/12, 24)) / (pow(1 + interest_rate/100/12, 24) - 1)
    emi_to_income_ratio = (emi_amount / monthly_income) * 100
    
    # Determine eligibility and grade
    if score >= 70 and emi_to_income_ratio <= 50 and requested_amount <= 125000:
        eligibility = 'approved'
        grade = 'Excellent'
    elif score >= 50 and emi_to_income_ratio <= 60:
        eligibility = 'review'
        grade = 'Good'
    else:
        eligibility = 'rejected'
        grade = 'Poor'
    
    rbi_compliant = (requested_amount <= 125000 and 
                    monthly_income >= 5000 and 
                    emi_to_income_ratio <= 50 and 
                    interest_rate <= 26)
    
    factors = {
        'income': round((30 if monthly_income >= 25000 else 15) / 30 * 100),
        'debt': round((25 if debt_to_income_ratio <= 40 else 10) / 25 * 100),
        'purpose': round(purpose_scores.get(loan_purpose, 5) / 15 * 100),
        'amount': round((8 if requested_amount <= 50000 else 4) / 10 * 100)
    }
    
    return {
        'score': round(score),
        'grade': grade,
        'eligibility': eligibility,
        'max_loan_amount': max_loan_amount,
        'recommended_amount': round(recommended_amount),
        'interest_rate': interest_rate,
        'emi_amount': round(emi_amount),
        'emi_to_income_ratio': round(emi_to_income_ratio * 10) / 10,
        'rbi_compliant': rbi_compliant,
        'factors': factors
    }

# API Endpoints
@app.post("/api/auth/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user.password)
    db_user = User(
        email=user.email,
        password_hash=hashed_password,
        name=user.name,
        phone=user.phone,
        address=user.address,
        date_of_birth=user.date_of_birth
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {"message": "User registered successfully", "user_id": db_user.id}

@app.post("/api/auth/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "address": user.address,
            "date_of_birth": user.date_of_birth
        }
    }

@app.post("/api/loan/apply")
async def apply_loan(application: LoanApplicationCreate, user_id: int, db: Session = Depends(get_db)):
    # Create loan application
    db_application = LoanApplication(
        user_id=user_id,
        monthly_income=application.monthly_income,
        existing_debt=application.existing_debt,
        loan_purpose=application.loan_purpose,
        requested_amount=application.requested_amount
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    # Calculate credit score
    score_data = calculate_credit_score(
        application.monthly_income,
        application.existing_debt,
        application.loan_purpose,
        application.requested_amount
    )
    
    # Save credit score
    import json
    db_score = CreditScore(
        application_id=db_application.id,
        user_id=user_id,
        score=score_data['score'],
        grade=score_data['grade'],
        eligibility=score_data['eligibility'],
        max_loan_amount=score_data['max_loan_amount'],
        recommended_amount=score_data['recommended_amount'],
        interest_rate=score_data['interest_rate'],
        emi_amount=score_data['emi_amount'],
        emi_to_income_ratio=score_data['emi_to_income_ratio'],
        rbi_compliant=score_data['rbi_compliant'],
        factors=json.dumps(score_data['factors'])
    )
    db.add(db_score)
    
    # Update application status
    db_application.status = score_data['eligibility']
    db.commit()
    
    return {
        "application_id": db_application.id,
        "credit_score": score_data
    }

@app.get("/api/user/{user_id}/credit-score")
async def get_credit_score(user_id: int, db: Session = Depends(get_db)):
    score = db.query(CreditScore).filter(CreditScore.user_id == user_id).order_by(CreditScore.created_at.desc()).first()
    if not score:
        raise HTTPException(status_code=404, detail="No credit score found")
    
    # Get loan application data to include financial details
    loan_app = db.query(LoanApplication).filter(LoanApplication.user_id == user_id).order_by(LoanApplication.created_at.desc()).first()
    
    import json
    return {
        "score": score.score,
        "grade": score.grade,
        "eligibility": score.eligibility,
        "max_loan_amount": score.max_loan_amount,
        "recommended_amount": score.recommended_amount,
        "interest_rate": score.interest_rate,
        "emi_amount": score.emi_amount,
        "emi_to_income_ratio": score.emi_to_income_ratio,
        "monthly_income": loan_app.monthly_income if loan_app else 0,
        "existing_debt": loan_app.existing_debt if loan_app else 0,
        "loan_purpose": loan_app.loan_purpose if loan_app else "business",
        "requested_amount": loan_app.requested_amount if loan_app else 0,
        "rbi_compliant": score.rbi_compliant,
        "factors": json.loads(score.factors)
    }

@app.get("/api/admin/dashboard")
async def get_admin_dashboard(db: Session = Depends(get_db)):
    # Get all applications and scores for admin dashboard
    applications = db.query(LoanApplication).all()
    scores = db.query(CreditScore).all()
    
    total_users = len(set([app.user_id for app in applications]))
    approved_count = len([s for s in scores if s.eligibility == 'approved'])
    review_count = len([s for s in scores if s.eligibility == 'review'])
    rejected_count = len([s for s in scores if s.eligibility == 'rejected'])
    
    avg_score = sum([s.score for s in scores]) / len(scores) if scores else 0
    rbi_compliant_count = len([s for s in scores if s.rbi_compliant])
    rbi_compliance_rate = (rbi_compliant_count / len(scores) * 100) if scores else 0
    
    return {
        "total_users": total_users,
        "approved_count": approved_count,
        "review_count": review_count,
        "rejected_count": rejected_count,
        "avg_score": round(avg_score, 1),
        "rbi_compliance_rate": round(rbi_compliance_rate, 1),
        "avg_eligible_loan_amount": sum([s.recommended_amount for s in scores]) / len(scores) if scores else 0,
        "excellent_credit_count": len([s for s in scores if s.grade == 'Excellent']),
        "good_credit_count": len([s for s in scores if s.grade == 'Good']),
        "poor_credit_count": len([s for s in scores if s.grade == 'Poor']),
        "common_violations": []  # Can be enhanced later
    }

@app.get("/api/admin/users")
async def get_all_users_with_scores(db: Session = Depends(get_db)):
    # Join users with their latest credit scores
    results = []
    users = db.query(User).all()
    
    for user in users:
        latest_score = db.query(CreditScore).filter(CreditScore.user_id == user.id).order_by(CreditScore.created_at.desc()).first()
        latest_app = db.query(LoanApplication).filter(LoanApplication.user_id == user.id).order_by(LoanApplication.created_at.desc()).first()
        
        if latest_score and latest_app:
            import json
            results.append({
                "user_id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "monthly_income": latest_app.monthly_income,
                "existing_debt": latest_app.existing_debt,
                "requested_amount": latest_app.requested_amount,
                "loan_purpose": latest_app.loan_purpose,
                "risk_score": latest_score.score,
                "decision": latest_score.eligibility,
                "eligible_loan_amount": latest_score.recommended_amount,
                "emi_to_income_ratio": latest_score.emi_to_income_ratio,
                "rbi_compliant": latest_score.rbi_compliant
            })
    
    return results

@app.post("/add-transaction/{user_id}")
async def add_transaction(user_id: int, transaction: TransactionRequest):
    """Add new transaction and update credit score dynamically"""
    try:
        # Convert request to dict for scorer
        transaction_data = {
            'transaction_type': transaction.transaction_type,
            'amount': transaction.amount,
            'status': transaction.status,
            'due_date': transaction.due_date,
            'paid_date': transaction.paid_date,
            'days_late': transaction.days_late or 0,
            'provider': transaction.provider or '',
            'description': transaction.description or f"{transaction.transaction_type.title()} Payment"
        }
        
        # Add transaction and get updated score
        result = scorer.add_transaction_and_update_score(user_id, transaction_data)
        
        return {
            'success': True,
            'message': result['change_reason'],
            'old_score': result['score'] - result['score_change'],
            'new_score': result['score'],
            'score_change': result['score_change'],
            'new_grade': result['grade'],
            'new_eligibility': result['eligibility'],
            'transaction_id': result['transaction_id']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding transaction: {str(e)}")

@app.get("/transactions/{user_id}")
async def get_user_transactions(user_id: int, limit: int = 20):
    """Get user's transaction history"""
    try:
        conn = sqlite3.connect('credit_risk.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT transaction_type, amount, status, due_date, paid_date, 
                   days_late, provider, description, created_at
            FROM transactions 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        ''', (user_id, limit))
        
        transactions = cursor.fetchall()
        conn.close()
        
        return {
            'transactions': [
                {
                    'type': tx[0],
                    'amount': tx[1],
                    'status': tx[2],
                    'due_date': tx[3],
                    'paid_date': tx[4],
                    'days_late': tx[5],
                    'provider': tx[6],
                    'description': tx[7],
                    'date': tx[8]
                }
                for tx in transactions
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transactions: {str(e)}")

@app.get("/score-history/{user_id}")
async def get_score_history(user_id: int, limit: int = 10):
    """Get user's credit score change history"""
    try:
        history = scorer.get_score_history(user_id, limit)
        return {'score_history': history}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching score history: {str(e)}")

@app.get("/user-score/{user_id}")
async def get_user_score(user_id: int):
    """Get current user credit score with detailed breakdown"""
    try:
        score_data = scorer.calculate_user_score(user_id)
        return score_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user score: {str(e)}")

@app.delete("/clear-transactions/{user_id}")
async def clear_user_transactions(user_id: int):
    """Clear all transactions and score history for a user (for demo purposes)"""
    try:
        conn = sqlite3.connect('credit_risk.db')
        cursor = conn.cursor()
        
        # Clear transactions
        cursor.execute('DELETE FROM transactions WHERE user_id = ?', (user_id,))
        transactions_deleted = cursor.rowcount
        
        # Clear score history
        cursor.execute('DELETE FROM score_history WHERE user_id = ?', (user_id,))
        history_deleted = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        return {
            'success': True,
            'message': f'Cleared {transactions_deleted} transactions and {history_deleted} score history entries',
            'transactions_deleted': transactions_deleted,
            'history_deleted': history_deleted
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing transactions: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
