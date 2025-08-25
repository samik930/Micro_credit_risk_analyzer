import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Upload, BarChart3 } from 'lucide-react';
import Header from './Header';
import FileUpload from './FileUpload';
import Dashboard from './Dashboard';
import UserTable from './UserTable';
import RBIComplianceDashboard from './RBIComplianceDashboard';
import PageTransition from './PageTransition';
import SkeletonLoader from './SkeletonLoader';
import { RiskScore, DashboardStats } from '../types';

const MainApp: React.FC = () => {
  const navigate = useNavigate();
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'rbi-compliance'>('overview');

  const handleFileProcessed = (scores: RiskScore[], stats: DashboardStats) => {
    setRiskScores(scores);
    setDashboardStats(stats);
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageTransition>
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Back to Landing Button */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={handleBackToLanding}
            className="group flex items-center text-slate-600 hover:text-brand-600 transition-all duration-200 hover:bg-brand-50 px-3 py-2 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Landing</span>
          </button>
        </div>
      </div>

      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* File Upload Section */}
          <div className={`transition-all duration-500 delay-200 ${isVisible ? 'animate-slideInLeft' : 'opacity-0'}`}>
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">
                    Upload Transaction Data
                  </h2>
                  <p className="text-slate-600 mt-1">Upload your CSV or JSON file to begin risk analysis</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-large border border-slate-200 p-8">
              <FileUpload 
                onFileProcessed={handleFileProcessed}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>
          </div>

          {/* Dashboard Section */}
          {isLoading && (
            <div className={`transition-all duration-500 delay-300 ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800">
                      Processing Analytics
                    </h2>
                    <p className="text-slate-600 mt-1">Calculating risk scores and generating insights...</p>
                  </div>
                </div>
              </div>
              <SkeletonLoader variant="dashboard" />
            </div>
          )}
          
          {dashboardStats && !isLoading && (
            <div className={`transition-all duration-500 delay-300 ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800">
                      Risk Analysis Dashboard
                    </h2>
                    <p className="text-slate-600 mt-1">Comprehensive insights and compliance overview</p>
                  </div>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-medium border border-slate-200 mb-8">
                <div className="border-b border-slate-200">
                  <nav className="flex space-x-1 p-2">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        activeTab === 'overview'
                          ? 'bg-brand-500 text-white shadow-soft'
                          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      Risk Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('rbi-compliance')}
                      className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                        activeTab === 'rbi-compliance'
                          ? 'bg-brand-500 text-white shadow-soft'
                          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Shield className="h-4 w-4" />
                      <span>RBI Compliance</span>
                    </button>
                  </nav>
                </div>
              </div>
              
              {/* Tab Content */}
              <div className="animate-fadeIn">
                {activeTab === 'overview' ? (
                  <Dashboard stats={dashboardStats} riskScores={riskScores} />
                ) : (
                  <RBIComplianceDashboard stats={dashboardStats} scores={riskScores} />
                )}
              </div>
            </div>
          )}

          {/* Results Table */}
          {isLoading && (
            <div className={`transition-all duration-500 delay-400 ${isVisible ? 'animate-slideInRight' : 'opacity-0'}`}>
              <SkeletonLoader variant="table" />
            </div>
          )}
          
          {riskScores.length > 0 && !isLoading && (
            <div className={`transition-all duration-500 delay-400 ${isVisible ? 'animate-slideInRight' : 'opacity-0'}`}>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  Risk Assessment Results
                </h2>
                <p className="text-slate-600">Detailed analysis of {riskScores.length} applicants with risk scores and recommendations</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-large border border-slate-200 overflow-hidden">
                <UserTable riskScores={riskScores} />
              </div>
            </div>
          )}
        </div>
      </main>
      </div>
    </PageTransition>
  );
};

export default MainApp;
