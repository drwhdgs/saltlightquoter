'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Card imports are no longer needed for this style
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; 
import { getAgentByEmail, saveAgent, setCurrentAgent, generateId, initializeStorage } from '@/lib/storage';
import { Agent } from '@/lib/types';

interface RegisterFormProps {
  onRegister: (agent: Agent) => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    // Added a password field for a complete registration form
    password: '', 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      initializeStorage();

      if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
        setError('Please fill in all fields');
        return;
      }

      const emailLower = formData.email.trim().toLowerCase();

      // Check if agent already exists
      const existingAgent = getAgentByEmail(emailLower);
      if (existingAgent) {
        setError('An agent with this email already exists. Please login instead.');
        return;
      }

      // Create new agent
      const newAgent: Agent = {
        id: generateId(),
        email: emailLower,
        name: formData.name.trim(),
        // Note: Password would typically be hashed and saved in a real app
        // You may want to add a 'passwordHash' field to your Agent type
        createdAt: new Date().toISOString(),
      };

      saveAgent(newAgent);
      setCurrentAgent(newAgent);
      onRegister(newAgent);
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    // Outer container to center the content and apply the dark background
      <div className="w-full max-w-md p-4 space-y-4">
        
        {/* Title to keep context, but styled minimally */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Create Agent Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name Input */}
          <div className="space-y-2">
            {/* The Input component is styled to look like the login image */}
            <Input
              id="name"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="h-16 text-lg border-none shadow-md rounded-lg p-5 placeholder:text-gray-500"
              style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' }}
            />
          </div>

          {/* Email Address Input */}
          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="h-16 text-lg border-none shadow-md rounded-lg p-5 placeholder:text-gray-500"
              style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' }}
            />
          </div>
          
          {/* Password Input (Added for standard registration) */}
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              className="h-16 text-lg border-none shadow-md rounded-lg p-5 placeholder:text-gray-500"
              style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-400 bg-red-900/40 p-3 rounded-md border border-red-800">
              {error}
            </div>
          )}

          {/* Create Account Button */}
          <Button
            type="submit"
  className="w-full h-14 text-lg font-semibold rounded-lg mt-6 bg-[#1d2333] text-white shadow-md transition-colors"

            disabled={loading}
          >
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
          </Button>

          {/* Login Link */}
          <div className="text-center pt-4">
            <Button
              type="button"
              variant="link"
              onClick={onSwitchToLogin}
              className="text-gray-500 hover:text-gray-300 text-sm p-0 h-auto"
            >
              Already have an account? Sign in here
            </Button>
          </div>

        </form>
      </div>
  );
}