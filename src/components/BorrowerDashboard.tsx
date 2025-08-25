import React, { useState, useEffect, useCallback } from 'react';
import TransactionHistory from './TransactionHistory';
import { 
  User, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  IndianRupee,
  Calendar,
  Phone,
  MapPin,
  Target,
  Lightbulb,
  Mail
} from 'lucide-react';
import { apiService, CreditScore as ApiCreditScore } from '../services/api';

interface BorrowerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  monthlyIncome: number;
  existingDebt: number;
  loanPurpose: string;
  requestedAmount: number;
}

interface BorrowerDashboardProps {
  borrowerData: BorrowerData;
  onLogout: () => void;
}

const BorrowerDashboard: React.FC<BorrowerDashboardProps> = ({ borrowerData, onLogout }) => {
  const [creditScore, setCreditScore] = useState<ApiCreditScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<BorrowerData>(borrowerData);

  useEffect(() => {
    const fetchCreditScore = async () => {
      try {
        // Try to get transaction-based score first
        const transactionScore = await apiService.getUserScore(parseInt(borrowerData.id));
        if (transactionScore && transactionScore.score) {
          const recommendedAmount = Math.min(editedData.requestedAmount, 100000);
          const interestRate = transactionScore.score >= 70 ? 18 : transactionScore.score >= 50 ? 22 : 26;
          const monthlyRate = interestRate / 100 / 12;
          const tenure = 24; // 2 years
          const emiAmount = (recommendedAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
          
          setCreditScore({
            score: transactionScore.score,
            grade: transactionScore.grade,
            eligibility: transactionScore.eligibility,
            max_loan_amount: 125000,
            recommended_amount: recommendedAmount,
            interest_rate: interestRate,
            emi_amount: Math.round(emiAmount),
            emi_to_income_ratio: Math.round((emiAmount / editedData.monthlyIncome) * 100 * 10) / 10,
            rbi_compliant: true,
            factors: {
              income: 80,
              debt: 90,
              purpose: 100,
              amount: 80
            }
          });
        } else {
          throw new Error('No transaction-based score available');
        }
      } catch (err) {
        // Fallback to profile-based calculation
        const mockScore = calculateCreditScore();
        setCreditScore(mockScore);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditScore();
  }, [borrowerData.id, editedData.requestedAmount, editedData.monthlyIncome]);

  // Recalculate credit score when edited data changes
  const calculateAndSetScore = useCallback(() => {
    if (!loading) {
      const updatedScore = calculateCreditScore(editedData);
      setCreditScore(updatedScore);
    }
  }, [editedData, loading]);

  useEffect(() => {
    calculateAndSetScore();
  }, [calculateAndSetScore]);

  // Fallback credit score calculation
  const calculateCreditScore = (data: BorrowerData = editedData): ApiCreditScore => {
    const { monthlyIncome, existingDebt, loanPurpose, requestedAmount } = data;
    
    let score = 50;
    
    // Income factor (0-30 points)
    if (monthlyIncome >= 50000) score += 30;
    else if (monthlyIncome >= 25000) score += 20;
    else if (monthlyIncome >= 15000) score += 15;
    else if (monthlyIncome >= 10000) score += 10;
    else score += 5;
    
    // Debt factor (0-25 points)
    const debtToIncomeRatio = (existingDebt / monthlyIncome) * 100;
    if (debtToIncomeRatio <= 20) score += 25;
    else if (debtToIncomeRatio <= 40) score += 15;
    else if (debtToIncomeRatio <= 60) score += 10;
    else score += 5;
    
    // Purpose factor (0-15 points)
    const purposeScores: { [key: string]: number } = {
      business: 15,
      agriculture: 12,
      education: 10,
      medical: 8,
      personal: 5
    };
    score += purposeScores[loanPurpose] || 5;
    
    // Amount factor (0-10 points)
    if (requestedAmount <= 25000) score += 10;
    else if (requestedAmount <= 50000) score += 8;
    else if (requestedAmount <= 75000) score += 6;
    else if (requestedAmount <= 100000) score += 4;
    else score += 2;
    
    // Calculate other metrics
    const maxLoanAmount = Math.min(125000, monthlyIncome * 50);
    const recommendedAmount = Math.min(requestedAmount, maxLoanAmount * 0.8);
    const interestRate = score >= 70 ? 18 : score >= 50 ? 22 : 26;
    const emiAmount = (recommendedAmount * (interestRate/100/12) * Math.pow(1 + interestRate/100/12, 24)) / (Math.pow(1 + interestRate/100/12, 24) - 1);
    const emiToIncomeRatio = (emiAmount / monthlyIncome) * 100;
    
    let eligibility: 'approved' | 'review' | 'rejected' = 'rejected';
    let grade = 'Poor';
    
    if (score >= 70 && emiToIncomeRatio <= 50 && requestedAmount <= 125000) {
      eligibility = 'approved';
      grade = 'Excellent';
    } else if (score >= 50 && emiToIncomeRatio <= 60) {
      eligibility = 'review';
      grade = 'Good';
    }
    
    const rbiCompliant = requestedAmount <= 125000 && 
                        monthlyIncome >= 5000 && 
                        emiToIncomeRatio <= 50 && 
                        interestRate <= 26;

    return {
      score: Math.round(score),
      grade,
      eligibility,
      max_loan_amount: maxLoanAmount,
      recommended_amount: Math.round(recommendedAmount),
      interest_rate: interestRate,
      emi_amount: Math.round(emiAmount),
      emi_to_income_ratio: Math.round(emiToIncomeRatio * 10) / 10,
      rbi_compliant: rbiCompliant,
      factors: {
        income: Math.round((monthlyIncome >= 25000 ? 20 : 15) / 30 * 100),
        debt: Math.round((debtToIncomeRatio <= 40 ? 20 : 10) / 25 * 100),
        purpose: Math.round((purposeScores[loanPurpose] || 5) / 15 * 100),
        amount: Math.round((requestedAmount <= 50000 ? 8 : 4) / 10 * 100)
      }
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getEligibilityIcon = (eligibility: string) => {
    switch (eligibility) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'review': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getImprovementSuggestions = () => {
    if (!creditScore) return [];
    
    const suggestions = [];
    
    if (creditScore.factors.income < 70) {
      suggestions.push({
        icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
        title: "Increase Monthly Income",
        description: "Consider additional income sources or salary increment to improve loan eligibility",
        impact: "High"
      });
    }
    
    if (creditScore.factors.debt < 70) {
      suggestions.push({
        icon: <CreditCard className="h-5 w-5 text-purple-500" />,
        title: "Reduce Existing Debt",
        description: "Pay down current debts to improve debt-to-income ratio",
        impact: "High"
      });
    }
    
    if (borrowerData.requestedAmount > creditScore.recommended_amount) {
      suggestions.push({
        icon: <Target className="h-5 w-5 text-orange-500" />,
        title: "Consider Lower Loan Amount",
        description: `Requesting ₹${creditScore.recommended_amount.toLocaleString()} instead of ₹${borrowerData.requestedAmount.toLocaleString()} will improve approval chances`,
        impact: "Medium"
      });
    }
    
    if (creditScore.emi_to_income_ratio > 40) {
      suggestions.push({
        icon: <Calendar className="h-5 w-5 text-green-500" />,
        title: "Extend Loan Tenure",
        description: "Consider longer repayment period to reduce EMI burden",
        impact: "Medium"
      });
    }

    return suggestions;
  };

  const handleEditChange = (field: keyof BorrowerData, value: string | number) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    // In a real app, you would save to backend here
  };

  const handleCancelEdit = () => {
    setEditedData(borrowerData);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your credit profile...</p>
          {error && (
            <p className="text-red-600 text-sm mt-2">Using fallback calculation: {error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Welcome, {borrowerData.name}</h1>
                <p className="text-sm text-gray-500">Your Loan Dashboard</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Score */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              
              {!isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{editedData.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{editedData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{editedData.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <IndianRupee className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">₹{editedData.monthlyIncome.toLocaleString()}/month</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Existing Debt: ₹{editedData.existingDebt.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Purpose: {editedData.loanPurpose}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <IndianRupee className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Requested: ₹{editedData.requestedAmount.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (₹)</label>
                    <input
                      type="number"
                      value={editedData.monthlyIncome}
                      onChange={(e) => handleEditChange('monthlyIncome', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Existing Debt (₹)</label>
                    <input
                      type="number"
                      value={editedData.existingDebt}
                      onChange={(e) => handleEditChange('existingDebt', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loan Purpose</label>
                    <select
                      value={editedData.loanPurpose}
                      onChange={(e) => handleEditChange('loanPurpose', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="business">Business</option>
                      <option value="education">Education</option>
                      <option value="medical">Medical</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="personal">Personal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requested Amount (₹)</label>
                    <input
                      type="number"
                      value={editedData.requestedAmount}
                      onChange={(e) => handleEditChange('requestedAmount', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      max="125000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum: ₹1,25,000 (RBI Limit)</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveChanges}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Credit Score Card */}
            {creditScore && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Score</h3>
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getScoreColor(creditScore.score)}`}>
                    <span className="text-3xl font-bold mr-2">{creditScore.score}</span>
                    <span className="text-sm font-medium">{creditScore.grade}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Income Factor</span>
                    <span className="text-sm font-medium">{creditScore.factors.income}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${creditScore.factors.income}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Debt Factor</span>
                    <span className="text-sm font-medium">{creditScore.factors.debt}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${creditScore.factors.debt}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Purpose Factor</span>
                    <span className="text-sm font-medium">{creditScore.factors.purpose}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${creditScore.factors.purpose}%` }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Loan Details & Suggestions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Eligibility */}
            {creditScore && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Loan Eligibility</h3>
                  <div className="flex items-center space-x-2">
                    {getEligibilityIcon(creditScore.eligibility)}
                    <span className={`text-sm font-medium capitalize ${
                      creditScore.eligibility === 'approved' ? 'text-green-600' :
                      creditScore.eligibility === 'review' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {creditScore.eligibility}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Requested Amount</p>
                      <p className="text-2xl font-bold text-gray-900">₹{borrowerData.requestedAmount.toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Recommended Amount</p>
                      <p className="text-2xl font-bold text-blue-600">₹{creditScore.recommended_amount.toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Maximum Eligible</p>
                      <p className="text-lg font-semibold text-gray-700">₹{creditScore.max_loan_amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Interest Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{creditScore.interest_rate}% p.a.</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly EMI</p>
                      <p className="text-2xl font-bold text-green-600">₹{creditScore.emi_amount.toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">EMI-to-Income Ratio</p>
                      <p className={`text-lg font-semibold ${creditScore.emi_to_income_ratio <= 50 ? 'text-green-600' : 'text-red-600'}`}>
                        {creditScore.emi_to_income_ratio}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* RBI Compliance */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    {creditScore.rbi_compliant ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className={`font-medium ${creditScore.rbi_compliant ? 'text-green-600' : 'text-red-600'}`}>
                      {creditScore.rbi_compliant ? 'RBI Compliant' : 'RBI Non-Compliant'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {creditScore.rbi_compliant 
                      ? 'Your loan application meets all RBI microfinance guidelines.'
                      : 'Your application may need adjustments to meet RBI guidelines.'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Improvement Suggestions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900">Improvement Suggestions</h3>
              </div>
              
              <div className="space-y-4">
                {getImprovementSuggestions().map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {suggestion.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          suggestion.impact === 'High' ? 'bg-red-100 text-red-700' :
                          suggestion.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {suggestion.impact} Impact
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{suggestion.description}</p>
                    </div>
                  </div>
                ))}
                
                {getImprovementSuggestions().length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">Great! Your profile looks good. No immediate improvements needed.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="mt-8">
          <TransactionHistory 
            userId={parseInt(borrowerData.id)} 
            onScoreUpdate={(newScore) => {
              setCreditScore(prev => prev ? {...prev, score: newScore} : null);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BorrowerDashboard;
