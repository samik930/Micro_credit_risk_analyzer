import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { RiskScore } from '../types';

interface UserTableProps {
  riskScores: RiskScore[];
}

const UserTable: React.FC<UserTableProps> = ({ riskScores }) => {
  const [sortField, setSortField] = useState<keyof RiskScore>('credit_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterDecision, setFilterDecision] = useState<string>('all');

  const handleSort = (field: keyof RiskScore) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedData = riskScores
    .filter(score => filterDecision === 'all' || score.decision === filterDecision)
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return 0;
    });

  const getRiskBandColor = (riskBand: string) => {
    switch (riskBand) {
      case 'Excellent':
        return 'bg-success-100 text-success-800';
      case 'Good':
        return 'bg-primary-100 text-primary-800';
      case 'Fair':
        return 'bg-warning-100 text-warning-800';
      case 'Poor':
      case 'Very Poor':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'Approve':
        return 'bg-success-100 text-success-800';
      case 'Review':
        return 'bg-warning-100 text-warning-800';
      case 'Reject':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    const headers = [
      'User ID', 'Credit Score', 'Risk Band', 'Decision', 'RBI Compliant', 
      'Max Eligible Amount', 'EMI Ratio', 'Improvement Suggestions', 'RBI Violations'
    ];
    
    const csvData = [
      headers.join(','),
      ...filteredAndSortedData.map(score => [
        score.user_id,
        score.credit_score,
        score.risk_band,
        score.decision,
        score.rbi_compliant ? 'Yes' : 'No',
        score.max_eligible_amount,
        score.emi_to_income_ratio + '%',
        `"${score.improvement_suggestions.join('; ')}"`,
        `"${score.rbi_violations.join('; ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'credit_analysis_results.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const SortIcon = ({ field }: { field: keyof RiskScore }) => {
    if (sortField !== field) {
      return <ChevronDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-primary-600" />
      : <ChevronDown className="h-4 w-4 text-primary-600" />;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Decision
            </label>
            <select
              id="filter"
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Decisions</option>
              <option value="Approve">Approved</option>
              <option value="Review">Under Review</option>
              <option value="Reject">Rejected</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedData.length} of {riskScores.length} users
          </div>
        </div>
        
        <button
          onClick={exportToCSV}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('credit_score')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Credit Score</span>
                    <SortIcon field="credit_score" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('risk_band')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Risk Band</span>
                    <SortIcon field="risk_band" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('decision')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Decision</span>
                    <SortIcon field="decision" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RBI Compliant
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('max_eligible_amount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Max Loan</span>
                    <SortIcon field="max_eligible_amount" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('emi_to_income_ratio')}
                >
                  <div className="flex items-center space-x-1">
                    <span>EMI Ratio</span>
                    <SortIcon field="emi_to_income_ratio" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedData.map((score) => (
                <tr key={score.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {score.user_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {score.credit_score}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            score.credit_score >= 750 ? 'bg-success-500' :
                            score.credit_score >= 650 ? 'bg-primary-500' :
                            score.credit_score >= 550 ? 'bg-warning-500' : 'bg-danger-500'
                          }`}
                          style={{ width: `${((score.credit_score - 300) / 600) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskBandColor(score.risk_band)}`}>
                      {score.risk_band}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDecisionColor(score.decision)}`}>
                      {score.decision}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {score.rbi_compliant ? (
                        <CheckCircle className="h-5 w-5 text-success-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-danger-500" />
                      )}
                      <span className={`ml-2 text-sm ${score.rbi_compliant ? 'text-success-700' : 'text-danger-700'}`}>
                        {score.rbi_compliant ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{((score.max_eligible_amount || 0)/1000).toFixed(0)}K
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">{(score.emi_to_income_ratio || 0).toFixed(1)}%</span>
                      {(score.emi_to_income_ratio || 0) > 50 && (
                        <div className="relative group">
                          <AlertTriangle className="h-4 w-4 text-warning-500" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Exceeds RBI guideline of 50%
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <details className="group">
                      <summary className="cursor-pointer text-primary-600 hover:text-primary-800 text-sm font-medium">
                        View Details
                      </summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs space-y-2 max-w-xs">
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Improvement Suggestions:</p>
                          <div className="space-y-1">
                            {score.improvement_suggestions.slice(0, 3).map((suggestion, index) => (
                              <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        </div>
                        {score.rbi_violations.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-red-700 mb-1">RBI Violations:</p>
                            <div className="space-y-1">
                              {score.rbi_violations.map((violation, index) => (
                                <div key={index} className="text-xs bg-red-100 px-2 py-1 rounded text-red-800">
                                  {violation}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAndSortedData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filter criteria.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
