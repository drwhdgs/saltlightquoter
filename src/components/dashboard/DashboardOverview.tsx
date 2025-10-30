'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Plus,
  BarChart3,
  Users,
  TrendingUp,
  CheckCircle,
  MessageSquare, // Used for Follow Up button
  PhoneCall, // Used for Follow Up card icon
  Pencil, // Used for Drafts button
  User, // Icon for Assigned Agent
  PackageOpen, // NEW ICON for packages
  Layers // NEW ICON for Review Pipeline
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// FIX: Import the unified types from the central file
import { Agent, Quote } from '@/lib/types'; 

// Define a type for a Lucide icon component
type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

// Define the custom colors used in the Plurals design
const ACCENT_TEXT = 'text-blue-500';

// --- INTERFACE DEFINITION ---
interface DashboardOverviewProps {
  quotes: Quote[];
  onNewQuote: () => void;
  onViewQuote: (quoteId: string) => void;
  onReviewFollowUps: () => void; 
}

// --- HELPER FUNCTION: Calculate all Dashboard Stats ---
const calculateStats = (quotes: Quote[]) => {
  const totalQuotes = quotes.length;
  const draftQuotes = quotes.filter(q => q.status === 'draft').length;
  const presentedQuotes = quotes.filter(q => q.status === 'presented' || q.status === 'completed');
  const presentedQuotesCount = presentedQuotes.length;

  const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;

  // Calculate Acceptance Rate: Accepted / (Accepted + Presented)
  const acceptanceRate = (acceptedQuotes + presentedQuotesCount) > 0
    ? (acceptedQuotes / (acceptedQuotes + presentedQuotesCount)) * 100
    : 0;

  const latestQuotes = quotes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // === FOLLOW-UP LOGIC: Quotes Presented > 3 Days Ago ===
  const FOLLOW_UP_THRESHOLD_DAYS = 3;
  const msInDay = 1000 * 60 * 60 * 24;

  const quotesNeedingFollowUp = presentedQuotes.filter(q => {
    // We treat 'updatedAt' as the last time the quote was interacted with (presented or modified).
    const daysSinceUpdate = (new Date().getTime() - new Date(q.updatedAt).getTime()) / msInDay;
    return daysSinceUpdate >= FOLLOW_UP_THRESHOLD_DAYS;
  }).length;
  // ========================================================

  return {
    totalQuotes,
    draftQuotes,
    presentedQuotesCount,
    acceptedQuotes,
    acceptanceRate,
    latestQuotes,
    quotesNeedingFollowUp,
  };
};

// --- COMPONENT: DashboardOverview ---
export function DashboardOverview({ quotes, onNewQuote, onViewQuote, onReviewFollowUps }: DashboardOverviewProps) {
  const {
    totalQuotes,
    draftQuotes,
    presentedQuotesCount,
    acceptedQuotes,
    acceptanceRate,
    latestQuotes,
    quotesNeedingFollowUp,
  } = calculateStats(quotes);

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

  // Helper to format the list of packages
  const getPackageSummary = (quote: Quote) => {
    if (!quote.packages || quote.packages.length === 0) {
      return 'No Packages';
    }
    // Get the names of the first two packages, join them, and add '...' if there are more
    const packageNames = quote.packages.slice(0, 2).map(pkg => pkg.name).join(', ');
    return quote.packages.length > 2 ? `${packageNames}, +${quote.packages.length - 2} more` : packageNames;
  };


  return (
    <div className="space-y-10">
      {/* HEADER & NEW QUOTE BUTTON */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-gray-900">Dashboard Overview</h1>
        <Button 
          onClick={onNewQuote}
          className="bg-blue-500 text-white hover:bg-blue-600 transition duration-150 shadow-lg font-semibold h-12 px-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Quote
        </Button>
      </div>

      {/* PRIMARY ANALYTICS CARDS (4-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. Total Quotes */}
        <Card className="shadow-md rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Quotes</CardTitle>
            <FileText className="h-6 w-6 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalQuotes}</div>
            <p className="text-xs text-gray-500 mt-1">Total quotes created to date</p>
          </CardContent>
        </Card>

        {/* 2. Quotes Accepted (Success Metric) */}
        <Card className="shadow-md rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Quotes Accepted</CardTitle>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{acceptedQuotes}</div>
            <p className="text-xs text-green-600 mt-1">{presentedQuotesCount} pending client decision</p>
          </CardContent>
        </Card>

        {/* 3. Acceptance Rate (Performance Metric) */}
        <Card className="shadow-md rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Acceptance Rate</CardTitle>
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{acceptanceRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Of all presented quotes</p>
          </CardContent>
        </Card>
        
        {/* 4. Quotes Needing Follow-Up (Action Metric - The Reminder) */}
        <Card className="shadow-md rounded-xl"> 
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Follow Ups</CardTitle>
            <PhoneCall className="h-6 w-6 text-red-500" /> 
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{quotesNeedingFollowUp}</div>
            <p className="text-xs text-gray-600 mt-1">Quotes overdue for client follow-up</p>
          </CardContent>
        </Card>
      </div>

      {/* RECENT ACTIVITY AND QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Quotes List (Left Panel) */}
        <Card className="shadow-xl rounded-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Recent Activity</CardTitle>
            <p className="text-sm text-gray-500">Your most recently updated quotes</p>
          </CardHeader>
          <CardContent>
            {latestQuotes.length === 0 ? (
              <p className="text-gray-500 py-4">No recent quotes found. Click 'Create New Quote' to start your pipeline!</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {latestQuotes.map((quote) => (
                  <div 
                    key={quote.id} 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50/50 rounded-lg transition duration-150"
                  >
                    {/* Left Side: Client Name, Assigned Agent, and Packages */}
                    <div 
                        className="flex flex-col flex-grow min-w-0"
                        onClick={() => onViewQuote(quote.id)}
                    >
                      <p className="font-bold text-lg text-gray-900 truncate">{quote.client.name}</p>
                      <div className="space-y-1 mt-1">
                        {/* Packages Summary */}
                        <span className="text-xs text-gray-600 flex items-center bg-gray-50 p-1 rounded-md max-w-fit">
                          <PackageOpen className="w-3 h-3 mr-1 text-teal-600" />
                          Packages: {getPackageSummary(quote)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Right Side: Status, Last Update, and Action Button Group */}
                    <div className="flex items-center space-x-6 ml-4 min-w-max">
                      
                      {/* Status and Last Update (Compact Data Display) */}
                      <div className="flex flex-col items-end">
                        <div className="mb-1">{getStatusBadge(quote.status)}</div>
                        <span className="text-xs text-gray-500">
                          Last Activity: {new Date(quote.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* CONDITIONAL FOLLOW UP BUTTON */}
                      {(quote.status === 'presented' || quote.status === 'completed') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50 font-semibold"
                          onClick={(e) => {
                            e.stopPropagation(); 
                            onViewQuote(quote.id); // Navigate to the quote detail page
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Follow Up
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions (Right Panel - REVISED) */}
        <Card className="shadow-xl rounded-xl">
          <CardHeader>
            {/* Renamed for professional flow management */}
            <CardTitle className="text-xl font-bold text-gray-800">Pipeline Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <Separator className='bg-gray-100'/>
            
             <Button 
              onClick={onReviewFollowUps}
              // Conditional styling for urgency
              className={`w-full justify-start font-semibold transition duration-150 ${quotesNeedingFollowUp > 0 ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
            >
              <PhoneCall className="w-4 h-4 mr-2" />
              Review Overdue Follow Ups ({quotesNeedingFollowUp})
            </Button>
            
            {/* 3. View Full Pipeline (New/Replaced General Action) */}
            <Button className="w-full justify-start bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg shadow-sm font-semibold">
              <Layers className="w-4 h-4 mr-2" />
              View Full Quote Pipeline
            </Button>

            {/* 4. View Full Analytics (Reporting/Reporting) */}
            <Button className="w-full justify-start bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg shadow-sm font-semibold">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Performance Analytics
            </Button>
            
            <Separator className='bg-gray-100'/>
             <p className='text-sm text-gray-500 pt-2'>You have {presentedQuotesCount} opportunities currently pending</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}