import React from "react";

const FullScreenLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-referlut-purple mb-4"></div>
      <p className="text-lg font-medium text-foreground">Loading...</p>
    </div>
  );
};

export default FullScreenLoader;
