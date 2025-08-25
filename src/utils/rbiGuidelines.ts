// RBI Guidelines for Micro Credit Lending
// Based on RBI Master Direction on Microfinance Institutions (NBFC-MFIs) Direction, 2011

export interface RBIComplianceCheck {
  isCompliant: boolean;
  violations: string[];
  riskAdjustment: number; // -20 to +10 points
}

export interface RBILoanLimits {
  maxLoanAmount: number;
  maxTotalIndebtedness: number;
  minIncomeThreshold: number;
}

export interface RBIBorrowerProfile {
  user_id: string;
  monthly_income: number;
  existing_loan_amount: number;
  household_income: number;
  rural_urban_classification: 'rural' | 'urban';
  purpose_of_loan: string;
  collateral_free: boolean;
}

export class RBIComplianceEngine {
  private static readonly LOAN_LIMITS: RBILoanLimits = {
    maxLoanAmount: 125000, // Rs. 1.25 lakh per borrower
    maxTotalIndebtedness: 100000, // Rs. 1 lakh total outstanding
    minIncomeThreshold: 5000 // Minimum monthly income
  };

  private static readonly INTEREST_RATE_CAP = 26; // 26% per annum
  private static readonly MIN_TENURE_MONTHS = 24; // Minimum 24 months for loans above Rs. 15,000

  /**
   * Check RBI compliance for a borrower
   */
  static checkCompliance(
    profile: RBIBorrowerProfile,
    requestedAmount: number,
    proposedRate: number,
    tenureMonths: number
  ): RBIComplianceCheck {
    const violations: string[] = [];
    let riskAdjustment = 0;

    // 1. Loan Amount Limit Check
    if (requestedAmount > this.LOAN_LIMITS.maxLoanAmount) {
      violations.push(`Loan amount exceeds RBI limit of Rs. ${this.LOAN_LIMITS.maxLoanAmount}`);
      riskAdjustment -= 15;
    }

    // 2. Total Indebtedness Check
    const totalDebt = profile.existing_loan_amount + requestedAmount;
    if (totalDebt > this.LOAN_LIMITS.maxTotalIndebtedness) {
      violations.push(`Total indebtedness exceeds RBI limit of Rs. ${this.LOAN_LIMITS.maxTotalIndebtedness}`);
      riskAdjustment -= 10;
    }

    // 3. Income Threshold Check
    if (profile.monthly_income < this.LOAN_LIMITS.minIncomeThreshold) {
      violations.push(`Monthly income below minimum threshold of Rs. ${this.LOAN_LIMITS.minIncomeThreshold}`);
      riskAdjustment -= 20;
    }

    // 4. Interest Rate Cap Check
    if (proposedRate > this.INTEREST_RATE_CAP) {
      violations.push(`Interest rate exceeds RBI cap of ${this.INTEREST_RATE_CAP}%`);
      riskAdjustment -= 5;
    }

    // 5. Minimum Tenure Check (for loans above Rs. 15,000)
    if (requestedAmount > 15000 && tenureMonths < this.MIN_TENURE_MONTHS) {
      violations.push(`Tenure below minimum ${this.MIN_TENURE_MONTHS} months for loans above Rs. 15,000`);
      riskAdjustment -= 5;
    }

    // 6. Income-to-EMI Ratio Check (EMI should not exceed 50% of monthly income)
    const monthlyEMI = this.calculateEMI(requestedAmount, proposedRate, tenureMonths);
    const emiToIncomeRatio = (monthlyEMI / profile.monthly_income) * 100;
    
    if (emiToIncomeRatio > 50) {
      violations.push(`EMI-to-income ratio (${emiToIncomeRatio.toFixed(1)}%) exceeds 50%`);
      riskAdjustment -= 10;
    } else if (emiToIncomeRatio < 30) {
      riskAdjustment += 5; // Bonus for conservative EMI ratio
    }

    // 7. Collateral-Free Lending Compliance
    if (!profile.collateral_free) {
      violations.push('RBI mandates collateral-free lending for microfinance');
      riskAdjustment -= 5;
    }

    // 8. Purpose of Loan Check (productive purposes preferred)
    const productivePurposes = ['business', 'agriculture', 'livestock', 'education', 'healthcare'];
    if (productivePurposes.includes(profile.purpose_of_loan.toLowerCase())) {
      riskAdjustment += 3;
    }

    return {
      isCompliant: violations.length === 0,
      violations,
      riskAdjustment: Math.max(-20, Math.min(10, riskAdjustment))
    };
  }

  /**
   * Calculate EMI using standard formula
   */
  private static calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
    const monthlyRate = annualRate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return emi;
  }

  /**
   * Get RBI-compliant loan recommendations
   */
  static getRecommendations(profile: RBIBorrowerProfile): {
    maxRecommendedAmount: number;
    recommendedTenure: number;
    maxInterestRate: number;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    // Calculate maximum loan amount based on income
    const maxByIncome = Math.min(
      profile.monthly_income * 0.5 * 24, // 50% of income for 24 months
      this.LOAN_LIMITS.maxLoanAmount
    );
    
    // Consider existing debt
    const maxByDebt = this.LOAN_LIMITS.maxTotalIndebtedness - profile.existing_loan_amount;
    
    const maxRecommendedAmount = Math.min(maxByIncome, maxByDebt);
    
    if (maxRecommendedAmount <= 0) {
      warnings.push('Borrower not eligible due to existing debt levels');
    }
    
    if (profile.monthly_income < this.LOAN_LIMITS.minIncomeThreshold) {
      warnings.push('Income below RBI minimum threshold');
    }

    return {
      maxRecommendedAmount: Math.max(0, maxRecommendedAmount),
      recommendedTenure: maxRecommendedAmount > 15000 ? 36 : 12,
      maxInterestRate: this.INTEREST_RATE_CAP,
      warnings
    };
  }

  /**
   * Generate RBI compliance report
   */
  static generateComplianceReport(
    profiles: RBIBorrowerProfile[],
    decisions: Array<{user_id: string; decision: string; amount: number}>
  ): {
    totalApplications: number;
    compliantApplications: number;
    complianceRate: number;
    commonViolations: Array<{violation: string; count: number}>;
    riskDistribution: {low: number; medium: number; high: number};
  } {
    const violationCounts = new Map<string, number>();
    let compliantCount = 0;
    
    profiles.forEach(profile => {
      const decision = decisions.find(d => d.user_id === profile.user_id);
      if (decision) {
        const compliance = this.checkCompliance(profile, decision.amount, 24, 24);
        if (compliance.isCompliant) compliantCount++;
        
        compliance.violations.forEach(violation => {
          violationCounts.set(violation, (violationCounts.get(violation) || 0) + 1);
        });
      }
    });

    const commonViolations = Array.from(violationCounts.entries())
      .map(([violation, count]) => ({violation, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalApplications: profiles.length,
      compliantApplications: compliantCount,
      complianceRate: (compliantCount / profiles.length) * 100,
      commonViolations,
      riskDistribution: {
        low: decisions.filter(d => d.decision === 'Approve').length,
        medium: decisions.filter(d => d.decision === 'Review').length,
        high: decisions.filter(d => d.decision === 'Reject').length
      }
    };
  }
}
