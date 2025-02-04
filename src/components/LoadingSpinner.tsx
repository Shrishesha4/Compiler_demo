'use client';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ fullScreen = false }: LoadingSpinnerProps) => {
  return (
    <div className={`${fullScreen ? 'fixed inset-0' : 'absolute inset-0'} 
      bg-black/20 backdrop-blur-sm flex items-center justify-center z-50`}>
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
        <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-blue-200 opacity-20"></div>
      </div>
    </div>
  );
};