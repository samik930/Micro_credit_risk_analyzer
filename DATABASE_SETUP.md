# SQLite Database Integration

## Overview
Your micro credit risk analyzer now uses SQLite for persistent data storage instead of mock data. This provides real database functionality with user authentication, loan applications, and credit score persistence.

## Database Schema

### Tables Created:
1. **users** - User account information
2. **loan_applications** - Loan application details
3. **credit_scores** - ML-generated credit scores and decisions

### Database Structure:
```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    name TEXT,
    phone TEXT,
    address TEXT,
    date_of_birth TEXT,
    created_at DATETIME
);

-- Loan applications table  
CREATE TABLE loan_applications (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    monthly_income REAL,
    existing_debt REAL,
    loan_purpose TEXT,
    requested_amount REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME,
    updated_at DATETIME
);

-- Credit scores table
CREATE TABLE credit_scores (
    id INTEGER PRIMARY KEY,
    application_id INTEGER,
    user_id INTEGER,
    score INTEGER,
    grade TEXT,
    eligibility TEXT,
    max_loan_amount REAL,
    recommended_amount REAL,
    interest_rate REAL,
    emi_amount REAL,
    emi_to_income_ratio REAL,
    rbi_compliant BOOLEAN,
    factors TEXT,  -- JSON string
    created_at DATETIME
);
```

## Setup Instructions

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Initialize Database with Seed Data
```bash
python seed_data.py
```

### 3. Start Backend Server
```bash
python main.py
```
Backend will run on: http://localhost:8000

### 4. Start Frontend (separate terminal)
```bash
npm start
```
Frontend will run on: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Loan Management
- `POST /api/loan/apply` - Submit loan application
- `GET /api/user/{user_id}/credit-score` - Get user's credit score

### Admin Dashboard
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - All users with scores

## Demo Accounts (Pre-seeded)

| Email | Password | Profile |
|-------|----------|---------|
| john@example.com | password123 | Business loan applicant |
| jane@example.com | demo123 | Education loan applicant |
| demo@test.com | demo | High-income business applicant |

## Features

### Real Database Storage
- ✅ User authentication with password hashing
- ✅ Persistent loan applications
- ✅ Credit score calculations stored in DB
- ✅ Admin dashboard with real statistics

### API Integration
- ✅ React frontend calls FastAPI backend
- ✅ Error handling with fallback to mock data
- ✅ Loading states and user feedback

### Credit Scoring
- ✅ ML-based scoring algorithm
- ✅ RBI compliance validation
- ✅ EMI calculations
- ✅ Personalized improvement suggestions

## File Structure
```
backend/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── seed_data.py        # Database initialization
└── credit_risk.db      # SQLite database (auto-created)

src/
├── services/
│   └── api.ts          # API service layer
└── components/
    ├── BorrowerAuth.tsx     # Updated with real auth
    ├── BorrowerDashboard.tsx # Updated with API calls
    └── ...
```

## Database Location
The SQLite database file `credit_risk.db` will be created in the `backend/` directory when you first run the application.

## Troubleshooting

### Backend Issues
- Ensure Python 3.7+ is installed
- Check if port 8000 is available
- Verify all dependencies are installed

### Frontend Issues
- Ensure backend is running on port 8000
- Check browser console for API errors
- Fallback to mock data if API fails

### Database Issues
- Delete `credit_risk.db` and run `seed_data.py` again
- Check file permissions in backend directory

## Next Steps
- Add JWT token authentication
- Implement session management
- Add data export functionality
- Create admin user management
- Add audit logging
