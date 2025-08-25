import { UserData, RiskScore, FinancialProfile, LoanEligibility, CreditReport } from '../types';

export class RealisticCreditEngine {
  
  // Credit Score Calculation (300-900 scale like CIBIL)
  static calculateCreditScore(userData: UserData): RiskScore {
    const profile = this.buildFinancialProfile(userData);
    
    // Component Scores (0-100 each)
    const paymentHistoryScore = this.calculatePaymentHistoryScore(userData);
    const creditUtilizationScore = this.calculateCreditUtilizationScore(userData);
    const incomeStabilityScore = this.calculateIncomeStabilityScore(userData);
    const digitalBehaviorScore = this.calculateDigitalBehaviorScore(userData);
    
    // Weighted Score Calculation
    const weightedScore = 
      (paymentHistoryScore * 0.40) +
      (creditUtilizationScore * 0.25) +
      (incomeStabilityScore * 0.20) +
      (digitalBehaviorScore * 0.15);
    
    // Convert to 300-900 scale
    const creditScore = Math.round(300 + (weightedScore * 6));
    
    // Determine Risk Band
    const riskBand = this.getRiskBand(creditScore);
    
    // Calculate Default Probability
    const defaultProbability = this.calculateDefaultProbability(creditScore, userData);
    
    // Loan Eligibility
    const loanEligibility = this.calculateLoanEligibility(userData, creditScore);
    
    // Generate Recommendations
    const recommendations = this.generateRecommendations(userData, profile);
    
    // Peer Comparison
    const percentileRank = this.calculatePercentileRank(creditScore);
    const peerComparison = this.generatePeerComparison(percentileRank, userData);
    
    return {
      user_id: userData.user_id,
      credit_score: creditScore,
      risk_band: riskBand,
      default_probability: defaultProbability,
      decision: this.makeDecision(creditScore, defaultProbability),
      
      score_components: {
        payment_history: { score: paymentHistoryScore, weight: 40 },
        credit_utilization: { score: creditUtilizationScore, weight: 25 },
        income_stability: { score: incomeStabilityScore, weight: 20 },
        digital_behavior: { score: digitalBehaviorScore, weight: 15 }
      },
      
      max_eligible_amount: loanEligibility.max_amount,
      recommended_emi: loanEligibility.emi_options[0]?.emi || 0,
      optimal_tenure_months: loanEligibility.tenure_options[0] || 12,
      
      improvement_suggestions: recommendations.immediate,
      financial_coaching: recommendations.coaching,
      
      percentile_rank: percentileRank,
      peer_comparison: peerComparison,
      
      rbi_compliant: this.checkRBICompliance(userData, loanEligibility.max_amount),
      rbi_violations: this.getRBIViolations(userData, loanEligibility.max_amount),
      emi_to_income_ratio: (loanEligibility.emi_options[0]?.emi || 0) / userData.monthly_income * 100
    };
  }
  
  // Payment History Score (40% weight)
  static calculatePaymentHistoryScore(userData: UserData): number {
    const billPaymentScore = (
      userData.electricity_bill_on_time * 0.3 +
      userData.dth_recharge_on_time * 0.2 +
      userData.internet_bill_on_time * 0.2 +
      userData.rent_payment_on_time * 0.3
    );
    
    const loanRepaymentScore = userData.loan_repayment_history_score;
    const defaultPenalty = userData.previous_loan_defaults * 20;
    
    return Math.max(0, Math.min(100, 
      (billPaymentScore * 0.6 + loanRepaymentScore * 0.4) - defaultPenalty
    ));
  }
  
  // Credit Utilization Score (25% weight)
  static calculateCreditUtilizationScore(userData: UserData): number {
    const debtToIncomeRatio = (userData.existing_loan_emi + userData.credit_card_outstanding * 0.05) / userData.monthly_income;
    const expenseToIncomeRatio = userData.monthly_expenses / userData.monthly_income;
    
    // Lower ratios = better score
    const utilizationScore = Math.max(0, 100 - (debtToIncomeRatio * 200));
    const spendingScore = Math.max(0, 100 - (expenseToIncomeRatio * 100));
    
    return (utilizationScore * 0.7 + spendingScore * 0.3);
  }
  
  // Income Stability Score (20% weight)
  static calculateIncomeStabilityScore(userData: UserData): number {
    const incomeTypeScore = {
      'salary': 90,
      'business': 70,
      'freelance': 60,
      'daily_wage': 40
    }[userData.income_type];
    
    const stabilityBonus = Math.min(20, userData.income_stability_months * 2);
    const employmentScore = Math.min(30, userData.years_of_employment * 5);
    const savingsScore = Math.min(25, userData.savings_rate * 2.5);
    
    return Math.min(100, incomeTypeScore + stabilityBonus + employmentScore + savingsScore);
  }
  
  // Digital Behavior Score (15% weight)
  static calculateDigitalBehaviorScore(userData: UserData): number {
    const upiScore = Math.min(30, userData.upi_transactions_per_month * 2);
    const walletScore = Math.min(25, userData.digital_wallet_usage * 2.5);
    const onlineBillScore = userData.online_bill_payments * 0.3;
    const digitalActivityScore = userData.digital_financial_activity_score * 0.15;
    
    return upiScore + walletScore + onlineBillScore + digitalActivityScore;
  }
  
  // Risk Band Classification
  static getRiskBand(creditScore: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor' {
    if (creditScore >= 750) return 'Excellent';
    if (creditScore >= 650) return 'Good';
    if (creditScore >= 550) return 'Fair';
    if (creditScore >= 450) return 'Poor';
    return 'Very Poor';
  }
  
  // Default Probability Calculation
  static calculateDefaultProbability(creditScore: number, userData: UserData): number {
    let baseProbability = Math.max(1, 50 - ((creditScore - 300) / 12));
    
    // Adjust based on specific risk factors
    if (userData.previous_loan_defaults > 0) baseProbability += userData.previous_loan_defaults * 15;
    if (userData.existing_loan_emi / userData.monthly_income > 0.5) baseProbability += 10;
    if (userData.emergency_savings < userData.monthly_expenses) baseProbability += 8;
    
    return Math.min(95, Math.max(1, Math.round(baseProbability)));
  }
  
  // Loan Eligibility Calculation
  static calculateLoanEligibility(userData: UserData, creditScore: number): LoanEligibility {
    const maxEMICapacity = userData.monthly_income * 0.4 - userData.existing_loan_emi;
    const baseAmount = Math.min(125000, userData.monthly_income * 10); // RBI limit
    
    // Adjust based on credit score
    const scoreMultiplier = creditScore >= 750 ? 1.0 : 
                           creditScore >= 650 ? 0.8 : 
                           creditScore >= 550 ? 0.6 : 0.4;
    
    const maxAmount = Math.round(baseAmount * scoreMultiplier);
    const recommendedAmount = Math.round(maxAmount * 0.7);
    
    const tenureOptions = [12, 18, 24, 36];
    const interestRate = this.getInterestRate(creditScore);
    
    const emiOptions = tenureOptions.map(tenure => {
      const monthlyRate = interestRate / 100 / 12;
      const emi = Math.round((recommendedAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                            (Math.pow(1 + monthlyRate, tenure) - 1));
      const totalAmount = emi * tenure;
      const totalInterest = totalAmount - recommendedAmount;
      
      return { tenure, emi, total_interest: totalInterest, total_amount: totalAmount };
    }).filter(option => option.emi <= maxEMICapacity);
    
    return {
      eligible: maxAmount > 10000 && emiOptions.length > 0,
      max_amount: maxAmount,
      recommended_amount: recommendedAmount,
      tenure_options: tenureOptions,
      interest_rate_range: { min: interestRate, max: interestRate + 2 },
      emi_options: emiOptions
    };
  }
  
  // Interest Rate Based on Credit Score
  static getInterestRate(creditScore: number): number {
    if (creditScore >= 750) return 18;
    if (creditScore >= 650) return 22;
    if (creditScore >= 550) return 24;
    return 26; // RBI cap
  }
  
  // Generate Personalized Recommendations
  static generateRecommendations(userData: UserData, profile: FinancialProfile) {
    const immediate: string[] = [];
    const coaching: Array<{priority: 'high' | 'medium' | 'low'; action: string; impact: string}> = [];
    
    // Payment History Improvements
    if (userData.overall_bill_payment_score < 80) {
      immediate.push("Set up auto-pay for all utility bills to improve payment consistency");
      coaching.push({
        priority: 'high',
        action: "Enable auto-debit for electricity, DTH, and internet bills",
        impact: "Can improve credit score by 30-50 points in 3 months"
      });
    }
    
    // EMI Management
    const emiRatio = userData.existing_loan_emi / userData.monthly_income;
    if (emiRatio > 0.4) {
      immediate.push(`Your EMI-to-income ratio is ${Math.round(emiRatio * 100)}% (too high). Reduce EMIs below 40% to improve score`);
      coaching.push({
        priority: 'high',
        action: "Consider loan restructuring or prepayment to reduce EMI burden",
        impact: "Reducing EMI ratio to 30% can improve eligibility by ₹25,000"
      });
    }
    
    // Digital Behavior
    if (userData.upi_transactions_per_month < 20) {
      immediate.push("Increase UPI transactions to build stronger digital payment history");
      coaching.push({
        priority: 'medium',
        action: "Use UPI for daily transactions like groceries, fuel, and small purchases",
        impact: "Higher digital activity can boost score by 15-25 points"
      });
    }
    
    // Emergency Savings
    if (userData.emergency_savings < userData.monthly_expenses * 3) {
      immediate.push(`Build emergency fund to ₹${userData.monthly_expenses * 3} (3 months expenses)`);
      coaching.push({
        priority: 'medium',
        action: `Save ₹${Math.round((userData.monthly_expenses * 3 - userData.emergency_savings) / 6)} per month for 6 months`,
        impact: "Adequate emergency fund reduces default risk and improves loan terms"
      });
    }
    
    // Savings Rate
    if (userData.savings_rate < 20) {
      immediate.push("Increase savings rate to at least 20% of income for better financial health");
      coaching.push({
        priority: 'low',
        action: "Track expenses and identify areas to cut discretionary spending",
        impact: "Higher savings rate demonstrates financial discipline"
      });
    }
    
    return { immediate, coaching };
  }
  
  // Build Financial Profile
  static buildFinancialProfile(userData: UserData): FinancialProfile {
    return {
      debt_to_income_ratio: (userData.existing_loan_emi * 12) / (userData.monthly_income * 12),
      savings_to_income_ratio: userData.savings_rate / 100,
      expense_to_income_ratio: userData.monthly_expenses / userData.monthly_income,
      
      payment_consistency_score: userData.overall_bill_payment_score,
      bill_payment_reliability: (userData.electricity_bill_on_time + userData.dth_recharge_on_time + 
                                userData.internet_bill_on_time + userData.rent_payment_on_time) / 4,
      loan_repayment_track_record: userData.loan_repayment_history_score,
      
      digital_payment_adoption: userData.digital_financial_activity_score,
      financial_app_usage: userData.digital_wallet_usage,
      online_banking_activity: userData.online_bill_payments,
      
      income_volatility: userData.income_type === 'salary' ? 10 : 
                        userData.income_type === 'business' ? 30 : 50,
      emergency_fund_adequacy: (userData.emergency_savings / userData.monthly_expenses) * 33.33,
      credit_utilization_pattern: (userData.credit_card_outstanding / userData.monthly_income) * 100
    };
  }
  
  // Calculate Percentile Rank
  static calculatePercentileRank(creditScore: number): number {
    // Simulated distribution based on Indian credit score patterns
    if (creditScore >= 800) return 95;
    if (creditScore >= 750) return 85;
    if (creditScore >= 700) return 70;
    if (creditScore >= 650) return 55;
    if (creditScore >= 600) return 40;
    if (creditScore >= 550) return 25;
    return 10;
  }
  
  // Generate Peer Comparison
  static generatePeerComparison(percentileRank: number, userData: UserData): string {
    const incomeGroup = userData.monthly_income >= 50000 ? 'high-income' :
                       userData.monthly_income >= 25000 ? 'middle-income' : 'entry-level';
    
    return `You are better than ${percentileRank}% of borrowers in the ${incomeGroup} category`;
  }
  
  // Decision Making
  static makeDecision(creditScore: number, defaultProbability: number): 'Approve' | 'Review' | 'Reject' {
    if (creditScore >= 650 && defaultProbability <= 20) return 'Approve';
    if (creditScore >= 550 && defaultProbability <= 35) return 'Review';
    return 'Reject';
  }
  
  // RBI Compliance Check
  static checkRBICompliance(userData: UserData, loanAmount: number): boolean {
    if (loanAmount > 125000) return false; // RBI limit
    if ((userData.existing_loan_emi / userData.monthly_income) > 0.5) return false; // EMI ratio
    return true;
  }
  
  // RBI Violations
  static getRBIViolations(userData: UserData, loanAmount: number): string[] {
    const violations: string[] = [];
    
    if (loanAmount > 125000) violations.push('Loan amount exceeds RBI limit of ₹1.25L');
    if ((userData.existing_loan_emi / userData.monthly_income) > 0.5) violations.push('EMI-to-income ratio exceeds 50%');
    
    return violations;
  }
}
