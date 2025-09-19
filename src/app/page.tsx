'use client';

import { useState, useEffect } from 'react';
import { AuthPage } from '@/components/auth/AuthPage';
import { MainDashboard } from '@/components/dashboard/MainDashboard';
import { Agent } from '@/lib/types';
import { getCurrentAgent, initializeStorage } from '@/lib/storage';

export default function HomePage() {
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize storage and check for existing session
    initializeStorage();
    const agent = getCurrentAgent();
    setCurrentAgent(agent);
    setIsLoading(false);
  }, []);

  const handleAuthenticated = (agent: Agent) => {
    setCurrentAgent(agent);
  };

  const handleLogout = () => {
    setCurrentAgent(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Insurance Quoting Platform...</p>
        </div>
      </div>
    );
  }

  if (!currentAgent) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return <MainDashboard agent={currentAgent} onLogout={handleLogout} />;
}
