// 404 Not Found page

import React from "react";
import { useNavigate } from "react-router";
import { PrimaryButton } from "../components/PrimaryButton";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-sm text-center space-y-6">
        <h1 className="text-4xl font-light text-gray-800">404</h1>
        <p className="text-gray-600">Page not found</p>
        <PrimaryButton onClick={() => navigate("/")} fullWidth>
          Return home
        </PrimaryButton>
      </div>
    </div>
  );
}
