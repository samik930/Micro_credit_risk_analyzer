import React, { useState } from 'react';
import BorrowerAuth from './BorrowerAuth';
import BorrowerDashboard from './BorrowerDashboard';

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

const BorrowerPortal: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [borrowerData, setBorrowerData] = useState<BorrowerData | null>(null);

  const handleLogin = (borrowerId: string, data: BorrowerData) => {
    setBorrowerData(data);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setBorrowerData(null);
  };

  if (!isAuthenticated || !borrowerData) {
    return <BorrowerAuth onLogin={handleLogin} />;
  }

  return <BorrowerDashboard borrowerData={borrowerData} onLogout={handleLogout} />;
};

export default BorrowerPortal;
