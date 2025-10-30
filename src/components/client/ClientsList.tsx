// ./src/components/clients/ClientsList.tsx

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Eye,
  Users,
  Mail,
  Calendar,
  Phone,
  MapPin,
  Archive,
  Edit, 
  Save, 
  X, 
  Send, 
  CheckSquare, 
} from 'lucide-react';

// Import real types and UI components
import { Quote, Client } from '../../lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox'; 

// Define a simplified client object for this list, including metadata
interface ClientListItem extends Client {
  totalQuotes: number;
  lastQuoteDate: string;
}

// --- NEW COMPONENT: ClientEditModal (UNCHANGED) ---
interface ClientEditModalProps {
    client: Client;
    onClose: () => void;
    // onSave accepts the original email (for lookup) and the updated client object
    onSave: (oldEmail: string, updatedClient: Client) => void; 
}

const ClientEditModal: React.FC<ClientEditModalProps> = ({ client, onClose, onSave }) => {
    const [formData, setFormData] = useState<Client>(client);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const validateForm = () => {
        // Basic validation check
        if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.zipCode.trim()) {
            setError('Name, Email, Phone, and ZIP Code are required.');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address.');
            return false;
        }
        
        if (formData.dateOfBirth && isNaN(new Date(formData.dateOfBirth).getTime())) {
             setError('Please enter a valid Date of Birth.');
             return false;
        }

        setError(null);
        return true;
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setIsSaving(true);

        try {
            onSave(client.email, formData);
            setTimeout(() => {
                setIsSaving(false);
                onClose(); 
            }, 300); 

        } catch (err) {
            setError('Failed to save client. Check console for details.');
            setIsSaving(false);
            console.error(err);
        }
    };

    return (
        // Modal Overlay
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg bg-white shadow-2xl rounded-xl">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Edit className="w-5 h-5 mr-2 text-blue-600" />
                        Edit Client: {client.name}
                    </h2>
                    <Button onClick={onClose} variant="ghost" size="sm" className="p-1 h-auto text-gray-500 hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 text-sm font-medium text-red-700 bg-red-100 rounded-lg">{error}</div>}
                    
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Client Full Name" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Used as identifier)</label>
                        <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="client@example.com" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                            <Input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="(555) 555-5555" />
                        </div>
                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <Input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">ZIP Code</label>
                        <Input type="text" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="12345" />
                    </div>
                    
                    {/* Additional Info (Optional) */}
                    <div>
                        <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">Additional Info</label>
                        <Input type="text" id="additionalInfo" name="additionalInfo" value={formData.additionalInfo || ''} onChange={handleChange} placeholder="e.g., Prefers text messages" />
                    </div>


                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="text-gray-700 hover:bg-gray-100">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center">
                            {isSaving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
// --- END ClientEditModal ---


interface ClientsListProps {
  quotes: Quote[];
  onNewQuote: (clientInfo?: Partial<Client>) => void; 
  // IMPORTANT: The handler must accept the client's email to filter the quotes list
  onViewClientQuotes: (clientEmail: string) => void; 
  onClientUpdate: (oldEmail: string, updatedClient: Client) => void; 
}

export function ClientsList({
  quotes,
  onNewQuote,
  onViewClientQuotes,
  onClientUpdate, 
}: ClientsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null); 
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set()); 

  // Aggregate and deduplicate clients from quotes (Logic remains the same and correctly calculates totalQuotes and lastQuoteDate)
  const allClients = useMemo<ClientListItem[]>(() => {
    const clientMap = new Map<string, ClientListItem>();

    for (const quote of quotes) {
      const email = quote.client.email;
      const client = quote.client;

      if (!email) continue; 

      // Using updateAt from the quote as the last activity timestamp
      const newQuoteDate = new Date(quote.updatedAt).getTime();
      
      if (clientMap.has(email)) {
        const existingClient = clientMap.get(email)!;
        existingClient.totalQuotes += 1;
        const existingDate = new Date(existingClient.lastQuoteDate).getTime();
        
        // This logic correctly updates the lastQuoteDate to the MAX (latest) date found
        if (newQuoteDate > existingDate) {
          existingClient.lastQuoteDate = quote.updatedAt;
        }
      } else {
        clientMap.set(email, {
          ...client,
          totalQuotes: 1,
          lastQuoteDate: quote.updatedAt,
        });
      }
    }

    // Sort by most recent lastQuoteDate
    return Array.from(clientMap.values()).sort(
        (a, b) => new Date(b.lastQuoteDate).getTime() - new Date(a.lastQuoteDate).getTime()
    );
  }, [quotes]);

  // Filter clients based on search term (Logic remains the same)
  const filteredClients = allClients.filter((client) => {
    if (searchTerm.trim() === '') {
      return true;
    }
    const lowerSearch = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(lowerSearch) ||
      client.email.toLowerCase().includes(lowerSearch) ||
      client.phone.includes(lowerSearch) ||
      client.zipCode?.includes(lowerSearch)
    );
  });
  
  // --- Handlers (Bulk actions and editing handlers unchanged) ---
  const handleEditClient = (client: Client) => { setEditingClient(client); };
  const handleSaveClient = (oldEmail: string, updatedClient: Client) => { onClientUpdate(oldEmail, updatedClient); setEditingClient(null); };
  const handleCloseEdit = () => { setEditingClient(null); };
  
  const handleSelectClient = (email: string, isChecked: boolean) => {
    setSelectedClients(prev => {
      const newSet = new Set(prev);
      if (isChecked) { newSet.add(email); } else { newSet.delete(email); }
      return newSet;
    });
  };
  
  const handleSelectAll = (isChecked: boolean) => {
      if (isChecked) {
          setSelectedClients(new Set(filteredClients.map(c => c.email)));
      } else {
          setSelectedClients(new Set());
      }
  };

  const isAllSelected = filteredClients.length > 0 && selectedClients.size === filteredClients.length;
  const isIndeterminate = selectedClients.size > 0 && selectedClients.size < filteredClients.length;
  
  const handleBulkUpdate = () => { console.log(`Bulk Update: Clients selected - ${Array.from(selectedClients).join(', ')}`); alert(`Initiating bulk update for ${selectedClients.size} clients. (Feature to be built)`); };
  const handleSendMessage = (clientEmail: string) => { console.log(`Sending message/email to: ${clientEmail}`); alert(`Opening email/message window for client: ${clientEmail} (Feature to be built)`); };
  const handleBulkMessage = () => { console.log(`Bulk Message: Clients selected - ${Array.from(selectedClients).join(', ')}`); alert(`Opening bulk email/message window for ${selectedClients.size} clients. (Feature to be built)`); };


  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
        <Users className="w-8 h-8 mr-3 text-blue-600" />
        Clients
      </h1>

      {/* Header Bar: Search, New Client Button, Bulk Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-md">
        
        {/* Search Input */}
        <div className="relative w-full md:w-1/2 lg:w-2/5">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, email, phone, or ZIP"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Bulk Action Controls (unchanged) */}
        {selectedClients.size > 0 && (
            <div className="flex gap-3 items-center w-full md:w-auto p-2 bg-blue-50 rounded-lg shadow-inner">
                <span className="text-sm font-medium text-blue-800 hidden sm:block">{selectedClients.size} Selected:</span>
                
                {/* Bulk Message/Email Button */}
                <Button 
                    onClick={handleBulkMessage} 
                    size="sm" 
                    title="Bulk Message/Email"
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                >
                    <Mail className="w-4 h-4 mr-2" />
                    Message All ({selectedClients.size})
                </Button>
                
                {/* Bulk Update Button */}
                <Button 
                    onClick={handleBulkUpdate} 
                    size="sm" 
                    title="Bulk Update Clients"
                    variant="outline"
                    className="bg-white text-gray-700 hover:bg-gray-100 flex items-center"
                >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Bulk Update
                </Button>
            </div>
        )}

        {/* New Client Intake Button */}
        <Button
          onClick={() => onNewQuote()}
          className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-150 font-semibold shadow-md flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Client Intake
        </Button>
      </div>

      {/* Client List Table/Cards */}
      <Card className="shadow-xl overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <Archive className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold">No clients found</p>
            <p>Try adjusting your search or <span onClick={() => onNewQuote()} className='text-blue-600 cursor-pointer hover:text-blue-700 font-medium'>start a new client intake</span>.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Header Row (unchanged) */}
            <div className="hidden lg:grid grid-cols-11 gap-4 text-xs font-semibold uppercase text-gray-500 p-4 border-b border-gray-100">
              <div className="col-span-1 flex items-center">
                  {/* Select All Checkbox */}
                  <Checkbox 
                      id="selectAll" 
                      checked={isAllSelected}
                    // @ts-expect-error — indeterminate prop is not officially in Checkbox type
i                   ndeterminate={isIndeterminate}
                      onCheckedChange={handleSelectAll} 
                      className="mr-2"
                  />
                  Client Name
              </div>
              <div className="col-span-2">Contact Info</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-2">Quotes & Last Activity</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            
            {/* Client Rows */}
            {filteredClients.map((client) => {
              const isSelected = selectedClients.has(client.email);
              return (
              <div 
                key={client.email} // Using email as the stable key
                className={`grid grid-cols-11 gap-4 items-center p-4 transition duration-100 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`} 
              >
                {/* Client Name (Col 1) - unchanged */}
                <div className="col-span-11 lg:col-span-2 font-semibold text-gray-900 flex flex-col sm:flex-row sm:items-center">
                    {/* Individual Client Checkbox */}
                    <Checkbox 
                        id={`client-${client.email}`} 
                        checked={isSelected} 
                        onCheckedChange={(checked: boolean | 'indeterminate') => handleSelectClient(client.email, checked === true)} 
                        className="mr-3"
                    />
                    <div>
                        <span className="text-base">{client.name}</span>
                        <span className="text-xs font-normal text-gray-400 hidden lg:block">DOB: {new Date(client.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Contact Info (Col 2) - unchanged */}
                <div className="col-span-5 sm:col-span-3 lg:col-span-2 text-sm text-gray-600 space-y-1">
                    <div className='flex items-center text-xs'>
                        <Mail className='w-3 h-3 mr-1.5 text-blue-500 hidden sm:inline-block'/>
                        <span className='truncate'>{client.email}</span>
                    </div>
                    <div className='flex items-center text-xs'>
                        <Phone className='w-3 h-3 mr-1.5 text-blue-500 hidden sm:inline-block'/>
                        <span className='truncate'>{client.phone}</span>
                    </div>
                </div>

                {/* Location (Col 3) - unchanged */}
                <div className="col-span-5 sm:col-span-2 lg:col-span-2 text-sm text-gray-600 space-y-1">
                    <div className='flex items-center text-xs'>
                        <MapPin className='w-3 h-3 mr-1.5 text-blue-500 hidden sm:inline-block'/>
                        <span className='truncate'>ZIP: {client.zipCode}</span>
                    </div>
                </div>


                {/* Quotes & Last Activity (Col 4) - FIX APPLIED HERE */}
                <div className="col-span-5 sm:col-span-3 lg:col-span-2 text-sm text-gray-600 space-y-1">
                    {/* FIX: Ensure client.email is passed to the handler */}
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center justify-center w-fit cursor-pointer"
                           onClick={() => onViewClientQuotes(client.email)} 
                    >
                        {client.totalQuotes} Quote{client.totalQuotes > 1 ? 's' : ''} <Eye className='w-3 h-3 ml-1.5'/>
                    </Badge>
                    <div className='flex items-center text-xs'>
                        <Calendar className='w-3 h-3 mr-1.5 text-gray-500 hidden sm:inline-block'/>
                        {/* Ensure date format is readable */}
                        <span className='truncate'>Last: {new Date(client.lastQuoteDate).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Actions (Col 5) - FIX APPLIED HERE */}
                <div className="col-span-11 lg:col-span-3 flex justify-end gap-2">
                  <Button
                    onClick={() => handleSendMessage(client.email)}
                    title="Send Message/Email"
                    size="sm"
                    className="p-1.5 h-auto bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={() => handleEditClient(client)}
                    title="Edit Client Info"
                    size="sm"
                    className="p-1.5 h-auto bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    // FIX: Ensure client.email is passed to the handler
                    onClick={() => onViewClientQuotes(client.email)}
                    title="View All Quotes"
                    size="sm"
                    className="p-1.5 h-auto bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={() => onNewQuote(client)}
                    title="Start New Quote"
                    size="sm"
                    className="p-1.5 h-auto bg-blue-100 text-blue-600 hover:bg-blue-200"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );})}
          </div>
        )}
      </Card>
      
      {/* Client Edit Modal (unchanged) */}
      {editingClient && (
          <ClientEditModal
              client={editingClient}
              onClose={handleCloseEdit}
              onSave={handleSaveClient}
          />
      )}
    </div>
  );
}