'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Plus,
  Settings,
  LogOut,
  Users,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { Agent, Quote } from '@/lib/types';

interface SidebarProps {
  agent: Agent;
  quotes: Quote[];
  activeView: string;
  onViewChange: (view: string) => void;
  onQuoteSelect: (quoteId: string) => void;
  onLogout: () => void;
}

export function Sidebar({
  agent,
  quotes,
  activeView,
  onViewChange,
  onQuoteSelect,
  onLogout
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const recentQuotes = quotes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const pendingQuotes = quotes.filter(q => q.status === 'draft').length;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
<div className="p-6 border-b flex items-center gap-4">
  {/* Logo */}
  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
    <img
      src="https://i.ibb.co/gbLRKXn3/662-815-0033-removebg-preview.png" // replace with your logo path
      alt="Company Logo"
      className="w-full h-full object-cover"
    />
  </div>

  {/* Title and Welcome */}
  <div>
    <h2 className="text-xl font-bold text-gray-900">Salt & Light Quoter</h2>
    <p className="text-sm text-gray-600 mt-1">Welcome, {agent.name}</p>
  </div>
</div>


      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        <Button
          variant={activeView === 'new-quote' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => {
            onViewChange('new-quote');
            setIsMobileOpen(false);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Quote
          {pendingQuotes > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {pendingQuotes}
            </Badge>
          )}
        </Button>

        
        <Button
          variant={activeView === 'dashboard' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => {
            onViewChange('dashboard');
            setIsMobileOpen(false);
          }}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Dashboard
        </Button>


        <Button
          variant={activeView === 'quotes' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => {
            onViewChange('quotes');
            setIsMobileOpen(false);
          }}
        >
          <FileText className="w-4 h-4 mr-2" />
          My Quotes
          <Badge variant="outline" className="ml-auto">
            {quotes.length}
          </Badge>
        </Button>

        <Separator className="my-4" />

        {/* Recent Quotes */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 px-2">Recent Quotes</h3>
          {recentQuotes.length === 0 ? (
            <p className="text-xs text-gray-500 px-2">No quotes yet</p>
          ) : (
            recentQuotes.map((quote) => (
              <Button
                key={quote.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left h-auto p-2"
                onClick={() => {
                  onQuoteSelect(quote.id);
                  setIsMobileOpen(false);
                }}
              >
                <div className="flex flex-col items-start w-full">
                  <span className="text-sm font-medium truncate w-full">
                    {quote.client.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(quote.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <Badge
                  variant={quote.status === 'completed' ? 'default' : 'secondary'}
                  className="ml-2 text-xs"
                >
                  {quote.status}
                </Badge>
              </Button>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {
            onViewChange('settings');
            setIsMobileOpen(false);
          }}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-screen w-80 bg-white border-r">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-80 h-full bg-white border-r">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
