'use client';

import { useState } from 'react';
import { Agent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Mail, Phone } from 'lucide-react';

interface AgentSettingsProps {
  agent: Agent;
  onLogout: () => void;
  onAgentUpdate: (updatedAgent: Partial<Agent>) => Promise<void>;
}

export function AgentSettings({ agent, onLogout, onAgentUpdate }: AgentSettingsProps) {
  const [name, setName] = useState(agent.name);
  const [phone, setPhone] = useState(agent.phone || '');
  const [email, setEmail] = useState(agent.email);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!name || !email) {
      setMessage({ type: 'error', text: 'Name and email are required.' });
      setIsLoading(false);
      return;
    }

    try {
      await onAgentUpdate({ name, email, phone });
      setMessage({ type: 'success', text: '✅ Profile updated successfully!' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: '❌ Update failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* HEADER */}
  <div className="max-w-4xl mx-auto space-y-8">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
      <p className="text-gray-500 text-sm mt-1">
        Manage your QuoteDeck agent profile and preferences.
      </p>
    </div>
    <div className="text-sm text-gray-500">
      <p className="font-medium uppercase">Agent ID</p>
      <p className="text-gray-800 font-semibold">{agent.id}</p>
    </div>
  </div>
</div>

      {/* PROFILE SETTINGS */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Profile Information</CardTitle>
          <p className="text-sm text-gray-500">Edit your contact details and login information.</p>
        </CardHeader>
        <CardContent>
          {message && (
            <div
              className={`p-3 mb-4 rounded-lg text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="agent-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <Input
                    id="agent-name"
                    type="text"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="agent-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <Input
                    id="agent-email"
                    type="email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="agent-phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <Input
                    id="agent-phone"
                    type="tel"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-sm h-10 border-gray-300 hover:bg-gray-100"
                >
                  Change Password
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" /> Saving...
                  </>
                ) : (
                  'Save Profile Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ACCOUNT DETAILS */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Account Details</CardTitle>
          <p className="text-sm text-gray-500">Overview of your registration and license info.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Created</Label>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Status</Label>
            <p className="text-lg font-semibold text-green-600 mt-1">Active</p>
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Plan Type</Label>
            <p className="text-lg font-semibold text-gray-800 mt-1">Standard Agent</p>
          </div>
        </CardContent>
      </Card>

      {/* DANGER ZONE */}
      <Card className="shadow-sm border border-red-300">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-red-700">Danger Zone ⚠️</CardTitle>
          <p className="text-sm text-gray-600">Manage risky or irreversible actions.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-red-700">Log Out</h3>
              <p className="text-sm text-gray-600">End your session securely.</p>
            </div>
            <Button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 font-semibold rounded-md"
            >
              Logout
            </Button>
          </div>

          <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg opacity-70 cursor-not-allowed">
            <div>
              <h3 className="font-semibold text-red-700">Delete Account</h3>
              <p className="text-sm text-gray-600">Permanently remove your data (disabled in demo).</p>
            </div>
            <Button disabled className="bg-red-400 text-white font-semibold px-6 py-2 rounded-md">
              Deactivate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />
      <p className="text-center text-xs text-gray-400">
        ⚙️ All settings are stored securely and synced with your QuoteDeck account.
      </p>
    </div>
  );
}