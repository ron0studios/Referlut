import React from "react";

interface LoadingIndicatorProps {
  message?: string;
  subMessage?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "Loading...",
  subMessage = "Please wait while we fetch the data.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h3 className="text-xl font-medium text-gray-600">{message}</h3>
      <p className="text-gray-500">{subMessage}</p>
    </div>
  );
};

export default LoadingIndicator;
