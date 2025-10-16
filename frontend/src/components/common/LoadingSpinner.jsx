import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
      <p className="ml-3 text-main font-medium">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;