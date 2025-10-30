// ./src/components/quotes/QuotesList.tsx

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Link as LinkIcon, // Renamed to avoid conflict with the component below
  Calendar,
  DollarSign,
  Users,
  Mail,
  CheckCircle,
  X
} from 'lucide-react';

// FIX: Importing canonical types to resolve the conflict with MainDashboard.tsx
import { Quote, Package, Client, InsurancePlan } from '../../lib/types';

// --- MOCK External Dependencies (Consolidated) ---

// 1. Mock Storage Functions (Re-added deleteQuote to prevent runtime error)
const deleteQuote = (quoteId: string) => {
  console.log(`MOCK: Deleting quote with ID: ${quoteId}`);
  // In a real app, this would call Firestore or an API endpoint.
};

const generateShareableLink = (quote: Quote) => {
  console.log(`MOCK: Generating shareable link for quote: ${quote.id}`);
  return `https://share.app/quote/${quote.id}`;
};

// 2. Mock UI Components (with explicit typing)

// Props for Button component
interface ButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'ghost' | 'outline' | 'destructive'; // Added 'destructive'
  size?: 'sm' | 'default'; // Added 'sm'
  title?: string;
  disabled?: boolean;
}
// Explicitly typed props
const Button = ({ onClick, children, className = '', variant, size, title, disabled }: ButtonProps) => {
  let baseClasses = 'px-4 py-2 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 flex items-center justify-center space-x-2';
  
  if (variant === 'ghost') {
    baseClasses = `p-2 ${className} hover:bg-gray-100 text-gray-500 rounded-full`;
  } else if (variant === 'destructive') {
    baseClasses = `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
  } else {
    baseClasses = `${baseClasses} bg-blue-500 text-white hover:bg-blue-700 focus:ring-blue-500`;
  }
  
  if (size === 'sm') {
      baseClasses = baseClasses.replace('px-4 py-2', 'px-3 py-1.5 text-sm');
  }

  if (disabled) {
    baseClasses = `${baseClasses} opacity-50 cursor-not-allowed`;
  }

  return (
    <button className={`${baseClasses} ${className}`} onClick={onClick} title={title} disabled={disabled}>
      {children}
    </button>
  );
};

// Props for Input component
interface InputProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Typed change event
  className?: string;
}
// Explicitly typed props
const Input = ({ placeholder, value, onChange, className = '' }: InputProps) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
  />
);

// Props for Card components
interface BaseComponentProps {
  children: React.ReactNode;
  className?: string;
}
// Explicitly typed props
const Card = ({ children, className = '' }: BaseComponentProps) => <div className={`bg-white rounded-xl shadow-lg ${className}`}>{children}</div>;
// Explicitly typed props
const CardContent = ({ children, className = '' }: BaseComponentProps) => <div className={`p-6 ${className}`}>{children}</div>;
// Explicitly typed props
const CardHeader = ({ children, className = '' }: BaseComponentProps) => <div className={`p-6 border-b ${className}`}>{children}</div>;
// Explicitly typed props
const CardTitle = ({ children, className = '' }: BaseComponentProps) => <h2 className={`text-xl font-bold ${className}`}>{children}</h2>;

// Props for Badge component
// Removed interface BadgeProps extends BaseComponentProps {}
// Explicitly typed props
const Badge = ({ children, className = '' }: BaseComponentProps) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

// Mock EmailQuoteModal Component
// FIX: Removed 'any' from the quote prop type definition.
const EmailQuoteModal = ({ isOpen, onClose, quote }: { isOpen: boolean; onClose: () => void; quote: Quote | null }) => {
  if (!isOpen || !quote) return null;

  const handleSend = () => {
    alert(`MOCK: Sending quote for ${quote.client.name} via email to ${quote.client.email}`);
    onClose();
  };
  
  // FIX: Explicitly typed the reduce accumulator as a number.
  const quoteTotal = quote.packages.reduce((sum: number, pkg: Package) => sum + pkg.totalMonthlyPremium, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Email Quote to {quote.client.name}</CardTitle>
          <Button onClick={onClose} variant="ghost" size="sm" title="Close">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p className="text-gray-700">
            This feature is a placeholder. In a real application, a secure email service would be integrated here.
          </p>
          <div className="text-sm">
            <p className="font-medium">Client:</p>
            <p>{quote.client.email}</p>
            <p className="font-medium mt-2">Quote Value:</p>
            <p className="font-bold text-green-600">${quoteTotal.toLocaleString()}/mo</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white">
              MOCK Send Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


// --- END MOCK External Dependencies ---

interface QuotesListProps {
  quotes: Quote[];
  onNewQuote: () => void;
  onViewQuote: (quoteId: string) => void;
  onEditQuote: (quoteId: string) => void;
  onRefresh: () => void;
}

export function QuotesList({
  quotes,
  onNewQuote,
  onViewQuote,
  onEditQuote,
  onRefresh
}: QuotesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Quote['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'value'>('date');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // State for confirmation modal and toast notification
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [copySuccessMessage, setCopySuccessMessage] = useState('');

  const filteredQuotes = quotes
    .filter(quote => {
      const matchesSearch = quote.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quote.client.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'client':
          return a.client.name.localeCompare(b.client.name);
        case 'value':
          const aValue = a.packages.reduce((sum, pkg) => sum + pkg.totalMonthlyPremium, 0);
          // Fixed 'pkgSum' to 'sum'
          const bValue = b.packages.reduce((sum, pkg) => sum + pkg.totalMonthlyPremium, 0);
          return bValue - aValue;
        case 'date':
        default:
          // Sort by latest updated date first
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  // Handler to open the confirmation modal
  const handleDeleteQuote = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
      setQuoteToDelete(quote);
      setIsConfirmingDelete(true);
    }
  };

  // Handler to execute deletion after confirmation
  const confirmDelete = () => {
    if (quoteToDelete) {
      deleteQuote(quoteToDelete.id);
      onRefresh();
      setIsConfirmingDelete(false);
      setQuoteToDelete(null);
    }
  };

  const handleCopyLink = (quote: Quote) => {
    let shareableLink = quote.shareableLink;
    if (!shareableLink) {
      shareableLink = generateShareableLink(quote);
    }
    
    // Use clipboard API
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
          setCopySuccessMessage('Shareable link copied to clipboard!');
          setTimeout(() => setCopySuccessMessage(''), 3000); // Clear message after 3 seconds
      })
      .catch(() => {
          setCopySuccessMessage('Failed to copy link.');
          setTimeout(() => setCopySuccessMessage(''), 3000);
      });
  };

  const handleEmailClient = (quote: Quote) => {
    setSelectedQuote(quote);
    setEmailModalOpen(true);
  };

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'presented': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalValue = filteredQuotes.reduce((sum, quote) =>
    sum + quote.packages.reduce((pkgSum, pkg) => pkgSum + pkg.totalMonthlyPremium, 0), 0
  );

  return (
    <div className="space-y-6 relative p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">My Quotes</h1>
          <p className="text-gray-600">Manage and track all your insurance quotes</p>
        </div>
        <Button onClick={onNewQuote} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Quote
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Quotes</p>
                <p className="text-2xl font-bold text-gray-900">{quotes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quotes.filter(q => q.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Presented</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quotes.filter(q => q.status === 'presented').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Value (Monthly)</p>
                <p className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by client name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as Quote['status'] | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white h-10 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="presented">Presented</option>
              </select>

              <select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'date' | 'client' | 'value')}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white h-10 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="client">Sort by Client</option>
                <option value="value">Sort by Value</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      <div className="space-y-4">
        {filteredQuotes.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-12 text-center bg-white">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {quotes.length === 0 ? 'No quotes yet' : 'No quotes match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {quotes.length === 0
                  ? 'Start by creating your first insurance quote to see it here.'
                  : 'Try adjusting your search or filter criteria to find quotes.'
                }
              </p>
              {quotes.length === 0 && (
                <Button onClick={onNewQuote}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Quote
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredQuotes.map((quote) => {
            const totalMonthly = quote.packages.reduce((sum, pkg) => sum + pkg.totalMonthlyPremium, 0);
            const planCount = quote.packages.reduce((sum, pkg) => sum + pkg.plans.length, 0);

            return (
              <Card key={quote.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 break-words">
                          {quote.client.name}
                        </h3>
                        <Badge className={`uppercase text-xs font-semibold ${getStatusColor(quote.status)}`}>
                          {quote.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-2 gap-x-6 text-sm text-gray-600 mt-3">
                        <div>
                          <p className="font-medium text-gray-700">Email</p>
                          <p className="break-words">{quote.client.email}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">ZIP Code</p>
                          <p>{quote.client.zipCode}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Packages</p>
                          <p>{quote.packages.length} package{quote.packages.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Total Plans</p>
                          <p>{planCount} plan{planCount !== 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center space-x-6 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Created: {new Date(quote.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Edit className="w-3 h-3 mr-1" />
                          Updated: {new Date(quote.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-3 pt-2 md:pt-0 w-full md:w-auto">
                      <div className="text-right">
                        <p className="text-3xl font-extrabold text-green-600">
                          ${totalMonthly.toLocaleString()}/mo
                        </p>
                        <p className="text-sm text-gray-500">
                          ${(totalMonthly * 12).toLocaleString()}/year
                        </p>
                      </div>

                      <div className="flex space-x-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewQuote(quote.id)}
                          title="View Quote Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditQuote(quote.id)}
                          title="Edit Quote"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEmailClient(quote)}
                          title="Email Quote to Client"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(quote)}
                          title="Copy Shareable Link"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Quote"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Copy Success Toast/Notification */}
      {copySuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl bg-green-600 text-white shadow-2xl transition-all duration-300 transform animate-pulse">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">{copySuccessMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmingDelete && quoteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <Card className="w-full max-w-sm border-2 border-red-500 animate-in fade-in zoom-in">
            <CardHeader>
              <CardTitle className="text-2xl text-red-600 flex items-center gap-2">
                <Trash2 className="w-6 h-6" />
                Confirm Deletion
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-6 text-gray-700">
                You are about to permanently delete the quote for{' '}
                <span className="font-semibold text-gray-900">{quoteToDelete.client.name}</span>.
                <br />
                <span className="font-bold text-red-600">This action cannot be undone.</span>
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsConfirmingDelete(false);
                    setQuoteToDelete(null);
                  }}
                  className="text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white shadow-md"
                  onClick={confirmDelete}
                >
                  Yes, Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}


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