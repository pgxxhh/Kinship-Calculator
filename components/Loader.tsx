import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center space-x-3 p-4 animate-fade-in">
      <div className="relative w-6 h-6">
        <div className="absolute inset-0 border-2 border-yellow-400 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <span className="text-yellow-200 font-medium tracking-wide text-sm uppercase">{message}</span>
    </div>
  );
};

export default Loader;