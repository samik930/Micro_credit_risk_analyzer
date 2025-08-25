import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import json

class DynamicRiskScorer:
    """Dynamic credit risk scoring based on realistic transaction patterns"""
    
    def __init__(self, db_path: str = 'credit_risk.db'):
        self.db_path = db_path
        
    def calculate_user_score(self, user_id: int) -> Dict:
        """Calculate comprehensive risk score based on transaction history"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get user's transaction history
        cursor.execute('''
            SELECT transaction_type, amount, status, days_late, created_at, provider
            FROM transactions 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ''', (user_id,))
        
        transactions = cursor.fetchall()
        conn.close()
        
        if not transactions:
            return self._default_score()
        
        # Calculate individual scoring factors
        payment_reliability = self._calculate_payment_reliability(transactions)
        bill_payment_score = self._calculate_bill_payment_score(transactions)
        income_stability = self._calculate_income_stability(transactions)
        debt_behavior = self._calculate_debt_behavior(transactions)
        transaction_frequency = self._calculate_transaction_frequency(transactions)
        
        # Weighted scoring algorithm
        base_score = 50
        score_components = {
            'payment_reliability': payment_reliability * 0.35,  # 35% weight
            'bill_payments': bill_payment_score * 0.25,        # 25% weight
            'income_stability': income_stability * 0.20,       # 20% weight
            'debt_behavior': debt_behavior * 0.15,             # 15% weight
            'transaction_frequency': transaction_frequency * 0.05  # 5% weight
        }
        
        final_score = base_score + sum(score_components.values())
        final_score = max(0, min(100, int(final_score)))  # Clamp between 0-100
        
        # Determine grade and eligibility
        grade, eligibility = self._determine_grade_eligibility(final_score)
        
        return {
            'score': final_score,
            'grade': grade,
            'eligibility': eligibility,
            'components': score_components,
            'factors': self._generate_score_factors(transactions, score_components)
        }
    
    def _calculate_payment_reliability(self, transactions: List[Tuple]) -> float:
        """Calculate payment reliability score (-25 to +25 points)"""
        payment_txns = [tx for tx in transactions if tx[0] in ['electricity', 'mobile', 'bnpl', 'paylater']]
        
        if not payment_txns:
            return 0
        
        on_time = sum(1 for tx in payment_txns if tx[2] == 'paid_on_time')
        late = sum(1 for tx in payment_txns if tx[2] == 'paid_late')
        failed = sum(1 for tx in payment_txns if tx[2] == 'failed')
        
        total = len(payment_txns)
        on_time_ratio = on_time / total
        late_penalty = (late * 0.5 + failed * 1.0) / total
        
        # Score: +25 for 100% on-time, -25 for all failed
        score = (on_time_ratio * 25) - (late_penalty * 25)
        return max(-25, min(25, score))
    
    def _calculate_bill_payment_score(self, transactions: List[Tuple]) -> float:
        """Calculate utility bill payment behavior (-15 to +15 points)"""
        bill_txns = [tx for tx in transactions if tx[0] in ['electricity', 'mobile']]
        
        if not bill_txns:
            return 0
        
        # Recent 3 months behavior weighted more
        recent_date = datetime.now() - timedelta(days=90)
        recent_bills = [tx for tx in bill_txns if datetime.strptime(tx[4], '%Y-%m-%d %H:%M:%S') > recent_date]
        
        if recent_bills:
            recent_on_time = sum(1 for tx in recent_bills if tx[2] == 'paid_on_time')
            recent_ratio = recent_on_time / len(recent_bills)
            return (recent_ratio * 15) - ((1 - recent_ratio) * 10)
        
        return 0
    
    def _calculate_income_stability(self, transactions: List[Tuple]) -> float:
        """Calculate income stability score (-10 to +10 points)"""
        salary_txns = [tx for tx in transactions if tx[0] == 'salary']
        
        if len(salary_txns) < 3:
            return -5  # Insufficient salary history
        
        # Check regularity and amount consistency
        amounts = [tx[1] for tx in salary_txns[-6:]]  # Last 6 salary entries
        
        if len(amounts) >= 3:
            avg_amount = sum(amounts) / len(amounts)
            variance = sum((x - avg_amount) ** 2 for x in amounts) / len(amounts)
            stability_score = max(0, 10 - (variance / avg_amount * 100))
            
            # Bonus for regular monthly salary
            if len(amounts) >= 6:
                stability_score += 2
            
            return min(10, stability_score)
        
        return 0
    
    def _calculate_debt_behavior(self, transactions: List[Tuple]) -> float:
        """Calculate BNPL/PayLater usage behavior (-15 to +5 points)"""
        debt_txns = [tx for tx in transactions if tx[0] in ['bnpl', 'paylater']]
        
        if not debt_txns:
            return 5  # No debt usage is good
        
        # Analyze debt usage patterns
        total_debt_amount = sum(tx[1] for tx in debt_txns)
        failed_debt = sum(1 for tx in debt_txns if tx[2] == 'failed')
        late_debt = sum(1 for tx in debt_txns if tx[2] == 'paid_late')
        
        # Penalty for high debt usage and poor repayment
        debt_penalty = min(15, (total_debt_amount / 50000) * 10)  # Scale based on amount
        repayment_penalty = (failed_debt * 3) + (late_debt * 1.5)
        
        return max(-15, 5 - debt_penalty - repayment_penalty)
    
    def _calculate_transaction_frequency(self, transactions: List[Tuple]) -> float:
        """Calculate transaction frequency score (0 to +5 points)"""
        recent_date = datetime.now() - timedelta(days=30)
        recent_txns = [tx for tx in transactions if datetime.strptime(tx[4], '%Y-%m-%d %H:%M:%S') > recent_date]
        
        # Optimal frequency: 8-15 transactions per month
        freq_score = len(recent_txns)
        if 8 <= freq_score <= 15:
            return 5
        elif freq_score < 8:
            return max(0, freq_score * 0.6)
        else:
            return max(0, 5 - (freq_score - 15) * 0.2)
    
    def _determine_grade_eligibility(self, score: int) -> Tuple[str, str]:
        """Determine credit grade and loan eligibility"""
        if score >= 80:
            return 'A+', 'approved'
        elif score >= 70:
            return 'A', 'approved'
        elif score >= 60:
            return 'B+', 'approved'
        elif score >= 50:
            return 'B', 'review'
        elif score >= 40:
            return 'C+', 'review'
        elif score >= 30:
            return 'C', 'review'
        else:
            return 'D', 'rejected'
    
    def _generate_score_factors(self, transactions: List[Tuple], components: Dict) -> List[Dict]:
        """Generate detailed factors affecting the score"""
        factors = []
        
        # Payment reliability factors
        payment_txns = [tx for tx in transactions if tx[0] in ['electricity', 'mobile', 'bnpl', 'paylater']]
        if payment_txns:
            on_time_count = sum(1 for tx in payment_txns if tx[2] == 'paid_on_time')
            late_count = sum(1 for tx in payment_txns if tx[2] == 'paid_late')
            failed_count = sum(1 for tx in payment_txns if tx[2] == 'failed')
            
            factors.append({
                'category': 'Payment Reliability',
                'impact': components['payment_reliability'],
                'details': f"{on_time_count} on-time, {late_count} late, {failed_count} failed payments"
            })
        
        # Bill payment factors
        bill_txns = [tx for tx in transactions if tx[0] in ['electricity', 'mobile']]
        if bill_txns:
            factors.append({
                'category': 'Utility Bills',
                'impact': components['bill_payments'],
                'details': f"{len(bill_txns)} utility payments tracked"
            })
        
        # Income stability
        salary_txns = [tx for tx in transactions if tx[0] == 'salary']
        if salary_txns:
            factors.append({
                'category': 'Income Stability',
                'impact': components['income_stability'],
                'details': f"{len(salary_txns)} salary entries, regular income pattern"
            })
        
        return factors
    
    def _default_score(self) -> Dict:
        """Default score for users with no transaction history"""
        return {
            'score': 50,
            'grade': 'B',
            'eligibility': 'review',
            'components': {},
            'factors': [{'category': 'No History', 'impact': 0, 'details': 'No transaction data available'}]
        }
    
    def add_transaction_and_update_score(self, user_id: int, transaction_data: Dict) -> Dict:
        """Add new transaction and recalculate score with change tracking"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get current score
        current_score_data = self.calculate_user_score(user_id)
        old_score = current_score_data['score']
        
        # Add new transaction
        cursor.execute('''
            INSERT INTO transactions 
            (user_id, transaction_type, amount, status, due_date, paid_date, days_late, provider, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            transaction_data['transaction_type'],
            transaction_data['amount'],
            transaction_data['status'],
            transaction_data.get('due_date'),
            transaction_data.get('paid_date'),
            transaction_data.get('days_late', 0),
            transaction_data.get('provider', ''),
            transaction_data.get('description', '')
        ))
        
        transaction_id = cursor.lastrowid
        
        # Recalculate score
        new_score_data = self.calculate_user_score(user_id)
        new_score = new_score_data['score']
        
        # Track score change
        score_change = new_score - old_score
        change_reason = self._generate_change_reason(transaction_data, score_change)
        
        cursor.execute('''
            INSERT INTO score_history (user_id, old_score, new_score, change_reason, transaction_id)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, old_score, new_score, change_reason, transaction_id))
        
        conn.commit()
        conn.close()
        
        return {
            **new_score_data,
            'score_change': score_change,
            'change_reason': change_reason,
            'transaction_id': transaction_id
        }
    
    def _generate_change_reason(self, transaction_data: Dict, score_change: int) -> str:
        """Generate human-readable reason for score change"""
        tx_type = transaction_data['transaction_type']
        status = transaction_data['status']
        amount = transaction_data['amount']
        
        if score_change > 0:
            if status == 'paid_on_time':
                return f"✅ {tx_type.title()} bill (₹{amount}) paid on time → +{score_change} points"
            else:
                return f"📈 {tx_type.title()} transaction added → +{score_change} points"
        elif score_change < 0:
            if status == 'paid_late':
                days_late = transaction_data.get('days_late', 0)
                return f"⚠️ {tx_type.title()} bill (₹{amount}) paid {days_late} days late → {score_change} points"
            elif status == 'failed':
                return f"❌ {tx_type.title()} payment (₹{amount}) failed → {score_change} points"
            else:
                return f"📉 {tx_type.title()} transaction impact → {score_change} points"
        else:
            return f"➡️ {tx_type.title()} transaction added (no score impact)"

    def get_score_history(self, user_id: int, limit: int = 10) -> List[Dict]:
        """Get user's score change history"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT old_score, new_score, change_reason, created_at
            FROM score_history 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        ''', (user_id, limit))
        
        history = cursor.fetchall()
        conn.close()
        
        return [
            {
                'old_score': row[0],
                'new_score': row[1],
                'change_reason': row[2],
                'date': row[3]
            }
            for row in history
        ]
