// Simple loading spinner component

import React from "react";

export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-block w-8 h-8 border-4 border-[#6B7F6A] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}
