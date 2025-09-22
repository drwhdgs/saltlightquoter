'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardOverview } from './DashboardOverview';
import { QuoteWizard } from '../quotes/QuoteWizard';
import { QuotesList } from '../quotes/QuotesList';
import { EmailQuoteModal } from '../quotes/EmailQuoteModal';
import { Agent, Quote } from '@/lib/types';
import { getQuotes, clearCurrentAgent, getQuoteById, generateShareableLink } from '@/lib/storage';

interface MainDashboardProps {
  agent: Agent;
  onLogout: () => void;
}

type DashboardView = 'dashboard' | 'new-quote' | 'quotes' | 'settings' | 'edit-quote' | 'view-quote';

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
    setActiveView('quotes');
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
        return (
          <QuoteWizard
            agent={agent}
            onComplete={handleQuoteComplete}
            onCancel={() => setActiveView('dashboard')}
          />
        );

      case 'edit-quote':
        if (selectedQuoteId) {
          const quote = getQuoteById(selectedQuoteId);
          if (quote) {
            return (
              <QuoteWizard
                agent={agent}
                existingQuote={quote}
                onComplete={handleQuoteComplete}
                onCancel={() => setActiveView('quotes')}
              />
            );
          }
        }
        return <div>Quote not found</div>;

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
            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">Quote Details</h1>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEditQuote(selectedQuoteId)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit Quote
                    </button>
                    <button
                      onClick={() => handleEmailClient(quote)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Message Client
                    </button>
                    <button
                      onClick={() => {
                        // Ensure the quote has a proper shareable link
                        let shareableLink = quote.shareableLink;
                        if (!shareableLink) {
                          shareableLink = generateShareableLink(quote);
                        }
                        navigator.clipboard.writeText(shareableLink);
                        alert('Shareable link copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Copy Client Link
                    </button>
                    <button
    onClick={() => {
      const shareableLink = quote.shareableLink || generateShareableLink(quote);
      window.open(shareableLink, '_blank');
    }}
    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
  >
    Preview
  </button>
                  </div>
                </div>

                {/* Quote Details View */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Client Information</h2>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900">{quote.client.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{quote.client.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{quote.client.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">ZIP Code</label>
                      <p className="text-gray-900">{quote.client.zipCode}</p>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold mb-4">Packages ({quote.packages.length})</h2>
                  <div className="space-y-4">
                    {quote.packages.map((pkg) => (
                      <div key={pkg.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-semibold">{pkg.name}</h3>
                          <span className="text-lg font-bold text-green-600">
                            ${pkg.totalMonthlyPremium.toLocaleString()}/mo
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{pkg.description}</p>
                        <div className="grid gap-2">
                          {pkg.plans.map((plan) => (
                            <div key={plan.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="font-medium">{plan.name}</span>
                              <span className="text-green-600">${plan.monthlyPremium}/mo</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>


                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Shareable Client Link:</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="text"
                        value={quote.shareableLink || generateShareableLink(quote)}
                        readOnly
                        className="flex-1 p-2 border rounded bg-white"
                      />
                      <button
                        onClick={() => {
                          const shareableLink = quote.shareableLink || generateShareableLink(quote);
                          navigator.clipboard.writeText(shareableLink);
                          alert('Link copied to clipboard!');
                        }}
                        className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Email Quote to Client:</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="text"
                        value={quote.client.email}
                        readOnly
                        className="flex-1 p-2 border rounded bg-white"
                      />
                      <button
                        onClick={() => handleEmailClient(quote)}
                        className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        📧 Send Email
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This will open an email compose dialog with a pre-written message and the quote link.
                    </p>
                  </div>
                </div>
              </div>
            );
          }
        }
        return <div>Quote not found</div>;

      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Agent Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900">{agent.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{agent.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Created</label>
                  <p className="text-gray-900">{new Date(agent.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return <DashboardOverview quotes={quotes} onNewQuote={handleNewQuote} onViewQuote={handleViewQuote} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
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
          <div className="p-6 lg:p-8">
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
