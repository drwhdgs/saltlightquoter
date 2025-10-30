// ./src/components/quotes/QuotesList.tsx

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Mail,
  CheckCircle,
  Clock,
  FileText,
  X,
  Archive,
} from 'lucide-react';

// UPDATED: Import real types and storage functions
import { Quote } from '../../lib/types';
import { deleteQuote } from '../../lib/storage'; // generateShareableLink is not directly needed here

// UPDATED: Import real UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// --- UI Utility ---
const getStatusBadge = (status: Quote['status']) => {
  switch (status) {
    case 'draft':
      return {
        label: 'Draft',
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        icon: FileText,
      };
    case 'presented':
      return {
        label: 'Presented',
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        icon: Clock,
      };
    case 'accepted':
      return {
        label: 'Accepted',
        className: 'bg-green-100 text-green-800 hover:bg-green-200',
        icon: CheckCircle,
      };
    default:
      return {
        label: 'Unknown',
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        icon: X,
      };
  }
};

interface QuotesListProps {
  quotes: Quote[];
  onNewQuote: () => void;
  onViewQuote: (quoteId: string) => void;
  onEditQuote: (quoteId: string) => void;
  onRefresh: () => void;
  onEmailQuote: (quote: Quote) => void;
}

// Define the filter options based on the new status types
const statusFilterOptions: { value: Quote['status'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All Quotes' },
  { value: 'draft', label: 'Drafts' },
  { value: 'presented', label: 'Presented (Awaiting Decision)' },
  { value: 'accepted', label: 'Accepted (Bound)' },
];


export function QuotesList({
  quotes,
  onNewQuote,
  onViewQuote,
  onEditQuote,
  onRefresh,
  onEmailQuote
}: QuotesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Quote['status'] | 'all'>('all');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);

  const filteredQuotes = quotes
    .filter((quote) => {
      // Status filter
      if (statusFilter !== 'all' && quote.status !== statusFilter) {
        return false;
      }
      // Search filter (by client name or zip code)
      if (searchTerm.trim() === '') {
        return true;
      }
      const lowerSearch = searchTerm.toLowerCase();
      return (
        quote.client.name.toLowerCase().includes(lowerSearch) ||
        quote.client.zipCode?.includes(lowerSearch) // Use optional chaining for zipCode
      );
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); // Sort by newest first

  const handleDelete = (quote: Quote) => {
    setQuoteToDelete(quote);
    setIsConfirmingDelete(true);
  };

  const confirmDelete = () => {
    if (quoteToDelete) {
      deleteQuote(quoteToDelete.id); // Assuming deleteQuote handles the storage update
      onRefresh(); // Refresh the list from parent state
      setIsConfirmingDelete(false);
      setQuoteToDelete(null);
    }
  };

  const calculateTotalPremium = (quote: Quote) => {
    return quote.packages.reduce((sum, pkg) => sum + pkg.totalMonthlyPremium, 0).toLocaleString();
  };

  return (
    <div className="space-y-6 relative">
      <h1 className="text-4xl font-extrabold text-gray-900">Client Quotes</h1>

      {/* Header Bar: Search, Filter, New Quote Button */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-md">
        
        {/* Search Input */}
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          {/* Input component (assuming Input is a styled component) */}
          <Input
            type="text"
            placeholder="Search by client name or ZIP"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="w-full md:w-1/4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Quote['status'] | 'all')}
            className="w-full px-4 py-2 border rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            {statusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* New Quote Button */}
        <Button
          onClick={onNewQuote}
          className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-150 font-semibold shadow-md flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Quote
        </Button>
      </div>

      {/* Quote List Table/Cards */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        {filteredQuotes.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <Archive className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold">No quotes found</p>
            <p>Try adjusting your filters or <span onClick={onNewQuote} className='text-blue-600 cursor-pointer hover:text-blue-700 font-medium'>start a new quote</span>.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Header Row */}
            <div className="hidden lg:grid grid-cols-10 gap-4 text-xs font-semibold uppercase text-gray-500 p-4 border-b border-gray-100">
              <div className="col-span-3">Client Name</div>
              <div className="col-span-1">ZIP</div>
              <div className="col-span-2">Last Updated</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Premium (mo)</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            
            {/* Quote Rows */}
            {filteredQuotes.map((quote) => {
              const status = getStatusBadge(quote.status);
              const totalPremium = calculateTotalPremium(quote);
              
              return (
                <div 
                  key={quote.id} 
                  className="grid grid-cols-10 gap-4 items-center p-4 hover:bg-gray-50 transition duration-100 cursor-pointer"
                  onClick={() => onViewQuote(quote.id)}
                >
                  {/* Client Name & Email (Col 1) */}
                  <div className="col-span-10 lg:col-span-3 font-semibold text-gray-900 flex flex-col">
                    <span className="text-base">{quote.client.name}</span>
                    <span className="text-sm font-normal text-gray-500 hidden sm:block">{quote.client.email}</span>
                  </div>

                  {/* ZIP (Col 2) */}
                  <div className="hidden lg:block col-span-1 text-sm text-gray-600">{quote.client.zipCode}</div>

                  {/* Last Updated (Col 3) */}
                  <div className="col-span-5 sm:col-span-2 lg:col-span-2 text-sm text-gray-600">
                    {new Date(quote.updatedAt).toLocaleDateString()}
                  </div>

                  {/* Status (Col 4) */}
                  <div className="col-span-5 sm:col-span-3 lg:col-span-2">
                    <Badge className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center justify-center ${status.className}`}>
                      <status.icon className='w-3 h-3 mr-1'/>
                      {status.label}
                    </Badge>
                  </div>

                  {/* Premium (Col 5) */}
                  <div className="col-span-5 sm:col-span-3 lg:col-span-1 text-lg font-bold text-teal-600 text-right mr-5">
                    ${totalPremium}
                  </div>

                  {/* Actions (Col 6) - Prevent click propagation from the row onClick */}
                  <div className="col-span-5 sm:col-span-4 lg:col-span-1 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    
                    {/* View Button */}
                    <Button
                      onClick={() => onViewQuote(quote.id)}
                      title="View Details"
                      size="sm"
                      className="p-1.5 h-auto bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {/* Edit Button - Only for 'draft' or 'presented' quotes */}
                    {(quote.status === 'draft' || quote.status === 'presented') && (
                      <Button
                        onClick={() => onEditQuote(quote.id)}
                        title="Edit Quote"
                        size="sm"
                        className="p-1.5 h-auto bg-blue-100 text-blue-600 hover:bg-blue-200"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {/* Email Button - Only for 'presented' or 'accepted' quotes */}
                    {(quote.status === 'presented' || quote.status === 'accepted') && (
                      <Button
                        onClick={() => onEmailQuote(quote)}
                        title="Email Client"
                        size="sm"
                        className="p-1.5 h-auto bg-teal-100 text-teal-600 hover:bg-teal-200"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Delete Button */}
                    <Button
                      onClick={() => handleDelete(quote)}
                      title="Delete Quote"
                      size="sm"
                      className="p-1.5 h-auto bg-red-100 text-red-600 hover:bg-red-200"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


      {/* Delete Confirmation Modal */}
      {isConfirmingDelete && quoteToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg shadow-2xl border-2 border-red-500">
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
                  variant="outline"
                  onClick={() => {
                    setIsConfirmingDelete(false);
                    setQuoteToDelete(null);
                  }}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white shadow-md"
                  onClick={confirmDelete}
                  variant="destructive"
                >
                  Yes, Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}