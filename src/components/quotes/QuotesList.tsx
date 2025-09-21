'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmailQuoteModal } from './EmailQuoteModal';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Link,
  Calendar,
  DollarSign,
  Users,
  Filter,
  Mail
} from 'lucide-react';
import { Quote } from '@/lib/types';
import { deleteQuote, generateShareableLink } from '@/lib/storage';

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
          const bValue = b.packages.reduce((sum, pkg) => sum + pkg.totalMonthlyPremium, 0);
          return bValue - aValue;
        case 'date':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  const handleDeleteQuote = (quoteId: string) => {
    if (window.confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
      deleteQuote(quoteId);
      onRefresh();
    }
  };

  const handleCopyLink = (quote: Quote) => {
    let shareableLink = quote.shareableLink;
    if (!shareableLink) {
      shareableLink = generateShareableLink(quote);
    }
    navigator.clipboard.writeText(shareableLink);
    alert('Shareable link copied to clipboard!');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Quotes</h1>
          <p className="text-gray-600">Manage and track all your insurance quotes</p>
        </div>
        <Button onClick={onNewQuote} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Quote
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Quotes</p>
                <p className="text-xl font-bold">{quotes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-xl font-bold">
                  {quotes.filter(q => q.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Presented</p>
                <p className="text-xl font-bold">
                  {quotes.filter(q => q.status === 'presented').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by client name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Quote['status'] | 'all')}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="presented">Presented</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'client' | 'value')}
                className="px-3 py-2 border rounded-md bg-white"
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
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {quotes.length === 0 ? 'No quotes yet' : 'No quotes match your filters'}
              </h3>
              <p className="text-gray-600 mb-4">
                {quotes.length === 0
                  ? 'Start by creating your first insurance quote'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {quotes.length === 0 && (
                <Button onClick={onNewQuote}>Create First Quote</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredQuotes.map((quote) => {
            const totalMonthly = quote.packages.reduce((sum, pkg) => sum + pkg.totalMonthlyPremium, 0);
            const planCount = quote.packages.reduce((sum, pkg) => sum + pkg.plans.length, 0);

            return (
              <Card key={quote.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 break-words">
                          {quote.client.name}
                        </h3>
                        <Badge className={getStatusColor(quote.status)}>
                          {quote.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="break-words">{quote.client.email}</p>
                        </div>
                        <div>
                          <p className="font-medium">ZIP Code</p>
                          <p>{quote.client.zipCode}</p>
                        </div>
                        <div>
                          <p className="font-medium">Packages</p>
                          <p>{quote.packages.length} package{quote.packages.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <p className="font-medium">Total Plans</p>
                          <p>{planCount} plan{planCount !== 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Created: {new Date(quote.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(quote.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ${totalMonthly.toLocaleString()}/mo
                        </p>
                        <p className="text-sm text-gray-600">
                          ${(totalMonthly * 12).toLocaleString()}/year
                        </p>
                      </div>

                      <div className="flex space-x-2">
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
                          <Link className="w-4 h-4" />
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
