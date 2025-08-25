import React from 'react';
import { Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardStats, RiskScore } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  riskScores: RiskScore[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, riskScores }) => {
  // Prepare data for charts
  const riskDistributionData = [
    { name: 'Excellent', value: stats.excellent_credit_count, color: '#22c55e' },
    { name: 'Good', value: stats.good_credit_count, color: '#3b82f6' },
    { name: 'Fair', value: stats.fair_credit_count, color: '#f59e0b' },
    { name: 'Poor', value: stats.poor_credit_count, color: '#ef4444' }
  ];

  const scoreRangeData = [
    { range: '300-449', count: riskScores.filter(s => s.credit_score <= 449).length },
    { range: '450-549', count: riskScores.filter(s => s.credit_score > 449 && s.credit_score <= 549).length },
    { range: '550-649', count: riskScores.filter(s => s.credit_score > 549 && s.credit_score <= 649).length },
    { range: '650-749', count: riskScores.filter(s => s.credit_score > 649 && s.credit_score <= 749).length },
    { range: '750-900', count: riskScores.filter(s => s.credit_score > 749).length }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
            </div>
            <Users className="h-8 w-8 text-primary-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <p className="text-3xl font-bold text-success-600">{stats.approval_rate.toFixed(1)}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Poor Credit</p>
              <p className="text-3xl font-bold text-danger-600">{stats.poor_credit_count}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-danger-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Excellent Credit</p>
              <p className="text-3xl font-bold text-success-600">{stats.excellent_credit_count}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-success-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Credit Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Score Range Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Credit Score Ranges</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreRangeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Decision Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Decision Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-success-50 rounded-lg">
            <p className="text-2xl font-bold text-success-600">
              {riskScores.filter(s => s.decision === 'Approve').length}
            </p>
            <p className="text-success-700 font-medium">Approved</p>
          </div>
          <div className="text-center p-4 bg-warning-50 rounded-lg">
            <p className="text-2xl font-bold text-warning-600">
              {riskScores.filter(s => s.decision === 'Review').length}
            </p>
            <p className="text-warning-700 font-medium">Under Review</p>
          </div>
          <div className="text-center p-4 bg-danger-50 rounded-lg">
            <p className="text-2xl font-bold text-danger-600">
              {riskScores.filter(s => s.decision === 'Reject').length}
            </p>
            <p className="text-danger-700 font-medium">Rejected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
