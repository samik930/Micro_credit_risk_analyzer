import React from 'react';
import { RiskScore } from '../types';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Calendar, Target, Award } from 'lucide-react';

interface CreditReportDashboardProps {
  riskScore: RiskScore;
}

const CreditReportDashboard: React.FC<CreditReportDashboardProps> = ({ riskScore }) => {
  
  // Credit Score Gauge Component
  const CreditScoreGauge = ({ score }: { score: number }) => {
    const percentage = ((score - 300) / 600) * 100;
    const rotation = (percentage / 100) * 180 - 90;
    
    const getScoreColor = (score: number) => {
      if (score >= 750) return 'text-success-600';
      if (score >= 650) return 'text-primary-600';
      if (score >= 550) return 'text-warning-600';
      return 'text-danger-600';
    };
    
    const getScoreBackground = (score: number) => {
      if (score >= 750) return 'from-success-500 to-success-600';
      if (score >= 650) return 'from-primary-500 to-primary-600';
      if (score >= 550) return 'from-warning-500 to-warning-600';
      return 'from-danger-500 to-danger-600';
    };
    
    return (
      <div className="relative w-64 h-32 mx-auto">
        {/* Gauge Background */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.51} 251`}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="30%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          
          {/* Needle */}
          <line
            x1="100"
            y1="80"
            x2="100"
            y2="30"
            stroke="#1e293b"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${rotation} 100 80)`}
            className="transition-transform duration-1000 ease-out"
          />
          <circle cx="100" cy="80" r="4" fill="#1e293b" />
        </svg>
        
        {/* Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
          <div className="text-sm text-slate-600 font-medium">
            {riskScore.risk_band}
          </div>
        </div>
        
        {/* Scale Labels */}
        <div className="absolute bottom-0 left-0 text-xs text-slate-500">300</div>
        <div className="absolute bottom-0 right-0 text-xs text-slate-500">900</div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-slate-500">
          Excellent: 750+
        </div>
      </div>
    );
  };
  
  // Risk Probability Indicator
  const RiskIndicator = ({ probability }: { probability: number }) => {
    const getRiskColor = (prob: number) => {
      if (prob <= 10) return 'bg-success-500';
      if (prob <= 25) return 'bg-primary-500';
      if (prob <= 40) return 'bg-warning-500';
      return 'bg-danger-500';
    };
    
    return (
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Default Risk</h3>
          <AlertTriangle className="h-5 w-5 text-warning-500" />
        </div>
        <div className="text-center">
          <div className={`text-3xl font-bold text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3 ${getRiskColor(probability)}`}>
            {probability}%
          </div>
          <p className="text-slate-600 text-sm">
            Probability of default in next 12 months
          </p>
        </div>
      </div>
    );
  };
  
  // Score Components Breakdown
  const ScoreBreakdown = () => (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-200">
      <h3 className="font-bold text-slate-800 mb-6">Score Components</h3>
      <div className="space-y-4">
        {Object.entries(riskScore.score_components).map(([key, component]) => {
          const label = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          const percentage = (component.score / 100) * 100;
          
          return (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-slate-800">{Math.round(component.score)}/100</span>
                  <span className="text-xs text-slate-500">({component.weight}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                    component.score >= 80 ? 'bg-success-500' :
                    component.score >= 60 ? 'bg-primary-500' :
                    component.score >= 40 ? 'bg-warning-500' : 'bg-danger-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  
  // Loan Eligibility Card
  const LoanEligibilityCard = () => (
    <div className="bg-gradient-to-br from-brand-50 to-primary-50 rounded-2xl p-6 border border-brand-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800">Loan Eligibility</h3>
        <DollarSign className="h-5 w-5 text-brand-600" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-brand-600">
            ₹{(riskScore.max_eligible_amount / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-slate-600">Max Amount</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            ₹{riskScore.recommended_emi.toLocaleString()}
          </div>
          <div className="text-xs text-slate-600">Monthly EMI</div>
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-2 text-sm">
        <Calendar className="h-4 w-4 text-slate-500" />
        <span className="text-slate-600">
          {riskScore.optimal_tenure_months} months tenure
        </span>
      </div>
    </div>
  );
  
  // Improvement Suggestions
  const ImprovementSuggestions = () => (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800">Improvement Plan</h3>
        <Target className="h-5 w-5 text-primary-500" />
      </div>
      
      <div className="space-y-4">
        {riskScore.financial_coaching.slice(0, 3).map((coaching, index) => (
          <div key={index} className={`p-4 rounded-xl border-l-4 ${
            coaching.priority === 'high' ? 'bg-danger-50 border-danger-500' :
            coaching.priority === 'medium' ? 'bg-warning-50 border-warning-500' :
            'bg-primary-50 border-primary-500'
          }`}>
            <div className="flex items-start space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                coaching.priority === 'high' ? 'bg-danger-500' :
                coaching.priority === 'medium' ? 'bg-warning-500' :
                'bg-primary-500'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 mb-1">
                  {coaching.action}
                </p>
                <p className="text-xs text-slate-600">
                  💡 {coaching.impact}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Peer Comparison
  const PeerComparison = () => (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800">Peer Comparison</h3>
        <Award className="h-5 w-5 text-warning-500" />
      </div>
      
      <div className="text-center">
        <div className="text-4xl font-bold text-primary-600 mb-2">
          {riskScore.percentile_rank}%
        </div>
        <p className="text-sm text-slate-600 mb-4">
          {riskScore.peer_comparison}
        </p>
        
        <div className="bg-slate-100 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${riskScore.percentile_rank}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-slate-500">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Credit Report</h2>
        <p className="text-slate-600">Comprehensive financial assessment for {riskScore.user_id}</p>
      </div>
      
      {/* Credit Score Gauge */}
      <div className="bg-white rounded-2xl p-8 shadow-soft border border-slate-200">
        <CreditScoreGauge score={riskScore.credit_score} />
        <div className="text-center mt-4">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
            riskScore.decision === 'Approve' ? 'bg-success-100 text-success-800' :
            riskScore.decision === 'Review' ? 'bg-warning-100 text-warning-800' :
            'bg-danger-100 text-danger-800'
          }`}>
            {riskScore.decision === 'Approve' ? <CheckCircle className="h-4 w-4 mr-2" /> :
             riskScore.decision === 'Review' ? <AlertTriangle className="h-4 w-4 mr-2" /> :
             <TrendingDown className="h-4 w-4 mr-2" />}
            {riskScore.decision}
          </div>
        </div>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RiskIndicator probability={riskScore.default_probability} />
        <LoanEligibilityCard />
        <PeerComparison />
      </div>
      
      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreBreakdown />
        <ImprovementSuggestions />
      </div>
      
      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-success-500" />
            <span className="text-slate-700">
              Strong payment history ({Math.round(riskScore.score_components.payment_history.score)}%)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-primary-500" />
            <span className="text-slate-700">
              EMI ratio: {riskScore.emi_to_income_ratio.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {riskScore.rbi_compliant ? 
              <CheckCircle className="h-4 w-4 text-success-500" /> :
              <AlertTriangle className="h-4 w-4 text-warning-500" />
            }
            <span className="text-slate-700">
              {riskScore.rbi_compliant ? 'RBI Compliant' : 'RBI Issues'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditReportDashboard;
