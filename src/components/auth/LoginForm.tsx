'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getAgentByEmail, setCurrentAgent, initializeStorage } from '@/lib/storage';
import { Agent } from '@/lib/types';
import { Loader2 } from 'lucide-react'; // Added for a loading icon on the demo button

interface LoginFormProps {
  onLogin: (agent: Agent) => void;
  onSwitchToRegister: () => void;
}

// 1. Define the Demo Agent structure
const DEMO_AGENT: Agent = {
    id: 'demo-agent-12345', // Unique ID for the demo agent
    email: 'demo@example.com',
    name: 'Demo User',
    // Add any other necessary fields from your 'Agent' type
};

export function LoginForm({ onLogin, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false); // New state for demo button loading

  // 2. Add the Demo Login Handler
  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError('');

    try {
        // Ensure storage is initialized before attempting to set the current agent
        initializeStorage(); 

        // In a real application, you might check if the demo user exists 
        // or create it if it doesn't, but for instant login, we can just 
        // set the session and call onLogin.
        
        // This simulates instant login:
        setCurrentAgent(DEMO_AGENT);
        
        // Use a slight delay to show the loading state for better UX
        await new Promise(resolve => setTimeout(resolve, 500)); 

        onLogin(DEMO_AGENT);

    } catch (err) {
        console.error('Demo login failed:', err);
        setError('Failed to log in to the demo account.');
    } finally {
        setDemoLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      initializeStorage();

      if (!email.trim()) {
        setError('Please enter your email address');
        setLoading(false);
        return;
      }

      // Current simple email-only logic:
      const agent = getAgentByEmail(email.trim().toLowerCase());

      if (!agent) {
        setError('No account found with this email address. Please register first.');
        setLoading(false);
        return;
      }
      
      setCurrentAgent(agent);
      onLogin(agent);
      
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Outer container to center the content
      <div className="w-full max-w-md p-4 space-y-4">
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Address Input */}
          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-16 text-lg border-none shadow-md rounded-lg p-5 placeholder:text-gray-500"
              style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' }}
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-16 text-lg border-none shadow-md rounded-lg p-5 placeholder:text-gray-500"
              style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' }}
            />
          </div>

          {/* Remember Me / Forgot Password Row */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember-me" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
                className="w-5 h-5 border-gray-400 bg-white" 
              />
              <Label htmlFor="remember-me" className="text-gray-600 select-none">
                Remember me
              </Label>
            </div>
            <Button
              type="button"
              variant="link"
              className="text-gray-600 hover:text-white transition p-0 h-auto text-sm"
              onClick={() => console.log('Forgot password clicked')}
            >
              Forgot password?
            </Button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="text-sm text-white bg-red-800 p-3 rounded-md border border-red-800">
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <Button
            type="submit"
            className="w-full h-14 text-lg font-semibold rounded-lg mt-6 bg-[#1d2333] text-white shadow-md transition-colors"
            disabled={loading || demoLoading}
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </Button>

          {/* --- New Demo Button Section --- */}
          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* 3. The Use Demo Button */}
          <Button
            type="button"
            onClick={handleDemoLogin}
            className="w-full h-14 text-lg font-semibold rounded-lg bg-blue-500 text-white shadow-md transition-colors border border-gray-300"
            disabled={loading || demoLoading}
          >
            {demoLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ENTERING DEMO...
                </>
            ) : (
                'USE DEMO ACCOUNT'
            )}
          </Button>
          
          {/* Register Link */}
          <div className="text-center pt-4">
            <Button
              type="button"
              variant="link"
              onClick={onSwitchToRegister}
              className="text-gray-500 hover:text-gray-300 text-sm p-0 h-auto"
            >
              Don't have an account? Register here
            </Button>
          </div>

        </form>
      </div>
  );
}