import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleGetStarted = () => {
    setIsNavigating(true);
    // Add a smooth delay for the loading animation
    setTimeout(() => {
      navigate('/app');
    }, 800);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 transition-all duration-500 ${isNavigating ? 'opacity-75 scale-95' : 'opacity-100 scale-100'}`}>
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-soft fixed w-full z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-18">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-2 rounded-xl shadow-soft mr-3">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Micro Credit Risk Analyzer</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-slate-700 hover:text-brand-600 transition-colors font-medium">Features</a>                   
              <a href="#about" className="text-slate-700 hover:text-brand-600 transition-colors font-medium">About</a>
              <button 
                onClick={() => navigate('/borrower')}
                className="px-4 py-2 rounded-lg font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
              >
                Apply for Loan
              </button>
              <button 
                onClick={handleGetStarted}
                disabled={isNavigating}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-soft ${
                  isNavigating 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 hover:scale-105 hover:shadow-medium'
                } text-white`}
              >
                {isNavigating ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Loading...
                  </div>
                ) : (
                  'Admin Portal'
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-brand-50/50 via-white to-primary-50/30 flex items-center min-h-[70vh] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-brand-200 rounded-full px-6 py-3 shadow-soft mb-6">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-brand-700 font-semibold text-sm">RBI Compliant • ML-Powered • Real-time Analysis</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">AI-Powered Credit Scoring for</span><br/>
              <span className="bg-gradient-to-r from-brand-600 to-primary-600 bg-clip-text text-transparent">Financial Inclusion</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium">
              Revolutionizing credit assessment for India's unbanked population using alternative financial signals 
              from UPI transactions, mobile recharges, and bill payments.
            </p>
            <div className="mt-12">
              <button 
                onClick={handleGetStarted}
                disabled={isNavigating}
                className={`px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-large ${
                  isNavigating 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 hover:scale-105 hover:shadow-xl'
                } text-white`}
              >
                {isNavigating ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin h-5 w-5 mr-3" />
                    Launching App...
                  </div>
                ) : (
                  <>Start Risk Analysis →</>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Problem</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              In India, over 65% of adults don't have formal credit history, excluding millions from financial services.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-times text-red-600 text-2xl"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Students</h3>
              <p className="text-gray-600 text-sm">No credit history despite digital activity</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-briefcase text-orange-600 text-2xl"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gig Workers</h3>
              <p className="text-gray-600 text-sm">Irregular income patterns</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-hammer text-yellow-600 text-2xl"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Daily Wage Earners</h3>
              <p className="text-gray-600 text-sm">Cash-based transactions</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-store text-purple-600 text-2xl"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Small Shopkeepers</h3>
              <p className="text-gray-600 text-sm">Limited formal financial records</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Solution</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Using alternative financial signals to assess creditworthiness with machine learning
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-mobile-alt text-green-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Mobile Recharge Patterns</h3>
                    <p className="text-gray-600">Consistent recharges indicate stable income</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-receipt text-blue-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bill Payment History</h3>
                    <p className="text-gray-600">Regular utility payments show responsible behavior</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-exchange-alt text-purple-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">UPI Transaction Activity</h3>
                    <p className="text-gray-600">Digital footprint reveals financial behavior</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-exclamation-triangle text-red-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Risk Indicators</h3>
                    <p className="text-gray-600">Sudden high-value transactions flag higher risk</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Score Output</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">User U001</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-green-600 mr-2">82</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Approve</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">User U003</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-yellow-600 mr-2">65</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Review</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium">User U002</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-red-600 mr-2">35</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Reject</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg text-gray-600">Built for hackathons, ready for production</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="bg-primary-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-upload text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Data Upload</h3>
              <p className="text-gray-600">Drag & drop CSV/JSON files with transaction history</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="bg-primary-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-brain text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">ML-Powered Scoring</h3>
              <p className="text-gray-600">Random Forest & Logistic Regression models</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="bg-primary-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-chart-bar text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Visual Dashboard</h3>
              <p className="text-gray-600">Interactive charts and risk distribution analysis</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="bg-primary-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-tachometer-alt text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Processing</h3>
              <p className="text-gray-600">FastAPI backend with instant risk assessment</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="bg-primary-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-code text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Auto API Docs</h3>
              <p className="text-gray-600">Swagger/OpenAPI documentation included</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="bg-primary-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-download text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Export Results</h3>
              <p className="text-gray-600">Download risk scores and decisions as CSV</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-brand-600 via-brand-500 to-primary-600 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Credit Assessment?</h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Join the financial inclusion revolution with AI-powered alternative credit scoring
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button 
              onClick={handleGetStarted}
              disabled={isNavigating}
              className={`px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-large ${
                isNavigating 
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                  : 'bg-white text-brand-600 hover:bg-slate-50 hover:scale-105 hover:shadow-xl'
              }`}
            >
              {isNavigating ? (
                <div className="flex items-center justify-center">
                  <Loader className="animate-spin h-5 w-5 mr-3" />
                  Launching App...
                </div>
              ) : (
                <>🚀 Get Started</>  
              )}
            </button>
            <button className="border-2 border-white/80 text-white px-10 py-4 rounded-2xl text-lg font-bold hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm">
              📧 Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-primary-500 mr-3" />
                <span className="text-xl font-bold">Micro Credit Risk Analyzer</span>
              </div>
              <p className="text-gray-400">
                Democratizing credit access through AI-powered alternative data analysis.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-github text-xl"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Micro Credit Risk Analyzer. Built for financial inclusion.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
