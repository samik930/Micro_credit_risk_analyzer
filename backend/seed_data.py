import sqlite3
import hashlib
from datetime import datetime

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_tables():
    """Create database tables if they don't exist"""
    conn = sqlite3.connect('credit_risk.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            date_of_birth TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create loan_applications table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS loan_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            monthly_income REAL NOT NULL,
            existing_debt REAL DEFAULT 0,
            loan_purpose TEXT NOT NULL,
            requested_amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create credit_scores table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS credit_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_id INTEGER,
            user_id INTEGER NOT NULL,
            score INTEGER NOT NULL,
            grade TEXT NOT NULL,
            eligibility TEXT NOT NULL,
            max_loan_amount REAL NOT NULL,
            recommended_amount REAL NOT NULL,
            interest_rate REAL NOT NULL,
            emi_amount REAL NOT NULL,
            emi_to_income_ratio REAL NOT NULL,
            rbi_compliant BOOLEAN NOT NULL,
            factors TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (application_id) REFERENCES loan_applications (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create transactions table for realistic data sources
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            transaction_type TEXT NOT NULL, -- 'electricity', 'mobile', 'salary', 'bnpl', 'paylater'
            amount REAL NOT NULL,
            status TEXT NOT NULL, -- 'paid_on_time', 'paid_late', 'failed', 'pending'
            due_date DATE,
            paid_date DATE,
            days_late INTEGER DEFAULT 0,
            provider TEXT, -- 'BSES', 'Airtel', 'Company_ABC', 'Paytm_Postpaid', etc.
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create score_history table to track dynamic changes
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS score_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            old_score INTEGER,
            new_score INTEGER NOT NULL,
            change_reason TEXT NOT NULL,
            transaction_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (transaction_id) REFERENCES transactions (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database tables created successfully!")

def create_seed_data():
    """Create initial seed data for the database"""
    # First create tables
    create_tables()
    
    conn = sqlite3.connect('credit_risk.db')
    cursor = conn.cursor()
    
    # Seed users
    users_data = [
        ('john@example.com', hash_password('password123'), 'John Doe', '+91 9876543210', 'Mumbai, Maharashtra', '1990-01-15'),
        ('jane@example.com', hash_password('demo123'), 'Jane Smith', '+91 9876543211', 'Delhi, Delhi', '1992-03-20'),
        ('demo@test.com', hash_password('demo'), 'Demo User', '+91 9876543212', 'Bangalore, Karnataka', '1988-07-10'),
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO users (email, password_hash, name, phone, address, date_of_birth)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', users_data)
    
    # Get user IDs
    cursor.execute("SELECT id, email FROM users")
    user_map = {email: user_id for user_id, email in cursor.fetchall()}
    
    # Seed loan applications
    applications_data = [
        (user_map['john@example.com'], 25000, 15000, 'business', 50000, 'pending'),
        (user_map['jane@example.com'], 35000, 8000, 'education', 75000, 'pending'),
        (user_map['demo@test.com'], 45000, 20000, 'business', 100000, 'pending'),
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO loan_applications (user_id, monthly_income, existing_debt, loan_purpose, requested_amount, status)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', applications_data)
    
    # Seed realistic transaction data
    from datetime import datetime, timedelta
    import random
    
    # Generate realistic transactions for each user
    transaction_types = ['electricity', 'mobile', 'salary', 'bnpl', 'paylater']
    providers = {
        'electricity': ['BSES', 'Tata Power', 'MSEB', 'KSEB'],
        'mobile': ['Airtel', 'Jio', 'Vi', 'BSNL'],
        'salary': ['TechCorp Ltd', 'InfoSys', 'Wipro', 'Freelance'],
        'bnpl': ['Paytm Postpaid', 'Amazon Pay Later', 'Flipkart Pay Later'],
        'paylater': ['LazyPay', 'Simpl', 'ZestMoney', 'KreditBee']
    }
    
    transactions_data = []
    base_date = datetime.now() - timedelta(days=180)  # 6 months of data
    
    for user_id in user_map.values():
        # Generate 30-50 transactions per user over 6 months
        num_transactions = random.randint(30, 50)
        
        for i in range(num_transactions):
            # Random transaction type
            tx_type = random.choice(transaction_types)
            provider = random.choice(providers[tx_type])
            
            # Generate realistic amounts based on type
            if tx_type == 'electricity':
                amount = random.randint(800, 3500)
                due_date = base_date + timedelta(days=i*5)
            elif tx_type == 'mobile':
                amount = random.randint(199, 999)
                due_date = base_date + timedelta(days=i*3)
            elif tx_type == 'salary':
                amount = random.randint(25000, 80000)
                due_date = base_date + timedelta(days=i*30)  # Monthly
            elif tx_type in ['bnpl', 'paylater']:
                amount = random.randint(500, 15000)
                due_date = base_date + timedelta(days=i*7)
            
            # Determine payment status (80% on time, 15% late, 5% failed)
            rand = random.random()
            if rand < 0.80:
                status = 'paid_on_time'
                paid_date = due_date - timedelta(days=random.randint(0, 2))
                days_late = 0
            elif rand < 0.95:
                status = 'paid_late'
                days_late = random.randint(1, 15)
                paid_date = due_date + timedelta(days=days_late)
            else:
                status = 'failed'
                paid_date = None
                days_late = random.randint(15, 45)
            
            description = f"{provider} - {tx_type.title()} Payment"
            
            transactions_data.append((
                user_id, tx_type, amount, status, 
                due_date.strftime('%Y-%m-%d'),
                paid_date.strftime('%Y-%m-%d') if paid_date else None,
                days_late, provider, description
            ))
    
    cursor.executemany('''
        INSERT OR IGNORE INTO transactions 
        (user_id, transaction_type, amount, status, due_date, paid_date, days_late, provider, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', transactions_data)
    
    conn.commit()
    conn.close()
    print("Seed data with realistic transactions created successfully!")

if __name__ == "__main__":
    create_seed_data()
