export interface UserData {
  user_id: string;
  // Income & Stability
  monthly_income: number;
  income_type: 'salary' | 'business' | 'freelance' | 'daily_wage';
  income_stability_months: number; // consistent income for X months
  emergency_savings: number;
  
  // Bill Payment History (realistic metrics)
  electricity_bill_on_time: number; // percentage
  dth_recharge_on_time: number;
  internet_bill_on_time: number;
  rent_payment_on_time: number;
  overall_bill_payment_score: number; // 0-100
  
  // Loan & Credit History
  existing_loan_emi: number;
  credit_card_outstanding: number;
  previous_loan_defaults: number;
  loan_repayment_history_score: number; // 0-100
  
  // Digital Financial Behavior
  upi_transactions_per_month: number;
  digital_wallet_usage: number; // frequency score
  online_bill_payments: number; // percentage of bills paid online
  digital_financial_activity_score: number; // 0-100
  
  // Spending & Savings Behavior
  monthly_expenses: number;
  savings_rate: number; // percentage of income saved
  expense_categories: {
    essentials: number; // food, utilities, rent
    discretionary: number; // entertainment, shopping
    investments: number;
  };
  
  // RBI Compliance fields
  existing_loan_amount?: number;
  household_income?: number;
  rural_urban_classification?: 'rural' | 'urban';
  purpose_of_loan?: string;
  requested_amount?: number;
  proposed_tenure_months?: number;
  
  // KYC Data
  age: number;
  employment_type: 'salaried' | 'self_employed' | 'student' | 'unemployed';
  years_of_employment: number;
  city_tier: 1 | 2 | 3;
}

export interface RiskScore {
  user_id: string;
  credit_score: number; // 300-900 scale like CIBIL
  risk_band: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';
  default_probability: number; // percentage chance of default
  decision: 'Approve' | 'Review' | 'Reject';
  
  // Detailed Scoring Breakdown
  score_components: {
    payment_history: { score: number; weight: number; }; // 40%
    credit_utilization: { score: number; weight: number; }; // 25%
    income_stability: { score: number; weight: number; }; // 20%
    digital_behavior: { score: number; weight: number; }; // 15%
  };
  
  // Loan Eligibility
  max_eligible_amount: number;
  recommended_emi: number;
  optimal_tenure_months: number;
  
  // Personalized Recommendations
  improvement_suggestions: string[];
  financial_coaching: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    impact: string;
  }[];
  
  // Comparison Metrics
  percentile_rank: number; // better than X% of borrowers
  peer_comparison: string;
  
  // RBI Compliance
  rbi_compliant: boolean;
  rbi_violations: string[];
  emi_to_income_ratio: number;
}

export interface DashboardStats {
  total_users: number;
  approval_rate: number;
  
  // Credit Score Distribution
  score_distribution: {
    excellent: number; // 750-900
    good: number; // 650-749
    fair: number; // 550-649
    poor: number; // 450-549
    very_poor: number; // 300-449
  };
  
  // Individual credit counts for backward compatibility
  excellent_credit_count: number;
  good_credit_count: number;
  fair_credit_count: number;
  poor_credit_count: number;
  very_poor_credit_count: number;
  
  // Risk Metrics
  avg_credit_score: number;
  avg_default_probability: number;
  total_loan_eligibility: number;
  
  // Behavioral Insights
  avg_digital_adoption: number;
  avg_savings_rate: number;
  common_improvement_areas: Array<{area: string; count: number}>;
  
  // RBI Compliance Stats
  rbi_compliance_rate: number;
  avg_eligible_loan_amount: number;
  common_violations: Array<{violation: string; count: number}>;
}

export interface FinancialProfile {
  // Core Financial Health Metrics
  debt_to_income_ratio: number;
  savings_to_income_ratio: number;
  expense_to_income_ratio: number;
  
  // Payment Behavior
  payment_consistency_score: number;
  bill_payment_reliability: number;
  loan_repayment_track_record: number;
  
  // Digital Financial Maturity
  digital_payment_adoption: number;
  financial_app_usage: number;
  online_banking_activity: number;
  
  // Risk Indicators
  income_volatility: number;
  emergency_fund_adequacy: number;
  credit_utilization_pattern: number;
}

export interface LoanEligibility {
  eligible: boolean;
  max_amount: number;
  recommended_amount: number;
  tenure_options: number[];
  interest_rate_range: { min: number; max: number; };
  emi_options: Array<{
    tenure: number;
    emi: number;
    total_interest: number;
    total_amount: number;
  }>;
}

export interface CreditReport {
  user_id: string;
  generated_date: string;
  credit_score: number;
  score_factors: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  account_summary: {
    total_accounts: number;
    active_loans: number;
    credit_cards: number;
    total_outstanding: number;
  };
  payment_history: {
    on_time_payments: number;
    late_payments: number;
    defaults: number;
  };
  recommendations: {
    immediate: string[];
    short_term: string[];
    long_term: string[];
  };
}
