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
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-0"> {/* reduce margin here */}
  {/* Logo */}
  <img
    src="/QuoteDeck3.png"
    alt="Salt & Light Logo"
    className="mx-auto w-100 h-100 mb-10 object-contain"
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
        <div className="mt-8 text-center text-md text-gray-500">
          <p>Copyright © 2025 QuoteDeck | Terms of Use & Privacy Policy</p>
                 <p><br/>All data is stored locally in your browser</p>

        </div>
      </div>
    </div>
  );
}
