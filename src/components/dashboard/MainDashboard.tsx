// ./src/components/dashboard/MainDashboard.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
// Assuming these imports are resolved in the user's environment
import { Sidebar } from './Sidebar';
import { DashboardOverview } from './DashboardOverview';
import { QuoteWizard } from '../quotes/QuoteWizard';
import { QuotesList } from '../quotes/QuotesList';
import { EmailQuoteModal } from '../quotes/EmailQuoteModal';
import { Agent, Quote } from '@/lib/types';
import { getQuotes, clearCurrentAgent, getQuoteById, generateShareableLink } from '@/lib/storage';
import { Button } from '@/components/ui/button'; // Assuming a Button component like the one used in DashboardOverview

interface MainDashboardProps {
  agent: Agent;
  onLogout: () => void;
}

type DashboardView = 'dashboard' | 'new-quote' | 'quotes' | 'settings' | 'edit-quote' | 'view-quote' | 'analytics' | 'support';

export function MainDashboard({ agent, onLogout }: MainDashboardProps) {
  const [activeView, setActiveView] = useState<DashboardView>('dashboard');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const loadQuotes = useCallback(() => {
    const agentQuotes = getQuotes(agent.id);
    setQuotes(agentQuotes);
  }, [agent.id]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const handleLogout = () => {
    clearCurrentAgent();
    onLogout();
  };

  const handleNewQuote = () => {
    setSelectedQuoteId(null);
    setActiveView('new-quote');
  };

  const handleViewQuote = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    setActiveView('view-quote');
  };

  const handleEditQuote = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    setActiveView('edit-quote');
  };

  const handleQuoteComplete = (quote: Quote) => {
    loadQuotes();
    // Go directly to the new quote's details.
    setSelectedQuoteId(quote.id);
    setActiveView('view-quote');
  };

  const handleQuoteSelect = (quoteId: string) => {
    const quote = getQuoteById(quoteId);
    if (quote) {
      if (quote.status === 'completed' || quote.status === 'presented') {
        handleViewQuote(quoteId);
      } else {
        handleEditQuote(quoteId);
      }
    }
  };

  useEffect(() => {
    if (activeView === 'view-quote' || activeView === 'new-quote' || activeView === 'edit-quote') {
      // Scroll to top whenever the view is a form or quote details
      window.scrollTo(0, 0);
    }
  }, [activeView, selectedQuoteId]);

  const handleViewChange = (view: string) => {
    setActiveView(view as DashboardView);
    if (view !== 'edit-quote' && view !== 'view-quote') {
      setSelectedQuoteId(null);
    }
  };

  const handleEmailClient = (quote: Quote) => {
    setSelectedQuote(quote);
    setEmailModalOpen(true);
  };

  // Helper to safely copy text without using alert()
  const copyToClipboard = (text: string, successMessage: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      // Use hidden styling to avoid visual disruption
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      // Use document.execCommand('copy') for better iframe compatibility
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (successful) {
        console.log(successMessage);
      } else {
        console.error('Failed to copy text using execCommand.');
      }
    } catch (err: unknown) { // FIX: Changed 'any' to 'unknown'
      if (err instanceof Error) {
        console.error('Error copying text:', err.message);
      } else {
        console.error('An unknown error occurred while copying text.');
      }
    }
  };


  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardOverview
            quotes={quotes}
            onNewQuote={handleNewQuote}
            onViewQuote={handleViewQuote}
          />
        );

      case 'new-quote':
        // Updated wrapper class to match the clean aesthetic
        return (
          <div className="p-8 bg-white rounded-xl shadow-xl">
             <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">Create New Quote</h1>
             <QuoteWizard
                agent={agent}
                onComplete={handleQuoteComplete}
                onCancel={() => setActiveView('dashboard')}
              />
          </div>
        );

      case 'edit-quote':
        if (selectedQuoteId) {
          const quote = getQuoteById(selectedQuoteId);
          if (quote) {
            // Updated wrapper class to match the clean aesthetic
            return (
              <div className="p-8 bg-white rounded-xl shadow-xl">
                 <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">Edit Quote: {quote.client.name}</h1>
                 <QuoteWizard
                    agent={agent}
                    existingQuote={quote}
                    onComplete={handleQuoteComplete}
                    onCancel={() => setActiveView('quotes')}
                  />
              </div>
            );
          }
        }
        return <div className="p-8 bg-white rounded-xl shadow-xl text-center text-red-600 font-semibold">Quote not found</div>;

      case 'quotes':
        return (
          <QuotesList
            quotes={quotes}
            onNewQuote={handleNewQuote}
            onViewQuote={handleViewQuote}
            onEditQuote={handleEditQuote}
            onRefresh={loadQuotes}
          />
        );

      case 'view-quote':
        if (selectedQuoteId) {
          const quote = getQuoteById(selectedQuoteId);
          if (quote) {
            // Use the shareableLink from the quote or generate it
            const currentShareableLink = quote.shareableLink || generateShareableLink(quote);

            return (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 border-gray-200">
                  <h1 className="text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">Quote Details: {quote.client.name}</h1>
                  <div className="flex flex-wrap gap-3">
                    {/* Updated button styles to match DashboardOverview's CTA style (rounded-lg, shadow, hover effect) */}
                    <Button
                      onClick={() => handleEditQuote(selectedQuoteId)}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-150 font-semibold shadow-md"
                    >
                      Edit Quote
                    </Button>
                    <Button
                      onClick={() => handleEmailClient(quote)}
                      className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition duration-150 font-semibold shadow-md"
                    >
                      Message Client
                    </Button>
                    <Button
                      onClick={() => {
                        copyToClipboard(currentShareableLink, 'Shareable link copied to clipboard!');
                      }}
                      className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-150 font-semibold"
                    >
                      Copy Client Link
                    </Button>
                    <Button
                      onClick={() => {
                        window.open(currentShareableLink, '_blank');
                      }}
                      className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-150 font-semibold"
                    >
                      Preview
                    </Button>
                  </div>
                </div>

                {/* Quote Details View Card - Elevated and organized */}
                <div className="bg-white rounded-xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">Client Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Name</label>
                      <p className="text-xl font-semibold text-gray-900 mt-1">{quote.client.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Email</label>
                      <p className="text-xl font-semibold text-gray-900 mt-1">{quote.client.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Phone</label>
                      <p className="text-xl font-semibold text-gray-900 mt-1">{quote.client.phone}</p>
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">ZIP Code</label>
                      <p className="text-xl font-semibold text-gray-900 mt-1">{quote.client.zipCode}</p>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">Packages ({quote.packages.length})</h2>
                  <div className="space-y-6">
                    {quote.packages.map((pkg) => (
                      <div key={pkg.id} className="border border-blue-200 rounded-xl p-6 bg-blue-50 shadow-md">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-extrabold text-gray-900">{pkg.name}</h3>
                          <span className="text-2xl font-bold text-teal-600 ml-4">
                            ${pkg.totalMonthlyPremium.toLocaleString()}/mo
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4 text-sm">{pkg.description}</p>
                        <div className="space-y-2 pt-3 border-t border-blue-100">
                          {pkg.plans.map((plan) => (
                            <div key={plan.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                              <span className="font-medium text-gray-800">{plan.name}</span>
                              <span className="text-teal-600 font-semibold">${plan.monthlyPremium}/mo</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>


                  <div className="mt-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wider">Shareable Client Link</label>
                    <div className="flex items-center space-x-3 mt-2">
                      <input
                        type="text"
                        value={currentShareableLink}
                        readOnly
                        className="flex-1 p-3 border border-gray-300 rounded-lg bg-white text-sm"
                      />
                      {/* Updated Button component */}
                      <Button
                        onClick={() => {
                          copyToClipboard(currentShareableLink, 'Link copied to clipboard!');
                        }}
                        className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-150 font-semibold"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 p-5 bg-teal-50 rounded-xl border border-teal-200">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wider">Send Quote via Email</label>
                    <div className="flex items-center space-x-3 mt-2">
                      <input
                        type="text"
                        value={quote.client.email}
                        readOnly
                        className="flex-1 p-3 border border-teal-300 rounded-lg bg-white text-sm"
                      />
                      {/* Updated Button component */}
                      <Button
                        onClick={() => handleEmailClient(quote)}
                        className="px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition duration-150 font-semibold"
                      >
                        📧 Send Email
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      This will open an email compose dialog with a pre-written message and the quote link.
                    </p>
                  </div>
                </div>
              </div>
            );
          }
        }
        return <div className="p-8 bg-white rounded-xl shadow-xl text-center text-red-600 font-semibold">Quote not found</div>;

      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold text-gray-900">Settings</h1>
            {/* Adopted Card style (rounded-xl, shadow-xl) */}
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">Agent Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Name</label>
                  <p className="text-xl font-semibold text-gray-900 mt-1">{agent.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Email</label>
                  <p className="text-xl font-semibold text-gray-900 mt-1">{agent.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Account Created</label>
                  <p className="text-xl font-semibold text-gray-900 mt-1">{new Date(agent.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h3>
                {/* Updated Button component */}
                <Button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150 font-semibold shadow-md"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        );

      // Add simple screens for 'analytics' and 'support' to prevent errors from Sidebar navigation
      case 'analytics':
        return (
          <div className="p-8 bg-white rounded-xl shadow-xl min-h-[400px]">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Analytics</h1>
            <p className="text-gray-600">Analytics data will be displayed here.</p>
          </div>
        );
      case 'support':
        return (
          <div className="p-8 bg-white rounded-xl shadow-xl min-h-[400px]">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Support</h1>
            <p className="text-gray-600">Contact information and support resources will be available here.</p>
          </div>
        );

      default:
        return <DashboardOverview quotes={quotes} onNewQuote={handleNewQuote} onViewQuote={handleViewQuote} />;
    }
  };

  return (
    // Updated flex parent to use the light background color
    <div className="flex h-screen bg-[#f8f9fb]">
      <Sidebar
        agent={agent}
        quotes={quotes}
        activeView={activeView}
        onViewChange={handleViewChange}
        onQuoteSelect={handleQuoteSelect}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <main className="flex-1 overflow-auto">
          {/* Main content padding adjusted to match DashboardOverview's spacing */}
          <div className="p-6 lg:p-10">
            {renderMainContent()}
          </div>
        </main>
      </div>

      {/* Email Modal */}
      {selectedQuote && (
        <EmailQuoteModal
          isOpen={emailModalOpen}
          onClose={() => {
            setEmailModalOpen(false);
            setSelectedQuote(null);
          }}
          quote={selectedQuote}
        />
      )}
    </div>
  );
}