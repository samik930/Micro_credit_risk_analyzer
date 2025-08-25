import React from 'react';
import { BarChart3, Shield, TrendingUp, Sparkles, Award } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="relative bg-white shadow-medium border-b border-slate-200">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-50/30 via-white to-primary-50/30"></div>
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-3 rounded-2xl shadow-medium">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Micro Credit Risk Analyzer
              </h1>
              <p className="text-slate-600 font-medium flex items-center mt-1">
                <Sparkles className="h-4 w-4 mr-2 text-brand-500" />
                AI-powered credit scoring for financial inclusion
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-slate-200 shadow-soft">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">ML-Powered</div>
                <div className="text-xs text-slate-500">Advanced Analytics</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-slate-200 shadow-soft">
              <div className="w-8 h-8 bg-gradient-to-br from-success-100 to-success-200 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-success-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">Real-time</div>
                <div className="text-xs text-slate-500">Instant Results</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-slate-200 shadow-soft">
              <div className="w-8 h-8 bg-gradient-to-br from-warning-100 to-warning-200 rounded-lg flex items-center justify-center">
                <Award className="h-4 w-4 text-warning-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">RBI Compliant</div>
                <div className="text-xs text-slate-500">Regulatory Standards</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
