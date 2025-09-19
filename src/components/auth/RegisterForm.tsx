'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      initializeStorage();

      if (!formData.name.trim() || !formData.email.trim()) {
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
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Agent Registration</CardTitle>
        <CardDescription>
          Create your account to start generating insurance quotes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Smith"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="agent@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onSwitchToLogin}
              className="text-sm"
            >
              Already have an account? Sign in here
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
