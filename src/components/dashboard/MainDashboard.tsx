'use client';

import { useState, useEffect, useCallback } from 'react';
// Assuming these imports are resolved in the user's environment
import { Sidebar } from './Sidebar';
import { DashboardOverview } from './DashboardOverview';
import { QuoteWizard } from '../quotes/QuoteWizard';
import { QuotesList } from '../quotes/QuotesList';
import { EmailQuoteModal } from '../quotes/EmailQuoteModal';
import { ClientsList } from '../client/ClientsList';
// UPDATED: Corrected import path and component name
import { CalendarPage } from '../dashboard/Calendar'; 
// UPDATED: Import the full Quote and Client type
import { Agent, Quote, Client } from '@/lib/types';
import { 
  getQuotes, 
  clearCurrentAgent, 
  getQuoteById, 
  generateShareableLink, 
  updateQuote, 
  updateClientInQuotes 
} from '@/lib/storage';
import { Button } from '@/components/ui/button'; 
// 🔥 NEW: Import the ComingSoonPopup component
import { ComingSoonPopup } from '../dashboard/ComingSoonPopup'; 
// 🔥 NEW: Import the AgentSettings component - ASSUMING FILE IS AgentSettings
import { AgentSettings } from '../dashboard/AppSettings'; // Corrected file name assumption

interface MainDashboardProps {
  agent: Agent;
  onLogout: () => void;
}

// 🔥 FIX: Re-inserted the missing type definition
type DashboardView = 'dashboard' | 'new-quote' | 'quotes' | 'clients' | 'settings' | 'edit-quote' | 'view-quote' | 'analytics' | 'support' | 'calendar';

// FIX: Changed 'export function' to 'export default function' to resolve the import error
export default function MainDashboard({ agent, onLogout }: MainDashboardProps) {
  const [activeView, setActiveView] = useState<DashboardView>('dashboard');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const loadQuotes = useCallback(() => {
    // This is the core data refresh function
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
  
  // 🔥 NEW: Placeholder for agent update logic
  const handleAgentUpdate = async (updatedAgent: Partial<Agent>): Promise<void> => {
    // In a real application, you would call your storage/API function here
    // e.g., await updateAgentData(agent.id, updatedAgent);
    console.log("Attempting to update agent with:", updatedAgent);
    
    // For this example, we'll simulate a slight delay and a success.
    return new Promise((resolve) => {
      setTimeout(() => {
        // You would typically update the local agent state or trigger a global context refresh
        // For now, we just log and resolve.
        console.log("Agent update simulated successfully.");
        resolve();
      }, 500);
    });
  };
  
  const handleNewQuote = (clientInfo?: Partial<Client>) => {
    // If client info is passed, it can pre-fill the QuoteWizard
    setSelectedQuoteId(null);
    console.log("Starting new quote with client info:", clientInfo);
    setActiveView('new-quote');
  };

  const handleViewQuote = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    setActiveView('view-quote');
  };
  
  // 🔥 NEW HANDLER: For the Global Follow Up button on the dashboard
  const handleReviewFollowUps = () => {
      // In a real app, this would set a filter state for overdue quotes.
      // For this example, we just navigate to the main quotes list.
      console.log("Navigating to quotes list with overdue follow-up filter active.");
      setActiveView('quotes');
  };

  // 🔥 NEW HANDLER: For the individual Follow Up button on the Recent Activity list
  // Note: This function is no longer passed to DashboardOverview,
  // as its logic is handled by onViewQuote in the Recent Activity list.
  const handleFollowUpQuote = (quoteId: string) => {
      // You could implement logic here to log the follow-up (e.g., update a 'lastFollowUpDate' on the quote).
      console.log(`Initiating follow-up for Quote ID: ${quoteId}. Navigating to view.`);
      handleViewQuote(quoteId);
  };


  const handleViewClientQuotes = (clientEmail: string) => {
      setActiveView('quotes');
      console.log(`Navigating to quotes list and filtering by client email: ${clientEmail}`);
  };


  const handleEditQuote = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    setActiveView('edit-quote');
  };

  // UPDATED: This function now marks the quote as 'presented' (i.e., ready to send) when the wizard completes.
  const handleQuoteComplete = (quote: Quote) => {
    // When the wizard finishes, the quote is ready to be 'presented'.
    if (quote.status !== 'presented' && quote.status !== 'accepted') {
      try {
        updateQuote(quote.id, { status: 'presented' });
      } catch (error) {
        console.error("Failed to mark quote as presented:", error);
      }
    }

    loadQuotes(); // Re-fetch all quotes
    setSelectedQuoteId(quote.id);
    setActiveView('view-quote'); // Go to the details page
  };
  
  // NEW: Handler to manually mark a quote as presented from the View Quote screen
  const handleMarkAsPresented = (quoteId: string) => {
    try {
      updateQuote(quoteId, { status: 'presented' });
      loadQuotes(); // Re-fetch all quotes and trigger re-render of the current view
    } catch (error) {
      console.error("Failed to mark quote as presented:", error);
    }
  };

  // NEW: Handler to mark a specific package as accepted
  const handleMarkAsAccepted = (quoteId: string, packageId: string) => {
    try {
      updateQuote(quoteId, {
        status: 'accepted',
        acceptedPackageId: packageId
      });
      // Refresh the quotes list and trigger re-render of the current view
      loadQuotes();
    } catch (error) {
      console.error("Failed to mark quote as accepted:", error);
    }
  };

  // --- NEW CLIENT HANDLER ---
  const handleClientUpdate = (oldEmail: string, updatedClient: Client) => {
    try {
      const updatedCount = updateClientInQuotes(agent.id, oldEmail, updatedClient);
      
      console.log(`Client update successful. ${updatedCount} quotes updated.`);
      
      // Refresh all quote data to reflect client changes everywhere
      loadQuotes(); 
      
      setActiveView('clients');

    } catch (error) {
      console.error("Failed to update client across all quotes:", error);
      alert("Error updating client data. Check console for details.");
    }
  };
  // --- END NEW CLIENT HANDLER ---


  const handleQuoteSelect = (quoteId: string) => {
    const quote = getQuoteById(quoteId);
    if (quote) {
      // UPDATED: 'draft' quotes go to edit. 'presented' or 'accepted' quotes go to view.
      if (quote.status === 'draft') {
        handleEditQuote(quoteId);
      } else {
        // Assumes any other status ('presented', 'accepted') should be viewed
        handleViewQuote(quoteId);
      }
    }
  };

  useEffect(() => {
    if (activeView === 'view-quote' || activeView === 'new-quote' || activeView === 'edit-quote') {
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

  const copyToClipboard = (text: string, successMessage: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      // Use modern clipboard API if available, fallback to execCommand
      if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => {
              console.log(successMessage);
          }, () => {
              // Fallback if permission is denied
              const successful = document.execCommand('copy');
              document.body.removeChild(textarea);

              if (successful) {
                  console.log(successMessage + ' (Fallback)');
              } else {
                  console.error('Failed to copy text using execCommand.');
              }
          });
          document.body.removeChild(textarea);
      } else {
          // Fallback only: execCommand
          const successful = document.execCommand('copy');
          document.body.removeChild(textarea);

          if (successful) {
              console.log(successMessage + ' (Fallback)');
          } else {
              console.error('Failed to copy text using execCommand.');
          }
      }
    } catch (err: unknown) {
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
            // FIXED: Removed onFollowUpQuote prop
            onReviewFollowUps={handleReviewFollowUps} 
          />
        );
      
      case 'new-quote':
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
            // Connect the list's email button to the main modal
            onEmailQuote={handleEmailClient}
          />
        );
        
      // --- NEW CLIENTS VIEW ---
      case 'clients':
        return (
          <ClientsList
            quotes={quotes} // Clients are derived from existing quotes
            onNewQuote={handleNewQuote} // Use the standard new quote handler
            onViewClientQuotes={handleViewClientQuotes} // Handler to navigate/filter quotes
            onClientUpdate={handleClientUpdate} // Handler to update client data in storage
          />
        );
      // --- END NEW CLIENTS VIEW ---

      // --- NEW CALENDAR VIEW ---
      case 'calendar':
        return (
          <CalendarPage /> 
          // You can pass props here if needed, e.g.,
          // <CalendarPage quotes={quotes} />
        );
      // --- END NEW CALENDAR VIEW ---

      case 'view-quote':
        if (selectedQuoteId) {
          // Get a fresh quote object, especially after an update
          const quote = getQuoteById(selectedQuoteId);
          if (quote) {
            const currentShareableLink = quote.shareableLink || generateShareableLink(quote);

            return (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 border-gray-200">
                  <h1 className="text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">Quote Details: {quote.client.name}</h1>
                  <div className="flex flex-wrap gap-3">
                    
                    {/* EDIT Button: Only visible for 'draft' or 'presented' quotes */}
                    {(quote.status === 'draft' || quote.status === 'presented') && (
                      <Button
                        onClick={() => handleEditQuote(selectedQuoteId)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 font-semibold shadow-md"
                      >
                        Edit Quote
                      </Button>
                    )}
                    
                    {/* Mark as Presented Button: Only visible for 'draft' quotes */}
                    {quote.status === 'draft' && (
                      <Button
                        onClick={() => handleMarkAsPresented(quote.id)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 font-semibold shadow-md"
                      >
                        Mark as Presented
                      </Button>
                    )}
                    
                    {/* Message Client Button: Only visible for 'presented' or 'accepted' quotes */}
                    {(quote.status === 'presented' || quote.status === 'accepted') && (
                      <Button
                        onClick={() => handleEmailClient(quote)}
                        className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition duration-150 font-semibold shadow-md"
                      >
                        Message Client
                      </Button>
                    )}

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

                <div className="bg-white rounded-xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">Client Information</h2>
                  {/* ... Client Info grid ... (no changes) */}
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
                  {/* --- UPDATED PACKAGE LIST --- */}
                  <div className="space-y-6">
                    {quote.packages.map((pkg) => (
                      <div key={pkg.id} className={`border rounded-xl p-6 bg-blue-50 shadow-md ${quote.acceptedPackageId === pkg.id ? 'border-green-500 ring-4 ring-green-100' : 'border-blue-200'}`}>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-3">
                          <h3 className="text-xl font-extrabold text-gray-900">{pkg.name}</h3>
                          <span className="text-2xl font-bold text-teal-600 mt-2 sm:mt-0 sm:ml-4">
                            ${pkg.totalMonthlyPremium.toLocaleString()}/mo
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4 text-sm">{pkg.description}</p>
                        
                        {/* --- Plan Details --- */}
                        <div className="space-y-2 pt-3 border-t border-blue-100">
                          {pkg.plans.map((plan) => (
                            <div key={plan.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                              <span className="font-medium text-gray-800">{plan.name}</span>
                              <span className="text-teal-600 font-semibold">${plan.monthlyPremium}/mo</span>
                            </div>
                          ))}
                        </div>

                        {/* --- 'Mark as Accepted' Button Logic --- */}
                        <div className="mt-5 pt-5 border-t border-blue-100 text-right">
                          {/* Show Mark as Accepted button only if status is 'presented' */}
                          {quote.status === 'presented' && (
                            <Button
                              onClick={() => handleMarkAsAccepted(quote.id, pkg.id)}
                              className="flex items-center px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150 font-semibold shadow-md ml-auto"
                            >
                              Mark as Accepted
                            </Button>
                          )}
                          
                          {/* Show accepted/not accepted status if overall status is 'accepted' */}
                          {quote.status === 'accepted' && (
                            <>
                              {quote.acceptedPackageId === pkg.id ? (
                                <Button
                                  disabled
                                  className="flex items-center px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold shadow-md opacity-100 cursor-default ml-auto"
                                >
                                  ✔ Accepted
                                </Button>
                              ) : (
                                <Button
                                  disabled
                                  className="flex items-center px-5 py-2.5 bg-gray-300 text-gray-600 rounded-lg font-semibold shadow-sm opacity-70 cursor-not-allowed ml-auto"
                                >
                                  Not Accepted
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                        {/* --- END BUTTONS --- */}

                      </div>
                    ))}
                  </div>

                  {/* ... Shareable Link and Email sections ... (no changes) */}
                  <div className="mt-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wider">Shareable Client Link</label>
                    <div className="flex items-center space-x-3 mt-2">
                      <input
                        type="text"
                        value={currentShareableLink}
                        readOnly
                        className="flex-1 p-3 border border-gray-300 rounded-lg bg-white text-sm"
                      />
                      <Button
                        onClick={() => {
                          copyToClipboard(currentShareableLink, 'Link copied to clipboard!');
                        }}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 font-semibold"
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
        // 🔥 Use the new AgentSettings component
        return (
          <AgentSettings
            agent={agent}
            onLogout={handleLogout}
            onAgentUpdate={handleAgentUpdate}
          />
        );

      // ... (Cases for 'analytics' and 'support' remain the same) ...

      case 'analytics':
        return (
            <ComingSoonPopup onClose={() => setActiveView('dashboard')} />
        );

      case 'support':
        return (
          <div className="p-8 bg-white rounded-xl shadow-xl min-h-[400px]">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Support</h1>
            <p className="text-gray-600">Contact information and support resources will be available here.</p>
          </div>
        );

      default:
        return (
            <DashboardOverview 
                quotes={quotes} 
                onNewQuote={handleNewQuote} 
                onViewQuote={handleViewQuote} 
                // FIXED: Removed onFollowUpQuote prop
                onReviewFollowUps={handleReviewFollowUps} 
            />
        );
    }
  };

  // The main return block remains unchanged
  return (
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
          <div className="p-6 lg:p-10">
            {renderMainContent()}
          </div>
        </main>
      </div>

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