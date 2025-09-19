'use client';

import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Agent } from '@/lib/types';

interface AuthPageProps {
  onAuthenticated: (agent: Agent) => void;
}

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Insurance Quoting Platform
          </h1>
          <p className="text-gray-600">
            Professional insurance quoting software for agents
          </p>
        </div>

        {/* Auth Forms */}
        {isLogin ? (
          <LoginForm
            onLogin={onAuthenticated}
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm
            onRegister={onAuthenticated}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>All data is stored locally in your browser</p>
        </div>
      </div>
    </div>
  );
}
