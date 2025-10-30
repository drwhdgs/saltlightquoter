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
  BarChart3,
  Menu,
  X,
  Clock,
  Users,
  LayoutDashboard,
  TrendingUp,
  BookOpenText,
  LifeBuoy,
  DollarSign,
  CheckCircle,
  Eye 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define a type for a Lucide icon component
type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

// ----------------------------------------------------------------------
// UNIFIED TYPE DEFINITIONS
// ----------------------------------------------------------------------
interface Agent {
    id: string;
    name: string;
    email: string;
}
// This definition is now used by both Sidebar and DashboardOverview components
interface Quote {
  id: string;
  // Unified status types based on the Dashboard logic
  status: 'draft' | 'completed' | 'presented';
  updatedAt: string;
  client: {
    name: string;
  };
  packages: {
    totalMonthlyPremium: number;
  }[];
}


// Define the custom colors used in the Plurals design
const SIDEBAR_BG = 'bg-[#ffffff]';
const ACTIVE_BG = 'bg-[#f8f9fb]';
const CTA_BUTTON_BG = 'bg-blue-500';

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

  // 'Draft' and 'Presented' are considered quotes that need action or follow-up.
  const activeQuotesCount = quotes.filter(q => q.status === 'draft' || q.status === 'presented').length;

  // Helper component for the navigation links to handle the active state logic
  const NavigationLink = ({
    view,
    icon: Icon,
    label,
    badge,
    onClick
  }: {
    view: string;
    icon: IconComponent; // FIX: Use IconComponent instead of 'any'
    label: string;
    badge?: number;
    onClick: () => void;
  }) => {
    const isActive = activeView === view;
    return (
      <Button
        variant='ghost'
        className={`
          w-full justify-start font-medium transition-colors rounded-lg h-10 px-3 text-sm 
          ${isActive 
            ? `${ACTIVE_BG} text-gray-900 hover:${ACTIVE_BG}` 
            : `text-gray-700 hover:bg-gray-100`
          }`}
        onClick={() => {
          onClick();
          setIsMobileOpen(false);
        }}
      >
        <Icon className="w-5 h-5 mr-3" />
        {label}
        {badge !== undefined && badge > 0 && (
          <Badge
            className={`
              ml-auto px-2 py-0.5 text-xs font-semibold rounded-full min-w-[2rem] 
              ${isActive ? 'bg-white text-gray-700 hover:bg-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
          >
            {badge}
          </Badge>
        )}
      </Button>
    );
  };
    
  // Function to get agent initials
  const getAgentInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };


  const SidebarContent = () => (
    // Sidebar Background
    <div className={`flex flex-col h-full w-full ${SIDEBAR_BG} text-gray-700 shadow-xl border-r border-gray-100`}>
      
      {/* --- TOP: Logo/Branding --- */}
      <div className="p-4 pt-4 pb-2 flex items-center">
        {/* Placeholder for the logo from the image URL, adjusted for size */}
        {/* NOTE: The original component used a placeholder path "/Untitled-removebg-preview.png". 
           If the user wants to use a specific uploaded image, the path would need adjustment, 
           but since this is a React component and not an HTML file, the path is left as-is for mock data. */}
        <div className="w-[180px] h-[30px] flex items-center">
             <span className="text-xl font-bold text-indigo-600">QuoteDeck</span>
        </div>
      </div>
      <Separator className="bg-gray-200" />


      {/* Navigation */}
      <div className="flex-1 p-3 pt-4 space-y-1 overflow-y-auto">
        {/* Menu Header - Kept for structure, adjusted style to fit the light theme */}
        <h3 className="text-sm font-semibold text-gray-500 px-3 pt-2 pb-1 uppercase tracking-widest">
          Menu
        </h3>

        {/* Links */}
        <NavigationLink
          view="new-quote"
          icon={BookOpenText}
          label="Create a Quote"
          onClick={() => onViewChange('new-quote')}
        />

        <NavigationLink
          view="dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          onClick={() => onViewChange('dashboard')}
        />

        <NavigationLink
          view="analytics"
          icon={BarChart3}
          label="Analytics"
          onClick={() => onViewChange('analytics')}
        />
        
        <NavigationLink
          view="quotes"
          icon={FileText}
          label="My Quotes"
          badge={activeQuotesCount} // Showing count of quotes needing action (Drafts + Presented)
          onClick={() => onViewChange('quotes')}
        />

        <Separator className="my-4 bg-gray-100" />

        <NavigationLink
          view="settings"
          icon={Settings}
          label="Settings"
          onClick={() => onViewChange('settings')}
        />
        
        <NavigationLink
          view="support"
          icon={LifeBuoy}
          label="Support"
          onClick={() => onViewChange('support')}
        />

      </div>

      {/* --- BOTTOM: CTA, Separator, and User/Account Info --- */}
      <div className="p-4 border-t border-gray-100">
        
        {/* Simulated Upgrade to Premium Section */}
        <div className="p-4 m-0 mb-4 rounded-xl relative bg-gray-50 border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-800 relative">Upgrade to Premium</h4>
            <p className="text-xs text-gray-500 mt-1 mb-3 relative">
                Go Pro to unlock all features
            </p>
            <Button className={`w-full ${CTA_BUTTON_BG} text-white font-semibold hover:bg-blue-600 transition-colors rounded-lg relative h-8 text-sm`}>
                Upgrade now!
            </Button>
        </div>

        {/* User/Agency Footer Section (Always at the bottom) */}
        <div className="p-2 pt-1">
          {/* Agent Info Block (with an implicit click area) */}
          <div className="p-2 flex items-center justify-between rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => onViewChange('settings')}>
            <div className="flex items-center gap-3">
              {/* Agent Initials */}
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-sm text-gray-700">
                {getAgentInitials(agent.name)}
              </div>
              <div className='flex flex-col text-left overflow-hidden'>
                <span className="text-sm font-semibold text-gray-800 truncate">{agent.name}</span>
                <span className="text-xs text-gray-500 truncate">{agent.email}</span>
              </div>
            </div>
            {/* Logout Action button */}
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 w-8 h-8 text-gray-500 hover:bg-gray-200/50"
              onClick={(e) => {
                  e.stopPropagation(); // Prevents the parent div's click event (onViewChange)
                  onLogout();
              }}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Menu Button - Styled to better fit the new theme */}
      <Button
        variant="outline"
        size="icon"
        className={`lg:hidden fixed top-4 left-4 z-50 ${SIDEBAR_BG} text-gray-700 border-gray-200 shadow-md`}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Desktop Sidebar (Width changed to w-64) */}
      <div className="hidden lg:flex flex-col h-screen w-64 border-r border-gray-200 z-30">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar (Width changed to w-64) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black bg-opacity-30" // Reduced opacity for a cleaner overlay
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-64 h-full border-r">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}

// ----------------------------------------------------------------------
// DashboardOverview Component
// ----------------------------------------------------------------------

interface DashboardOverviewProps {
  quotes: Quote[];
  onNewQuote: () => void;
  onViewQuote: (quoteId: string) => void;
}

// Props for the StatCard component
interface StatCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: IconComponent; // FIX: Use the defined IconComponent type
  iconBgClass: string;
  iconColorClass: string;
}

export function DashboardOverview({ quotes, onNewQuote, onViewQuote }: DashboardOverviewProps) {
  // Calculate statistics
  const totalQuotes = quotes.length;
  const draftQuotes = quotes.filter(q => q.status === 'draft').length;
  const presentedQuotes = quotes.filter(q => q.status === 'presented').length;
  const completedQuotes = quotes.filter(q => q.status === 'completed').length; 

  const totalRevenue = quotes
    .filter(q => q.status === 'completed')
    .reduce((sum, quote) => {
      return sum + quote.packages.reduce((packageSum, pkg) => packageSum + pkg.totalMonthlyPremium, 0);
    }, 0);

  const avgQuoteValue = totalQuotes > 0
    ? quotes.reduce((sum, quote) => {
        return sum + quote.packages.reduce((packageSum, pkg) => packageSum + pkg.totalMonthlyPremium, 0);
      }, 0) / totalQuotes
    : 0;

  // Recent activity
  const recentQuotes = quotes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      // Status badge colors remain clear and distinct
      case 'draft': return 'bg-yellow-50 text-yellow-700 font-medium border border-yellow-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 font-medium border border-emerald-200';
      case 'presented': return 'bg-indigo-50 text-indigo-700 font-medium border border-indigo-200';
      default: return 'bg-gray-50 text-gray-700 font-medium border border-gray-200';
    }
  };

  const getStatusIcon = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return <Clock className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'presented': return <Eye className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };
  
  // --- REVISED STAT CARD COMPONENT ---
  // FIX: Apply StatCardProps
  const StatCard = ({ title, value, subtext, icon: Icon, iconBgClass, iconColorClass }: StatCardProps) => (
    <Card className="shadow-md rounded-xl transition-shadow hover:shadow-lg border border-gray-100 bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</CardTitle>
        {/* Subtle, colored icon badge */}
        <div className={`p-2 rounded-full ${iconBgClass} flex-shrink-0`}>
            <Icon className={`h-5 w-5 ${iconColorClass}`} />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Slightly reduced size for the main value */}
        <div className="text-4xl font-extrabold text-gray-900 mb-1">{value}</div>
        <p className="text-sm text-gray-500 mt-1">{subtext}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-10 bg-[#f8f9fb] min-h-screen p-10">
      {/* Header and CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-base text-gray-500 mt-1">
            Overview of your insurance quotes and performance


          </p>
        </div>
        <Button onClick={onNewQuote} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-2.5 font-bold transition-transform transform hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="w-5 h-5" />
          Create New Quote
        </Button>
      </div>

      {/* Statistics Cards - Now using the new clean style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Quotes"
          value={totalQuotes.toString()}
          subtext={`${draftQuotes} Drafts, ${completedQuotes} Completed`}
          icon={FileText}
          iconBgClass="bg-blue-100"
          iconColorClass="text-gray-700"
        />

        <StatCard
          title="Monthly Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          subtext={`Based on ${completedQuotes} completed quotes`}
          icon={DollarSign}
          iconBgClass="bg-emerald-100" // Success color for revenue
          iconColorClass="text-emerald-600"
        />

        <StatCard
          title="Avg Quote Value"
          value={`$${avgQuoteValue.toFixed(0)}`}
          subtext="Average monthly premium quoted"
          icon={TrendingUp}
          iconBgClass="bg-yellow-100"
          iconColorClass="text-yellow-600"
        />

        <StatCard
          title="Presentations Sent"
          value={presentedQuotes.toString()}
          subtext={`${completedQuotes} accepted policies`}
          icon={Users}
          iconBgClass="bg-blue-100"
          iconColorClass="text-gray-600"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg rounded-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3">
              Recent Quotes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentQuotes.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-b-xl">
                <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No recent quotes found</h3>
                <p className="text-gray-500 mb-4 text-sm">Create your first insurance quote to see activity here.</p>
                <Button onClick={onNewQuote} className="bg-indigo-600 hover:bg-indigo-700 text-sm">Create First Quote</Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    // Apply a clean, subtle hover effect to mimic the modern UI image style
                    className="flex items-center justify-between px-6 py-4 transition duration-200 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onViewQuote(quote.id)}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Client Initial/Icon Block */}
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900">
                          {quote.client.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Last Updated: {new Date(quote.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {/* Status Badge */}
                      <Badge className={`${getStatusColor(quote.status)} text-xs uppercase font-bold tracking-wider flex items-center gap-1 h-6`}>
                        {getStatusIcon(quote.status)}
                        {quote.status}
                      </Badge>
                      {/* Premium Value */}
                      <span className="font-bold text-base text-emerald-600">
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
             <p className='text-xs text-gray-500 pt-2'>You have {presentedQuotes} quotes awaiting a client decision.</p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}