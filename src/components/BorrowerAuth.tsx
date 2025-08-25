import React, { useState } from 'react';
import { User, Lock, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { apiService, LoginCredentials, RegisterData } from '../services/api';

interface BorrowerAuthProps {
  onLogin: (borrowerId: string, borrowerData: any) => void;
}

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

const BorrowerAuth: React.FC<BorrowerAuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    monthlyIncome: '',
    existingDebt: '',
    loanPurpose: 'business',
    requestedAmount: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login with API
        const credentials: LoginCredentials = {
          email: formData.email,
          password: formData.password
        };
        
        const response = await apiService.login(credentials);
        const user = response.user;
        
        // Fetch user's latest loan application data
        let loanData = {
          monthlyIncome: 0,
          existingDebt: 0,
          loanPurpose: 'business',
          requestedAmount: 0
        };
        
        try {
          const creditScore = await apiService.getCreditScore(user.id);
          // If we have credit score data, it means user has loan application
          if (creditScore) {
            // Try to get loan application details - for now use reasonable defaults
            loanData = {
              monthlyIncome: creditScore.monthly_income || 0,
              existingDebt: creditScore.existing_debt || 0,
              loanPurpose: creditScore.loan_purpose || 'business',
              requestedAmount: creditScore.requested_amount || 0
            };
          }
        } catch (err) {
          console.log('No existing loan application found, using defaults');
        }
        
        // Convert API user to BorrowerData format
        const borrowerData: BorrowerData = {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          dateOfBirth: user.date_of_birth,
          monthlyIncome: loanData.monthlyIncome,
          existingDebt: loanData.existingDebt,
          loanPurpose: loanData.loanPurpose,
          requestedAmount: loanData.requestedAmount
        };
        
        onLogin(user.id.toString(), borrowerData);
      } else {
        // Validate signup form
        if (!formData.name || !formData.phone || !formData.address || !formData.dateOfBirth || 
            !formData.monthlyIncome || !formData.requestedAmount) {
          setError('Please fill in all required fields.');
          return;
        }
        
        if (parseInt(formData.monthlyIncome) < 5000) {
          setError('Minimum monthly income requirement is ₹5,000 as per RBI guidelines.');
          return;
        }
        
        if (parseInt(formData.requestedAmount) > 125000) {
          setError('Maximum loan amount is ₹1,25,000 as per RBI microfinance guidelines.');
          return;
        }
        
        // Register with API
        const registerData: RegisterData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          date_of_birth: formData.dateOfBirth
        };
        
        const registerResponse = await apiService.register(registerData);
        
        // Apply for loan immediately after registration
        const loanApplication = {
          monthly_income: parseInt(formData.monthlyIncome),
          existing_debt: parseInt(formData.existingDebt || '0'),
          loan_purpose: formData.loanPurpose,
          requested_amount: parseInt(formData.requestedAmount)
        };
        
        await apiService.applyForLoan(loanApplication, registerResponse.user_id);
        
        // Create borrower data for login
        const newBorrowerData: BorrowerData = {
          id: registerResponse.user_id.toString(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          monthlyIncome: parseInt(formData.monthlyIncome),
          existingDebt: parseInt(formData.existingDebt || '0'),
          loanPurpose: formData.loanPurpose,
          requestedAmount: parseInt(formData.requestedAmount)
        };
        
        onLogin(registerResponse.user_id.toString(), newBorrowerData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError(''); // Clear error when user starts typing
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Borrower Login' : 'Apply for Loan'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Access your loan dashboard' : 'Start your loan application'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, State"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Income (₹)
                  </label>
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Existing Debt (₹)
                  </label>
                  <input
                    type="number"
                    name="existingDebt"
                    value={formData.existingDebt}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Purpose
                </label>
                <select
                  name="loanPurpose"
                  value={formData.loanPurpose}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="medical">Medical</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Amount (₹)
                </label>
                <input
                  type="number"
                  name="requestedAmount"
                  value={formData.requestedAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000"
                  max="125000"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Maximum: ₹1,25,000 (RBI Limit)</p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isLogin ? 'Logging in...' : 'Creating Account...'}
              </div>
            ) : (
              isLogin ? 'Login to Dashboard' : 'Submit Application'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isLogin ? "Don't have an account? Apply for loan" : 'Already have an account? Login'}
          </button>
        </div>

        {isLogin && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 mb-2">
              <strong>Demo Accounts (Database):</strong>
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <div>• john@example.com / password123</div>
              <div>• jane@example.com / demo123</div>
              <div>• demo@test.com / demo</div>
            </div>
            <p className="text-xs text-blue-500 mt-2">
              <strong>Note:</strong> Backend must be running on port 8000
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowerAuth;
