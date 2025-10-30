// ./src/components/dashboard/DashboardOverview.tsx

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
  BarChart3, // Used for Acceptance Rate
  Menu,
  X,
  Clock,
  Users,
  LayoutDashboard,
  TrendingUp,
  BookOpenText,
  LifeBuoy,
  // DollarSign, // Removed as Total Monthly Premium is no longer used
  CheckCircle,
  Eye 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// FIX: Import the unified types from the central file
import { Agent, Quote } from '@/lib/types'; 

// Define a type for a Lucide icon component
type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

// ----------------------------------------------------------------------
// REMOVED: Local/Outdated UNIFIED TYPE DEFINITIONS
// The following interfaces were removed to use the central definition in '@/lib/types'
/*
interface Agent { ... } 
interface Quote { ... }
*/
// ----------------------------------------------------------------------


// Define the custom colors used in the Plurals design
const SIDEBAR_BG = 'bg-gray-900';
const ACCENT_TEXT = 'text-blue-500';
const ACCENT_HOVER = 'hover:bg-gray-800';
const CARD_BG = 'bg-white';

interface DashboardOverviewProps {
  quotes: Quote[];
  onNewQuote: () => void;
  onViewQuote: (quoteId: string) => void;
}

// Helper to calculate statistics
const calculateStats = (quotes: Quote[]) => {
  const totalQuotes = quotes.length;
  const draftQuotes = quotes.filter(q => q.status === 'draft').length;
  // NOTE: 'completed' status is now deprecated, but for robustness
  // we count both 'presented' and 'completed' as being 'out for review'
  const presentedQuotes = quotes.filter(q => q.status === 'presented' || q.status === 'completed').length;
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
  const quotesWithPremium = quotes.filter(q => q.packages && q.packages.length > 0);

  const totalPremium = quotesWithPremium.reduce((sum, q) => 
    sum + q.packages.reduce((pkgSum, pkg) => pkgSum + pkg.totalMonthlyPremium, 0), 0
  );

  const averagePremium = quotesWithPremium.length > 0 
    ? totalPremium / quotesWithPremium.length
    : 0;

  const acceptanceRate = totalQuotes > 0
    ? (acceptedQuotes / (acceptedQuotes + presentedQuotes)) * 100
    : 0;

  const latestQuotes = quotes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return {
    totalQuotes,
    draftQuotes,
    presentedQuotes,
    acceptedQuotes,
    averagePremium,
    acceptanceRate,
    latestQuotes,
  };
};


export function DashboardOverview({ quotes, onNewQuote, onViewQuote }: DashboardOverviewProps) {
  const {
    totalQuotes,
    draftQuotes,
    presentedQuotes,
    acceptedQuotes,
    averagePremium,
    acceptanceRate,
    latestQuotes,
  } = calculateStats(quotes);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80">Draft</Badge>;
      case 'presented':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100/80">Presented</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100/80">Accepted</Badge>;
      case 'completed':
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100/80">Completed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100/80">Unknown</Badge>;
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-gray-900">Dashboard Overview</h1>
        <Button 
          onClick={onNewQuote}
          className="bg-blue-600 text-white hover:bg-blue-700 transition duration-150 shadow-md font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Quote
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Quotes */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Quotes</CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalQuotes}</div>
            <p className="text-xs text-gray-500 mt-1">Total quotes created to date</p>
          </CardContent>
        </Card>

        {/* Quotes Accepted */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Quotes Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{acceptedQuotes}</div>
            <p className="text-xs text-green-600 mt-1">{presentedQuotes} quotes pending client decision</p>
          </CardContent>
        </Card>

        {/* Acceptance Rate */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Acceptance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{acceptanceRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Of all presented quotes</p>
          </CardContent>
        </Card>
        
        {/* Average Monthly Premium */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg Monthly Premium</CardTitle>
            {/* Using a generic money icon or similar if DollarSign is removed, e.g., TrendingUp */}
            <TrendingUp className="h-4 w-4 text-teal-600" /> 
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(averagePremium)}</div>
            <p className="text-xs text-gray-500 mt-1">Average premium of all quotes</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Quotes List */}
        <Card className="shadow-lg rounded-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {latestQuotes.length === 0 ? (
              <p className="text-gray-500">No recent quotes found. Start a new one!</p>
            ) : (
              <div className="space-y-3">
                {latestQuotes.map((quote) => (
                  <div 
                    key={quote.id} 
                    className="flex items-center justify-between p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 rounded-lg transition duration-150"
                    onClick={() => onViewQuote(quote.id)}
                  >
                    <div className="flex flex-col">
                      <p className="font-semibold text-gray-900">{quote.client.name}</p>
                      <span className="text-sm text-gray-500">
                        Updated: {new Date(quote.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(quote.status)}
                      <span className="text-lg font-bold text-teal-600">
                        ${quote.packages.reduce((sum, pkg) => sum + pkg.totalMonthlyPremium, 0).toLocaleString()} /mo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for secondary content/charts/quick actions */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start bg-blue-50 text-gray-900 hover:bg-indigo-100 rounded-lg shadow-sm font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              New Client Intake
            </Button>
            <Button className="w-full justify-start bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg shadow-sm font-semibold">
              <Clock className="w-4 h-4 mr-2" />
              Review Drafts ({draftQuotes})
            </Button>
            <Button className="w-full justify-start bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg shadow-sm font-semibold">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Full Analytics
            </Button>
            <Separator className='bg-gray-100'/>
             <p className='text-md text-gray-500 pt-2'>You have {presentedQuotes} quotes awaiting a client decision.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}