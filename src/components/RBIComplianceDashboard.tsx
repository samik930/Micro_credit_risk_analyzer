import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, FileText } from 'lucide-react';
import { DashboardStats, RiskScore } from '../types';

interface RBIComplianceDashboardProps {
  stats: DashboardStats;
  scores: RiskScore[];
}

const RBIComplianceDashboard: React.FC<RBIComplianceDashboardProps> = ({ stats, scores }) => {
  const complianceRate = stats.rbi_compliance_rate;
  const avgLoanAmount = stats.avg_eligible_loan_amount;
  
  // Calculate additional metrics
  const highEMIRatioCount = scores.filter(s => s.emi_to_income_ratio > 50).length;
  const avgEMIRatio = scores.reduce((sum, s) => sum + s.emi_to_income_ratio, 0) / scores.length;
  
  const getComplianceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getComplianceIcon = (rate: number) => {
    if (rate >= 80) return <CheckCircle className="h-5 w-5" />;
    if (rate >= 60) return <AlertTriangle className="h-5 w-5" />;
    return <XCircle className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* RBI Compliance Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">RBI Compliance Dashboard</h2>
          </div>
          <div className={`px-3 py-1 rounded-full border ${getComplianceColor(complianceRate)}`}>
            <div className="flex items-center space-x-2">
              {getComplianceIcon(complianceRate)}
              <span className="text-sm font-medium">
                {complianceRate.toFixed(1)}% Compliant
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Applications</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total_users}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">RBI Compliant</p>
                <p className="text-2xl font-bold text-green-900">{scores.filter(s => s.rbi_compliant).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Loan Amount</p>
                <p className="text-2xl font-bold text-purple-900">₹{(avgLoanAmount/1000).toFixed(0)}K</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg EMI Ratio</p>
                <p className="text-2xl font-bold text-orange-900">{avgEMIRatio.toFixed(1)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* RBI Guidelines Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">RBI Microfinance Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Loan Limits</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Max loan: ₹1.25 Lakh</li>
              <li>• Max total debt: ₹1 Lakh</li>
              <li>• Min income: ₹5,000/month</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Interest & Tenure</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Max interest: 26% per annum</li>
              <li>• Min tenure: 24 months (&gt;₹15K)</li>
              <li>• EMI-to-income: ≤50%</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Lending Practices</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Collateral-free lending</li>
              <li>• Productive purposes preferred</li>
              <li>• Group lending encouraged</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Common Violations */}
      {stats.common_violations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Common RBI Violations</h3>
          <div className="space-y-3">
            {stats.common_violations.map((violation, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-800">{violation.violation}</span>
                </div>
                <div className="bg-red-100 px-2 py-1 rounded-full">
                  <span className="text-xs font-medium text-red-700">{violation.count} cases</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Distribution with RBI Context */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution & RBI Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-green-600">{stats.excellent_credit_count}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Excellent Credit</p>
            <p className="text-xs text-gray-500">RBI Compliant & Approved</p>
          </div>
          
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-yellow-600">{stats.good_credit_count}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Good Credit</p>
            <p className="text-xs text-gray-500">Needs Review</p>
          </div>
          
          <div className="text-center">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-red-600">{stats.poor_credit_count}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Poor Credit</p>
            <p className="text-xs text-gray-500">RBI Non-Compliant</p>
          </div>
        </div>
      </div>

      {/* EMI Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">EMI-to-Income Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Average EMI Ratio</span>
              <span className="text-sm font-bold text-gray-900">{avgEMIRatio.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${avgEMIRatio > 50 ? 'bg-red-500' : avgEMIRatio > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(avgEMIRatio, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">RBI Guideline: ≤50%</p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">High EMI Ratio Cases</span>
              <span className="text-sm font-bold text-red-600">{highEMIRatioCount}</span>
            </div>
            <div className="text-xs text-gray-500">
              {highEMIRatioCount > 0 ? 
                `${((highEMIRatioCount / stats.total_users) * 100).toFixed(1)}% of applications exceed 50% EMI ratio` :
                'All applications within RBI EMI guidelines'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RBIComplianceDashboard;
