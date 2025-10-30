'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox'; // Assuming you have a Checkbox component
import { Label } from '@/components/ui/label'; // Still needed for Checkbox and accessibility
import { getAgentByEmail, setCurrentAgent, initializeStorage } from '@/lib/storage';
import { Agent } from '@/lib/types';

interface LoginFormProps {
  onLogin: (agent: Agent) => void;
  onSwitchToRegister: () => void;
}

// NOTE: This component assumes it's being rendered inside a container 
// (e.g., your main App component) that sets the dark gray background 
// for the entire page, or you can wrap it in a div that does so.

export function LoginForm({ onLogin, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  // Added state for password, although not strictly used in your current logic
  const [password, setPassword] = useState(''); 
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // NOTE: Your original logic does not check a password. I'm keeping the logic 
  // focused on email lookup as your original component did, but including the field.


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      initializeStorage();

      if (!email.trim()) {
        setError('Please enter your email address');
        return;
      }

      // If you had proper password handling:
      // if (!password) {
      //   setError('Please enter your password');
      //   return;
      // }
      // const agent = validateAgentCredentials(email.trim().toLowerCase(), password);

      // Current simple email-only logic:
      const agent = getAgentByEmail(email.trim().toLowerCase());

      if (!agent) {
        setError('No account found with this email address. Please register first.');
        return;
      }
      
      // Assume successful login for simple logic
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
        
        {/* Title/Description removed to match the image's minimal presentation */}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Address Input */}
          <div className="space-y-2">
            {/* The Input component is styled to look like the image: large, white, rounded */}
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
            <div className="text-sm text-red-400 bg-red-900/40 p-3 rounded-md border border-red-800">
              {error}
            </div>
          )}

          {/* Sign In Button */}
<Button
  type="submit"
  className="w-full h-14 text-lg font-semibold rounded-lg mt-6 bg-[#1d2333] text-white shadow-md transition-colors"
  disabled={loading}
>
  {loading ? 'SIGNING IN...' : 'SIGN IN'}
</Button>

          {/* Register Link (Moved below the main action, using a more subtle style) */}
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