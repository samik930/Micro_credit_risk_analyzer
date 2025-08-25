const API_BASE_URL = 'http://localhost:8000/api';

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  address: string;
  date_of_birth: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  date_of_birth: string;
}

export interface LoanApplication {
  monthly_income: number;
  existing_debt: number;
  loan_purpose: string;
  requested_amount: number;
}

export interface CreditScore {
  score: number;
  grade: string;
  eligibility: string;
  max_loan_amount: number;
  recommended_amount: number;
  interest_rate: number;
  emi_amount: number;
  emi_to_income_ratio: number;
  rbi_compliant: boolean;
  monthly_income?: number;
  existing_debt?: number;
  loan_purpose?: string;
  requested_amount?: number;
  factors: {
    income: number;
    debt: number;
    purpose: number;
    amount: number;
  };
}

export interface AdminDashboard {
  total_users: number;
  approved_count: number;
  review_count: number;
  rejected_count: number;
  avg_score: number;
  rbi_compliance_rate: number;
  avg_eligible_loan_amount: number;
  excellent_credit_count: number;
  good_credit_count: number;
  poor_credit_count: number;
  common_violations: any[];
}

export interface UserWithScore {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  monthly_income: number;
  existing_debt: number;
  requested_amount: number;
  loan_purpose: string;
  risk_score: number;
  decision: string;
  eligible_loan_amount: number;
  emi_to_income_ratio: number;
  rbi_compliant: boolean;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<{ message: string; user: User }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterData): Promise<{ message: string; user_id: number }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Loan application endpoints
  async applyForLoan(application: LoanApplication, userId: number): Promise<{ application_id: number; credit_score: CreditScore }> {
    return this.request(`/loan/apply?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(application),
    });
  }

  async getCreditScore(userId: number): Promise<CreditScore> {
    return this.request(`/user/${userId}/credit-score`);
  }

  // Admin endpoints
  async getAdminDashboard(): Promise<AdminDashboard> {
    return this.request('/admin/dashboard');
  }

  async getAllUsersWithScores(): Promise<UserWithScore[]> {
    return this.request('/admin/users');
  }

  // Add new transaction
  async addTransaction(userId: number, transaction: any): Promise<any> {
    const response = await fetch(`http://localhost:8000/add-transaction/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      throw new Error('Failed to add transaction');
    }

    return response.json();
  }

  async clearTransactions(userId: number): Promise<any> {
    const response = await fetch(`http://localhost:8000/clear-transactions/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to clear transactions');
    }

    return response.json();
  }

  // Get user transactions
  async getUserTransactions(userId: number, limit: number = 20) {
    try {
      const response = await fetch(`http://localhost:8000/transactions/${userId}?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Return mock data as fallback
      return {
        transactions: [
          {
            type: 'electricity',
            amount: 2500,
            status: 'paid_on_time',
            provider: 'BSES',
            description: 'Electricity Bill',
            date: new Date().toISOString(),
            days_late: 0
          }
        ]
      };
    }
  }

  // Get score history
  async getScoreHistory(userId: number, limit: number = 10) {
    try {
      const response = await fetch(`http://localhost:8000/score-history/${userId}?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch score history');
      return await response.json();
    } catch (error) {
      console.error('Error fetching score history:', error);
      // Return mock data as fallback
      return {
        score_history: []
      };
    }
  }

  // Get user credit score with dynamic scoring
  async getUserScore(userId: number) {
    try {
      const response = await fetch(`http://localhost:8000/user-score/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user score');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user score:', error);
      // Return mock data as fallback
      return {
        score: 72,
        grade: 'B+',
        eligibility: 'approved',
        factors: [
          { category: 'Payment History', impact: 15, details: 'Good payment track record' },
          { category: 'Income Stability', impact: 8, details: 'Regular salary credits' }
        ]
      };
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL.replace('/api', '')}/docs`);
      return true;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
