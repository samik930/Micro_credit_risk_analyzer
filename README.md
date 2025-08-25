<<<<<<< HEAD
# Micro_credit_risk_analyzer
AI-powered Micro-Credit Risk Analyzer using alternative financial data (UPI, bills, recharges) to generate creditworthiness scores (0–100) for financial inclusion.
=======
# Micro Credit Risk Analyzer

An AI-powered credit scoring system that uses alternative financial signals to assess creditworthiness for individuals without formal credit history.

## Problem Statement

In India, over 65% of adults don't have a formal credit history. Traditional credit scoring excludes students, gig workers, daily wage earners, and small shopkeepers. However, they still generate digital footprints via UPI transactions, mobile recharges, bill payments, etc.

## Solution

This ML system uses alternative financial signals to estimate credit risk:

- **Consistent mobile recharge** = stable income
- **Regular utility bill payments** = responsible behavior  
- **Many small UPI transactions** = active digital footprint
- **Sudden high-value loans/withdrawals** = higher risk

**Output**: A creditworthiness score (0–100) for loan approval decisions.

## Features

### 🚀 MVP Features
1. **Upload/Fetch Data** - CSV/JSON with transaction history
2. **Feature Engineering** - Average monthly spend, payment ratio, transaction diversity, income stability
3. **Risk Scoring Model** - Logistic Regression / Random Forest / XGBoost
4. **Dashboard** - CSV upload → process → credit scores → graphs and recommendations

### 📊 Dashboard Components
- File upload for CSV/JSON data
- Risk score table with sorting and filtering
- Data visualization (risk distribution, score ranges)
- Decision summary (Approve/Review/Reject)
- Export functionality

## Tech Stack

- **Frontend**: React.js + TypeScript + TailwindCSS
- **Backend**: FastAPI + SQLite + SQLAlchemy
- **Database**: SQLite with persistent storage
- **Charts**: Recharts
- **ML**: Python (Scikit-learn)
- **Authentication**: Password hashing + session management
- **Data**: CSV/JSON processing + real-time API calls

## Sample Dataset Format

```csv
user_id,income_inflow,bill_payments_on_time,avg_upi_txn,recharge_freq,loan_defaulted
U001,15000,95%,40,6,No
U002,8000,60%,15,2,Yes
U003,12000,85%,30,4,No
```

## Risk Scoring Logic

The system calculates risk scores based on:
- **Payment Ratio** (30% weight) - Bill payment consistency
- **Income Stability** (25% weight) - Monthly income reliability
- **Transaction Activity** (20% weight) - UPI transaction frequency
- **Recharge Consistency** (15% weight) - Mobile recharge patterns
- **Default History** (10% weight) - Previous loan defaults

### Risk Levels
- **Low Risk (70-100)**: Approve
- **Medium Risk (40-69)**: Review
- **High Risk (0-39)**: Reject

## Getting Started

### Prerequisites
- Node.js 16+
- Python 3.7+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd micro-credit-risk-analyzer
```

2. Install frontend dependencies
```bash
npm install
```

3. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

4. Initialize database with seed data
```bash
python seed_data.py
```

5. Start the backend server
```bash
python main.py
```
Backend runs on: http://localhost:8000

6. Start the frontend (new terminal)
```bash
npm start
```
Frontend runs on: http://localhost:3000

### Demo Accounts
- **john@example.com** / password123
- **jane@example.com** / demo123  
- **demo@test.com** / demo

### Usage

#### Admin Portal (/app)
1. **Upload Data**: Drag and drop CSV file with transaction data
2. **View Results**: See risk scores, decisions, and reason codes
3. **Analyze**: Use dashboard to understand risk distribution
4. **Export**: Download results as CSV for further analysis

#### Borrower Portal (/borrower)
1. **Apply for Loan**: Fill out loan application form
2. **Login**: Access personal dashboard with existing account
3. **View Credit Score**: See personal risk assessment and eligibility
4. **Get Suggestions**: Receive personalized improvement recommendations

## Demo Flow

### Admin Workflow
1. **Step 1**: Upload CSV of users' digital transactions
2. **Step 2**: Model extracts features and runs ML scoring
3. **Step 3**: Dashboard shows risk distribution and compliance metrics

### Borrower Workflow
1. **Step 1**: User applies for loan with personal/financial details
2. **Step 2**: System calculates credit score using ML algorithm
3. **Step 3**: Borrower sees eligibility, EMI details, and improvement tips

## System Architecture

```
[React Frontend] ↔ [FastAPI Backend] ↔ [SQLite Database]
                        ↓
                  [ML Credit Scoring]
                        ↓
                  [RBI Compliance Check]
```

## Database Schema
- **users**: Account information and authentication
- **loan_applications**: Application details and status
- **credit_scores**: ML-generated scores and decisions

## Future Enhancements

- **JWT Authentication**: Secure token-based auth
- **Advanced ML**: XGBoost, ensemble methods
- **Mobile App**: React Native implementation
- **Admin Management**: User management interface
- **Audit Logging**: Complete transaction history
- **Payment Integration**: EMI payment processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
>>>>>>> 502ddd1c (Initial commit)
