import React from "react";

const Spinner = () => {
  return (
    <div className="flex w-full justify-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-700"></div>
      <div className="text-gray-500 text-xs mt-2">Please wait</div>
    </div>
  );
};

export default Spinner;
