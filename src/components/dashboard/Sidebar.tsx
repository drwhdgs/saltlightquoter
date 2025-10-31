'use client';

import { useState } from 'react';

// Define a type for a Lucide icon component
type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

// --- Interface Definitions for Mock Components ---
interface ButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'ghost' | 'outline';
  size?: 'icon' | 'default';
  title?: string;
}

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

interface SeparatorProps {
  className?: string;
}
// --- End Interface Definitions ---


// Mocking external component imports to make the file self-contained and runnable
const Button = ({ onClick, children, className = '', title }: ButtonProps) => (
  <button 
    onClick={onClick} 
    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${className}`} 
    title={title}
  >
    {children}
  </button>
);

const Badge = ({ children, className = '' }: BadgeProps) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const Separator = ({ className = '' }: SeparatorProps) => <div className={`h-px bg-gray-200 ${className}`} />;

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
  Zap,
  Calendar,
  LifeBuoy,
  UserCircle
} from 'lucide-react';

// CORRECTED MOCK TYPES:
interface Agent { name: string; email: string; }
interface Quote { id: string; status: 'draft' | 'accepted' | 'completed' | 'presented'; } 

// Define explicit Tailwind classes used for the theme
const SIDEBAR_BG_CLASS = 'bg-[#1d2333]';
const ACTIVE_BG_CLASS = 'bg-gray-700/50';
const ACTIVE_TEXT_COLOR = 'text-white';

type ViewType = 'dashboard' | 'new-quote' | 'quotes' | 'clients' | 'settings' | 'edit-quote' | 'view-quote' | 'analytics' | 'support' | 'calendar';


// ----------------------------------------------------------------------
// SIDEBAR COMPONENT INTERFACES
// ----------------------------------------------------------------------

interface SidebarProps {
  agent: Agent;
  quotes: Quote[];
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onQuoteSelect: (quoteId: string) => void;
  onLogout: () => void;
}

// ----------------------------------------------------------------------
// SIDEBAR COMPONENT
// ----------------------------------------------------------------------

export function Sidebar({ agent, quotes, activeView, onViewChange, onQuoteSelect, onLogout }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // State to control the visibility of the Pro Features modal
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  // Count drafts for the badge
  const draftCount = quotes.filter(q => q.status === 'draft').length;
  
  // Define navigation items
  const navItems: Array<{ name: string; icon: IconComponent; view: ViewType; badge?: number }> = [
    { name: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
    { name: 'My Quotes', icon: FileText, view: 'quotes', badge: draftCount },
    { name: 'Analytics', icon: BarChart3, view: 'analytics' },
    { name: 'Calendar', icon: Calendar, view: 'calendar' },
  ];

  const secondaryItems: Array<{ name: string; icon: IconComponent; view: ViewType; badge?: number }> = [
    { name: 'Settings', icon: Settings, view: 'settings' },
  ];

  const handleViewChange = (view: ViewType) => {
    onViewChange(view);
    setIsMobileOpen(false); // Close mobile sidebar on navigation
  };
  
  // Modal component definition
  const ProFeaturesModal = () => (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsProModalOpen(false)} // Close when clicking outside
    >
      <div 
           className="relative w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl transform scale-100 transition-all duration-300"
           onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <Button 
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-transparent p-1 size-8"
            onClick={() => setIsProModalOpen(false)}
            title="Close"
            size="icon"
        >
            <X className="w-5 h-5" />
        </Button>

        <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-yellow-100 rounded-full mb-4 shadow-lg">
                <Zap className="w-8 h-8 text-yellow-500" />
            </div>
            
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                Pro Features Coming Soon!
            </h2>
            <p className="text-gray-600 mb-6 font-medium">
                We're actively developing advanced features like <br/> AI-powered analytics and unlimited client management.
            </p>
            <p className="text-sm text-gray-500">
                Check back soon for updates. We appreciate your patience and support!
            </p>
            <Button
                className="mt-6 w-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md"
                onClick={() => setIsProModalOpen(false)}
            >
                Got it!
            </Button>
        </div>
      </div>
    </div>
  );


  const SidebarContent = () => (
    <div className={`flex flex-col flex-1 p-4 ${SIDEBAR_BG_CLASS} h-full`}>
      {/* Logo Area */}
      <div className="flex items-center justify-center h-16 mb-4">
        <img
          src="/QuoteDeck2.png" 
          alt="QuoteDeck Logo"
          className="h-12 w-auto object-contain rounded-2xl"
        />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-2 py-2">
        
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <div
              key={item.view}
              onClick={() => handleViewChange(item.view)}
              className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors duration-150 group 
                          ${isActive 
                              ? `${ACTIVE_BG_CLASS} ${ACTIVE_TEXT_COLOR} font-semibold` 
                              : 'text-gray-300 hover:bg-gray-700/30'
                          }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'}`} />
              <span className="flex-1">{item.name}</span>
              
              {typeof item.badge === 'number' && item.badge > 0 && (
                <Badge className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5">
                  {item.badge}
                </Badge>
              )}
            </div>
          );
        })}

        <Separator className="bg-gray-700 my-4" />

        {secondaryItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <div
              key={item.view}
              onClick={() => handleViewChange(item.view)}
              className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors duration-150 group 
                          ${isActive 
                              ? `${ACTIVE_BG_CLASS} ${ACTIVE_TEXT_COLOR} font-semibold` 
                              : 'text-gray-300 hover:bg-gray-700/30'
                          }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'}`} />
              <span className="flex-1">{item.name}</span>
            </div>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      <div className="mt-auto p-4 bg-gray-800 rounded-xl text-center shadow-inner">
        <Zap className="w-6 h-6 mx-auto text-yellow-400 mb-2" />
        <h3 className="font-bold text-white text-sm">Unlock Pro Features</h3>
        <p className="text-xs text-gray-400 mt-1">Access advanced analytics and unlimited clients.</p>
        <Button 
          // 2. Added onClick handler to open the modal
          onClick={() => setIsProModalOpen(true)}
          className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Upgrade Now
        </Button>
      </div>


      {/* User Profile and Logout */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center space-x-3">
            <UserCircle className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-white">{agent.name}</p>
              <p className="text-xs text-gray-400 truncate">{agent.email}</p>
            </div>
          </div>
          <Button
              className="flex-shrink-0 w-8 h-8 text-gray-400 hover:bg-gray-700 hover:text-white bg-transparent"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation(); 
                  onLogout();
              }}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Menu Button - Fixed to the top left */}
      <Button
        className={`lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white border-gray-700 shadow-md`}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        title={isMobileOpen ? "Close Menu" : "Open Menu"}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Desktop Sidebar (Pill Rounding Applied) */}
      <div className={`hidden lg:flex flex-col h-screen w-64 z-30
                      rounded-r-3xl overflow-hidden shadow-2xl`}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar (Pill Rounding Applied) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black bg-opacity-30" 
            onClick={() => setIsMobileOpen(false)}
          ></div>
          <div className={`relative w-64 h-full ${SIDEBAR_BG_CLASS} rounded-r-3xl shadow-2xl`}>
            <SidebarContent />
          </div>
        </div>
      )}
      
      {/* 4. Conditionally Render the Modal */}
      {isProModalOpen && <ProFeaturesModal />}
    </>
  );
}
