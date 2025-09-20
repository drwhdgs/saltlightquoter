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
        <div className="text-center mb-0"> {/* reduce margin here */}
  {/* Logo */}
  <img
    src="https://images.squarespace-cdn.com/content/v1/65528343aaca95757058ceb9/1168189f-9596-4b42-baae-da48565cc482/Screen+Shot+2023-11-16+at+5.08.32+PM-PhotoRoom.png-PhotoRoom.png?format=1500w"
    alt="Salt & Light Logo"
    className="mx-auto w-60 h-60 object-contain"
  />

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
