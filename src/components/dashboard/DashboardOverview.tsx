'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Eye,
  Plus
} from 'lucide-react';
import { Quote } from '@/lib/types';

interface DashboardOverviewProps {
  quotes: Quote[];
  onNewQuote: () => void;
  onViewQuote: (quoteId: string) => void;
}

export function DashboardOverview({ quotes, onNewQuote, onViewQuote }: DashboardOverviewProps) {
  // Calculate statistics
  const totalQuotes = quotes.length;
  const draftQuotes = quotes.filter(q => q.status === 'draft').length;
  const completedQuotes = quotes.filter(q => q.status === 'completed').length;
  const presentedQuotes = quotes.filter(q => q.status === 'presented').length;

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
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'presented': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your insurance quotes and performance</p>
        </div>
        <Button onClick={onNewQuote} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Quote
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuotes}</div>
            <p className="text-xs text-muted-foreground">
              {draftQuotes} draft, {completedQuotes} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From completed quotes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quote Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgQuoteValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Per quote monthly premium
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuotes}</div>
            <p className="text-xs text-muted-foreground">
              {presentedQuotes} presentations sent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentQuotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes yet</h3>
              <p className="text-gray-600 mb-4">Start by creating your first insurance quote</p>
              <Button onClick={onNewQuote}>Create First Quote</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => onViewQuote(quote.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {quote.client.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {quote.packages.length} package{quote.packages.length !== 1 ? 's' : ''} •
                        ${quote.packages.reduce((sum, pkg) => sum + pkg.totalMonthlyPremium, 0).toLocaleString()}/mo
                      </p>
                      <p className="text-xs text-gray-500">
                        Updated {new Date(quote.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(quote.status)} flex items-center gap-1`}>
                      {getStatusIcon(quote.status)}
                      {quote.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
