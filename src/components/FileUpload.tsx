import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { RiskScore, DashboardStats, UserData } from '../types';
import { RealisticCreditEngine } from '../utils/realisticCreditEngine';

interface FileUploadProps {
  onFileProcessed: (scores: RiskScore[], stats: DashboardStats) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, isLoading, setIsLoading }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalErrorDetails, setModalErrorDetails] = useState({ title: '', message: '', missingColumns: [] as string[] });

  const validateCSVFormat = (headers: string[]): { isValid: boolean; missingColumns: string[] } => {
    const requiredColumns = [
      'user_id', 'monthly_income', 'income_type', 'income_stability_months',
      'emergency_savings', 'electricity_bill_on_time', 'dth_recharge_on_time', 
      'internet_bill_on_time', 'rent_payment_on_time', 'existing_loan_emi', 
      'previous_loan_defaults', 'upi_transactions_per_month', 'digital_wallet_usage',
      'online_bill_payments', 'monthly_expenses', 'savings_rate', 'age', 
      'employment_type', 'years_of_employment', 'city_tier'
    ];
    
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    return {
      isValid: missingColumns.length === 0,
      missingColumns
    };
  };

  const parseCSV = (csvText: string): UserData[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Validate CSV format
    const validation = validateCSVFormat(headers);
    if (!validation.isValid) {
      throw new Error(`Invalid CSV format. Missing columns: ${validation.missingColumns.join(', ')}`);
    }
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const userData: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        switch (header) {
          case 'user_id':
            userData.user_id = value;
            break;
          case 'monthly_income':
            userData.monthly_income = parseFloat(value) || 25000;
            break;
          case 'income_type':
            userData.income_type = value as 'salary' | 'business' | 'freelance' | 'daily_wage' || 'salary';
            break;
          case 'income_stability_months':
            userData.income_stability_months = parseInt(value) || 6;
            break;
          case 'emergency_savings':
            userData.emergency_savings = parseFloat(value) || 0;
            break;
          case 'electricity_bill_on_time':
            userData.electricity_bill_on_time = parseFloat(value.replace('%', '')) || 80;
            break;
          case 'dth_recharge_on_time':
            userData.dth_recharge_on_time = parseFloat(value.replace('%', '')) || 75;
            break;
          case 'internet_bill_on_time':
            userData.internet_bill_on_time = parseFloat(value.replace('%', '')) || 85;
            break;
          case 'rent_payment_on_time':
            userData.rent_payment_on_time = parseFloat(value.replace('%', '')) || 90;
            break;
          case 'existing_loan_emi':
            userData.existing_loan_emi = parseFloat(value) || 0;
            break;
          case 'credit_card_outstanding':
            userData.credit_card_outstanding = parseFloat(value) || 0;
            break;
          case 'previous_loan_defaults':
            userData.previous_loan_defaults = parseInt(value) || 0;
            break;
          case 'upi_transactions_per_month':
            userData.upi_transactions_per_month = parseInt(value) || 15;
            break;
          case 'digital_wallet_usage':
            userData.digital_wallet_usage = parseFloat(value) || 20;
            break;
          case 'online_bill_payments':
            userData.online_bill_payments = parseFloat(value.replace('%', '')) || 70;
            break;
          case 'monthly_expenses':
            userData.monthly_expenses = parseFloat(value) || (userData.monthly_income || 25000) * 0.6;
            break;
          case 'savings_rate':
            userData.savings_rate = parseFloat(value.replace('%', '')) || 15;
            break;
          case 'age':
            userData.age = parseInt(value) || 25;
            break;
          case 'employment_type':
            userData.employment_type = value as 'salaried' | 'self_employed' | 'student' | 'unemployed' || 'salaried';
            break;
          case 'years_of_employment':
            userData.years_of_employment = parseFloat(value) || 1;
            break;
          case 'city_tier':
            userData.city_tier = (parseInt(value) as 1 | 2 | 3) || 2;
            break;
        }
      });
      
      // Ensure all numeric fields have valid values (no NaN)
      const safeParseFloat = (val: any, defaultVal: number) => {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? defaultVal : parsed;
      };
      
      const safeParseInt = (val: any, defaultVal: number) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? defaultVal : parsed;
      };
      
      // Validate and set defaults for all numeric fields
      userData.monthly_income = safeParseFloat(userData.monthly_income, 25000);
      userData.monthly_expenses = safeParseFloat(userData.monthly_expenses, userData.monthly_income * 0.6);
      userData.emergency_savings = safeParseFloat(userData.emergency_savings, 0);
      userData.existing_loan_emi = safeParseFloat(userData.existing_loan_emi, 0);
      userData.credit_card_outstanding = safeParseFloat(userData.credit_card_outstanding, 0);
      userData.digital_wallet_usage = safeParseFloat(userData.digital_wallet_usage, 20);
      userData.years_of_employment = safeParseFloat(userData.years_of_employment, 1);
      
      userData.electricity_bill_on_time = safeParseFloat(userData.electricity_bill_on_time, 80);
      userData.dth_recharge_on_time = safeParseFloat(userData.dth_recharge_on_time, 75);
      userData.internet_bill_on_time = safeParseFloat(userData.internet_bill_on_time, 85);
      userData.rent_payment_on_time = safeParseFloat(userData.rent_payment_on_time, 90);
      userData.online_bill_payments = safeParseFloat(userData.online_bill_payments, 70);
      userData.savings_rate = safeParseFloat(userData.savings_rate, 15);
      
      userData.previous_loan_defaults = safeParseInt(userData.previous_loan_defaults, 0);
      userData.upi_transactions_per_month = safeParseInt(userData.upi_transactions_per_month, 15);
      userData.age = safeParseInt(userData.age, 25);
      userData.income_stability_months = safeParseInt(userData.income_stability_months, 6);
      userData.city_tier = safeParseInt(userData.city_tier, 2);
      
      // Set string defaults
      userData.income_type = userData.income_type || 'salary';
      userData.employment_type = userData.employment_type || 'salaried';
      
      // Set calculated defaults with validated numbers
      userData.overall_bill_payment_score = (
        userData.electricity_bill_on_time * 0.3 +
        userData.dth_recharge_on_time * 0.2 +
        userData.internet_bill_on_time * 0.2 +
        userData.rent_payment_on_time * 0.3
      );
      
      userData.loan_repayment_history_score = Math.max(0, 90 - (userData.previous_loan_defaults * 30));
      userData.digital_financial_activity_score = Math.min(100, 
        userData.upi_transactions_per_month * 2 + 
        userData.digital_wallet_usage * 1.5 + 
        userData.online_bill_payments * 0.5
      );
      
      userData.expense_categories = {
        essentials: userData.monthly_expenses * 0.7,
        discretionary: userData.monthly_expenses * 0.2,
        investments: userData.monthly_expenses * 0.1
      };
      
      return userData as UserData;
    });
  };

  const calculateRiskScore = (userData: UserData[]): { scores: RiskScore[], stats: DashboardStats } => {
    const scores: RiskScore[] = userData.map(user => {
      return RealisticCreditEngine.calculateCreditScore(user);
    });
    
    // Calculate dashboard stats
    const totalUsers = scores.length;
    const approvedUsers = scores.filter(s => s.decision === 'Approve').length;
    
    // Credit Score Distribution
    const scoreDistribution = {
      excellent: scores.filter(s => s.credit_score >= 750).length,
      good: scores.filter(s => s.credit_score >= 650 && s.credit_score < 750).length,
      fair: scores.filter(s => s.credit_score >= 550 && s.credit_score < 650).length,
      poor: scores.filter(s => s.credit_score >= 450 && s.credit_score < 550).length,
      very_poor: scores.filter(s => s.credit_score < 450).length
    };
    
    // Risk Metrics
    const avgCreditScore = scores.reduce((sum, s) => sum + s.credit_score, 0) / totalUsers;
    const avgDefaultProbability = scores.reduce((sum, s) => sum + s.default_probability, 0) / totalUsers;
    const totalLoanEligibility = scores.reduce((sum, s) => sum + s.max_eligible_amount, 0);
    
    // Behavioral Insights
    const avgDigitalAdoption = userData.reduce((sum, u) => sum + u.digital_financial_activity_score, 0) / totalUsers;
    const avgSavingsRate = userData.reduce((sum, u) => sum + u.savings_rate, 0) / totalUsers;
    
    // Common improvement areas
    const improvementAreas = new Map<string, number>();
    scores.forEach(score => {
      score.improvement_suggestions.forEach(suggestion => {
        const area = suggestion.split(' ')[0]; // First word as category
        improvementAreas.set(area, (improvementAreas.get(area) || 0) + 1);
      });
    });
    
    const commonImprovementAreas = Array.from(improvementAreas.entries())
      .map(([area, count]) => ({area, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    // RBI Compliance Stats
    const compliantUsers = scores.filter(s => s.rbi_compliant).length;
    const violationCounts = new Map<string, number>();
    scores.forEach(score => {
      score.rbi_violations.forEach(violation => {
        violationCounts.set(violation, (violationCounts.get(violation) || 0) + 1);
      });
    });
    
    const commonViolations = Array.from(violationCounts.entries())
      .map(([violation, count]) => ({violation, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    const stats: DashboardStats = {
      total_users: totalUsers,
      approval_rate: (approvedUsers / totalUsers) * 100,
      score_distribution: scoreDistribution,
      excellent_credit_count: scoreDistribution.excellent,
      good_credit_count: scoreDistribution.good,
      fair_credit_count: scoreDistribution.fair,
      poor_credit_count: scoreDistribution.poor,
      very_poor_credit_count: scoreDistribution.very_poor,
      avg_credit_score: Math.round(avgCreditScore),
      avg_default_probability: Math.round(avgDefaultProbability * 100) / 100,
      total_loan_eligibility: totalLoanEligibility,
      avg_digital_adoption: Math.round(avgDigitalAdoption),
      avg_savings_rate: Math.round(avgSavingsRate * 100) / 100,
      common_improvement_areas: commonImprovementAreas,
      rbi_compliance_rate: (compliantUsers / totalUsers) * 100,
      avg_eligible_loan_amount: totalLoanEligibility / totalUsers,
      common_violations: commonViolations
    };
    
    return { scores, stats };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const text = await file.text();
      const userData = parseCSV(text);
      
      // Simulate ML processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { scores, stats } = calculateRiskScore(userData);
      
      onFileProcessed(scores, stats);
      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Error processing file. Please check the format.';
      setErrorMessage(errorMsg);
      
      // Show stylish modal for format errors
      if (errorMsg.includes('Invalid CSV format')) {
        const missingCols = errorMsg.split('Missing columns: ')[1]?.split(', ') || [];
        setModalErrorDetails({
          title: 'Invalid CSV Format',
          message: 'Your uploaded file is missing required columns. Please check the format and try again.',
          missingColumns: missingCols
        });
        setShowErrorModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onFileProcessed, setIsLoading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    multiple: false
  });

  return (
    <div className="space-y-6">
      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{modalErrorDetails.title}</h3>
                    <p className="text-red-100 text-sm">Upload Failed</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="text-white hover:text-red-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">{modalErrorDetails.message}</p>
              
              {modalErrorDetails.missingColumns.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-red-800 mb-2">Missing Columns:</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {modalErrorDetails.missingColumns.map((col, index) => (
                      <div key={index} className="bg-red-100 px-3 py-1 rounded text-sm text-red-700 font-mono">
                        {col}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-800 text-sm font-medium">Tip:</p>
                    <p className="text-blue-700 text-sm">Check the "Expected CSV Format" section below to see all required columns.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`group relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-brand-500 bg-brand-50 shadow-soft scale-[1.02]'
            : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50 hover:shadow-soft'
        } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...getInputProps()} />
        
        {/* Background decoration */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-50/50 to-primary-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative flex flex-col items-center space-y-6">
          <div className={`p-4 rounded-2xl transition-all duration-300 ${
            isDragActive ? 'bg-brand-100 scale-110' : 'bg-slate-100 group-hover:bg-brand-100 group-hover:scale-105'
          }`}>
            <Upload className={`h-12 w-12 transition-colors duration-300 ${
              isDragActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-500'
            }`} />
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-brand-200 border-t-brand-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full border-3 border-brand-100 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-slate-700">Processing transaction data...</p>
                <p className="text-sm text-slate-500">Analyzing patterns and calculating risk scores</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className={`text-xl font-bold transition-colors duration-300 ${
                  isDragActive ? 'text-brand-700' : 'text-slate-800 group-hover:text-brand-600'
                }`}>
                  {isDragActive ? 'Drop your file here' : 'Upload Transaction Data'}
                </h3>
                <p className="text-slate-600 font-medium">
                  Drag & drop a CSV or JSON file, or click to browse
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200">
                    <h4 className="font-semibold text-slate-700 mb-2 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Core Financial Data
                    </h4>
                    <ul className="text-slate-600 space-y-1 text-xs">
                      <li>• user_id</li>
                      <li>• monthly_income</li>
                      <li>• income_type (salary/business/freelance)</li>
                      <li>• monthly_expenses</li>
                      <li>• emergency_savings</li>
                      <li>• existing_loan_emi</li>
                    </ul>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200">
                    <h4 className="font-semibold text-slate-700 mb-2 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Payment & Digital Behavior
                    </h4>
                    <ul className="text-slate-600 space-y-1 text-xs">
                      <li>• electricity_bill_on_time (%)</li>
                      <li>• rent_payment_on_time (%)</li>
                      <li>• upi_transactions_per_month</li>
                      <li>• digital_wallet_usage</li>
                      <li>• online_bill_payments (%)</li>
                      <li>• previous_loan_defaults</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <div className="animate-slideInUp bg-gradient-to-r from-success-50 to-success-100 border border-success-200 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-success-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-success-800">Processing Complete!</h4>
              <p className="text-success-700 text-sm">Risk scores have been calculated and are ready for review.</p>
            </div>
          </div>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="animate-slideInUp bg-gradient-to-r from-danger-50 to-danger-100 border border-danger-200 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-danger-500 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-danger-800">Upload Failed</h4>
              <p className="text-danger-700 text-sm">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sample Data Format */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 flex items-center">
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center mr-3">
              <FileText className="h-4 w-4 text-brand-600" />
            </div>
            Expected CSV Format
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Required Columns:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                  <span className="text-xs font-medium text-blue-700">user_id</span>
                </div>
                <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <span className="text-xs font-medium text-green-700">monthly_income</span>
                </div>
                <div className="bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                  <span className="text-xs font-medium text-purple-700">income_type</span>
                </div>
                <div className="bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200">
                  <span className="text-xs font-medium text-indigo-700">income_stability_months</span>
                </div>
                <div className="bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                  <span className="text-xs font-medium text-orange-700">emergency_savings</span>
                </div>
                <div className="bg-pink-50 px-3 py-2 rounded-lg border border-pink-200">
                  <span className="text-xs font-medium text-pink-700">electricity_bill_on_time</span>
                </div>
                <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <span className="text-xs font-medium text-slate-700">dth_recharge_on_time</span>
                </div>
                <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <span className="text-xs font-medium text-gray-700">internet_bill_on_time</span>
                </div>
                <div className="bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                  <span className="text-xs font-medium text-red-700">rent_payment_on_time</span>
                </div>
                <div className="bg-cyan-50 px-3 py-2 rounded-lg border border-cyan-200">
                  <span className="text-xs font-medium text-cyan-700">existing_loan_emi</span>
                </div>
                <div className="bg-red-100 px-3 py-2 rounded-lg border border-red-300">
                  <span className="text-xs font-medium text-red-800">previous_loan_defaults</span>
                </div>
                <div className="bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                  <span className="text-xs font-medium text-yellow-700">upi_transactions_per_month</span>
                </div>
                <div className="bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                  <span className="text-xs font-medium text-emerald-700">digital_wallet_usage</span>
                </div>
                <div className="bg-violet-50 px-3 py-2 rounded-lg border border-violet-200">
                  <span className="text-xs font-medium text-violet-700">online_bill_payments</span>
                </div>
                <div className="bg-rose-50 px-3 py-2 rounded-lg border border-rose-200">
                  <span className="text-xs font-medium text-rose-700">monthly_expenses</span>
                </div>
                <div className="bg-teal-50 px-3 py-2 rounded-lg border border-teal-200">
                  <span className="text-xs font-medium text-teal-700">savings_rate</span>
                </div>
                <div className="bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                  <span className="text-xs font-medium text-amber-700">age</span>
                </div>
                <div className="bg-stone-50 px-3 py-2 rounded-lg border border-stone-200">
                  <span className="text-xs font-medium text-stone-700">employment_type</span>
                </div>
                <div className="bg-lime-50 px-3 py-2 rounded-lg border border-lime-200">
                  <span className="text-xs font-medium text-lime-700">years_of_employment</span>
                </div>
                <div className="bg-sky-50 px-3 py-2 rounded-lg border border-sky-200">
                  <span className="text-xs font-medium text-sky-700">city_tier</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Sample Data:</h4>
              <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
                <div className="grid grid-cols-8 gap-2 text-xs min-w-max">
                  <div className="font-medium text-gray-600">U001</div>
                  <div className="font-medium text-gray-600">53682</div>
                  <div className="font-medium text-gray-600">salary</div>
                  <div className="font-medium text-gray-600">178698</div>
                  <div className="font-medium text-gray-600">79</div>
                  <div className="font-medium text-gray-600">79</div>
                  <div className="font-medium text-gray-600">10844</div>
                  <div className="font-medium text-gray-600">...</div>
                </div>
                <div className="grid grid-cols-8 gap-2 text-xs min-w-max mt-1">
                  <div className="font-medium text-gray-600">U003</div>
                  <div className="font-medium text-gray-600">62611</div>
                  <div className="font-medium text-gray-600">freelance</div>
                  <div className="font-medium text-gray-600">140890</div>
                  <div className="font-medium text-gray-600">77</div>
                  <div className="font-medium text-gray-600">55</div>
                  <div className="font-medium text-gray-600">14809</div>
                  <div className="font-medium text-gray-600">...</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-brand-50 to-primary-50 rounded-xl p-4 border border-brand-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-brand-800 mb-2">RBI Compliance Integration</h4>
                <p className="text-brand-700 text-sm leading-relaxed">
                  Our risk scoring engine incorporates Reserve Bank of India guidelines including:
                </p>
                <ul className="text-brand-700 text-sm mt-2 space-y-1">
                  <li>• <strong>Loan Limits:</strong> Maximum ₹1.25L for collateral-free loans</li>
                  <li>• <strong>EMI Ratios:</strong> EMI-to-income ratio capped at 50%</li>
                  <li>• <strong>Interest Rates:</strong> Annual rates not exceeding 26%</li>
                  <li>• <strong>Compliance Checks:</strong> Automated regulatory validation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
