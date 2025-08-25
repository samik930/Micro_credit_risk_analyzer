import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'table' | 'dashboard' | 'text';
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'card', 
  count = 1, 
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-soft border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
                    <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-16 h-8 bg-slate-200 rounded animate-pulse"></div>
                    <div className="w-24 h-4 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Chart Area */}
            <div className="bg-white rounded-2xl shadow-soft border border-slate-200 p-6">
              <div className="mb-6">
                <div className="w-48 h-6 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="w-32 h-4 bg-slate-200 rounded animate-pulse"></div>
              </div>
              <div className="h-80 bg-slate-100 rounded-xl animate-pulse"></div>
            </div>
          </div>
        );
        
      case 'table':
        return (
          <div className="bg-white rounded-2xl shadow-soft border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="w-48 h-6 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-4 border-b border-slate-100 last:border-b-0">
                  <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-24 h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="w-32 h-3 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-16 h-8 bg-slate-200 rounded-full animate-pulse"></div>
                  <div className="w-20 h-6 bg-slate-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'text':
        return (
          <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="w-full h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="w-3/4 h-4 bg-slate-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        );
        
      default: // card
        return (
          <div className="bg-white rounded-2xl shadow-soft border border-slate-200 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="w-32 h-5 bg-slate-200 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-full h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="w-5/6 h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="w-4/6 h-4 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`animate-pulse ${className}`}>
      {[...Array(count)].map((_, index) => (
        <div key={index} className={index > 0 ? 'mt-6' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
