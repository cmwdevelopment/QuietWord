// Error boundary component for graceful error handling

import React, { Component, ErrorInfo, ReactNode } from "react";
import { PrimaryButton } from "./PrimaryButton";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-sm text-center space-y-6">
            <h1 className="text-2xl font-light text-gray-800">Something went wrong</h1>
            <p className="text-gray-600">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left bg-gray-100 p-4 rounded overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <PrimaryButton onClick={this.handleReset} fullWidth>
              Return to home
            </PrimaryButton>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
