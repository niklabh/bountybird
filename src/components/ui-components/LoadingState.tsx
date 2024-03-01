import React from "react";

const LoadingState = () => {
  return (
    <div className="w-full h-screen max-h-96 flex items-center justify-center gap-5">
      <div className="w-8 aspect-square rounded-full border-4 border-white border-r-0 border-b-0 animate-spin"></div>
      <span className="text-lg"> Loading...</span>
    </div>
  );
};

export default LoadingState;
