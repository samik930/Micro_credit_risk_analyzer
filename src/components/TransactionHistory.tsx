import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Transaction {
  type: string;
  amount: number;
  status: string;
  due_date: string;
  paid_date: string;
  days_late: number;
  provider: string;
  description: string;
  date: string;
}

interface ScoreHistory {
  old_score: number;
  new_score: number;
  change_reason: string;
  date: string;
}

interface TransactionHistoryProps {
  userId: number;
  onScoreUpdate?: (newScore: number) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ userId, onScoreUpdate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    transaction_type: 'electricity',
    amount: '',
    status: 'paid_on_time',
    provider: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, historyRes] = await Promise.all([
        apiService.getUserTransactions(userId),
        apiService.getScoreHistory(userId)
      ]);
      
      setTransactions(transactionsRes.transactions || []);
      setScoreHistory(historyRes.score_history || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    try {
      const response = await apiService.addTransaction(userId, {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount)
      });

      if (response.success) {
        // Refresh data
        await fetchData();
        
        // Don't update parent score - let it fetch from backend
        // The parent will get the updated score from the transaction-based system

        // Reset form
        setNewTransaction({
          transaction_type: 'electricity',
          amount: '',
          status: 'paid_on_time',
          provider: '',
          description: ''
        });
        setShowAddTransaction(false);

        // Show success message
        alert(`✅ ${response.message}`);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction');
    }
  };

  const handleClearTransactions = async () => {
    if (!window.confirm('Are you sure you want to clear all transactions? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiService.clearTransactions(userId);
      
      if (response.success) {
        // Refresh data to show empty state
        await fetchData();
        
        // Reset credit score to default
        if (onScoreUpdate) {
          onScoreUpdate(50); // Default score when no transactions
        }

        alert(`✅ ${response.message}`);
      }
    } catch (error) {
      console.error('Error clearing transactions:', error);
      alert('Failed to clear transactions');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid_on_time': return 'text-green-600 bg-green-100';
      case 'paid_late': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'electricity': return '⚡';
      case 'mobile': return '📱';
      case 'salary': return '💰';
      case 'bnpl': return '🛒';
      case 'paylater': return '💳';
      default: return '💼';
    }
  };

  const getScoreChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Transaction Button */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Transaction Management</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleClearTransactions}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowAddTransaction(!showAddTransaction)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showAddTransaction ? 'Cancel' : 'Add Transaction'}
            </button>
          </div>
        </div>

        {showAddTransaction && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  value={newTransaction.transaction_type}
                  onChange={(e) => setNewTransaction({...newTransaction, transaction_type: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="electricity">⚡ Electricity Bill</option>
                  <option value="mobile">📱 Mobile Recharge</option>
                  <option value="salary">💰 Salary Credit</option>
                  <option value="bnpl">🛒 Buy Now Pay Later</option>
                  <option value="paylater">💳 Pay Later Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={newTransaction.status}
                  onChange={(e) => setNewTransaction({...newTransaction, status: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="paid_on_time">✅ Paid On Time</option>
                  <option value="paid_late">⚠️ Paid Late</option>
                  <option value="failed">❌ Payment Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <input
                  type="text"
                  value={newTransaction.provider}
                  onChange={(e) => setNewTransaction({...newTransaction, provider: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., BSES, Airtel, etc."
                />
              </div>
            </div>

            <button
              onClick={handleAddTransaction}
              disabled={!newTransaction.amount}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Add Transaction & Update Score
            </button>
          </div>
        )}
      </div>

      {/* Score History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Credit Score Changes</h3>
        
        {scoreHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No score changes yet</p>
        ) : (
          <div className="space-y-3">
            {scoreHistory.map((change, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{change.change_reason}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(change.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{change.old_score}</span>
                    <span className="text-gray-400">→</span>
                    <span className={`text-sm font-semibold ${getScoreChangeColor(change.new_score - change.old_score)}`}>
                      {change.new_score}
                    </span>
                  </div>
                  <div className={`text-xs ${getScoreChangeColor(change.new_score - change.old_score)}`}>
                    {change.new_score - change.old_score > 0 ? '+' : ''}{change.new_score - change.old_score} pts
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
        
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions found</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(transaction.type)}</span>
                  <div>
                    <p className="font-medium text-gray-800">
                      {transaction.provider} - {transaction.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                      {transaction.days_late > 0 && (
                        <span className="ml-2 text-red-600">
                          ({transaction.days_late} days late)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-800">₹{transaction.amount.toLocaleString('en-IN')}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
