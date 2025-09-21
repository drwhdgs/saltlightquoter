'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { X, Mail, MessageSquare, Paperclip, Copy } from 'lucide-react';
import { Quote } from '@/lib/types';
import { generateShareableLink } from '@/lib/storage';

interface EmailQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote;
}

export function EmailQuoteModal({ isOpen, onClose, quote }: EmailQuoteModalProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');
  const [emailData, setEmailData] = useState({
    to: quote.client.email,
    subject: `Your Insurance Quote - ${quote.client.name}`,
    message: generateEmailMessage(quote),
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  // Ensure we have a short shareable link
  const shareableLink = quote.shareableLink || generateShareableLink(quote);

  function generateEmailMessage(quote: Quote): string {
    const link = quote.shareableLink || generateShareableLink(quote);

    return `Good afternoon ${quote.client.name}!

This is Salt & Light Insurance Group. Thank you for filling out our quote form! We appreciate the opportunity to provide a quote for you. Here's your full health insurance quote with the different packages that you can choose from. If you have any questions, please let us know. Thank you!

Click this link to view your quote: ${link}`;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(emailData.subject);
    const body = encodeURIComponent(emailData.message);
    const mailtoLink = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_self');
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    alert('Shareable link copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Send Quote to Client</h2>
              <p className="text-sm text-gray-600">Send quote for {quote.client.name} via email or SMS</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Email/SMS Tabs */}
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-2 px-4 py-2 rounded-l-lg border-2 ${
                activeTab === 'email'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-r-lg border-2 border-l-0 ${
                activeTab === 'sms'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              SMS
            </button>
          </div>

          {/* Email Form */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="to" className="text-sm font-medium text-gray-700">
                  To *
                </Label>
                <Input
                  id="to"
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                  Subject *
                </Label>
                <Input
                  id="subject"
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Message *
                </Label>
                <Textarea
                  id="message"
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  rows={8}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Attachments</Label>
                <div className="mt-1 flex items-center">
                  <label className="relative cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 inline-flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Choose Files
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>
                  <span className="ml-3 text-sm text-gray-500">
                    {attachments.length > 0
                      ? `${attachments.length} file${attachments.length > 1 ? 's' : ''} selected`
                      : 'no files selected'
                    }
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSendEmail}
                className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium"
              >
                Send Email
              </Button>
            </div>
          )}

          {/* SMS Form */}
          {activeTab === 'sms' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={quote.client.phone}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="smsMessage" className="text-sm font-medium text-gray-700">
                  Message *
                </Label>
                <Textarea
                  id="smsMessage"
                  value={`Good afternoon ${quote.client.name}! This is Salt & Light Insurance Group. Thank you for filling out our quote form! We appreciate the opportunity to provide a quote for you. Here's your full health insurance quote with the different packages that you can choose from. If you have any questions, please let us know. Thank you!

                  Click this link to view your quote: ${shareableLink}`}
                  rows={4}
                  className="mt-1"
                  readOnly
                />
              </div>

              <Button
                onClick={() => {
                  const smsLink = `sms:${quote.client.phone}?body=${encodeURIComponent(`Good afternoon ${quote.client.name}! This is Salt & Light Insurance Group. Thank you for filling out our quote form! We appreciate the opportunity to provide a quote for you. Here's your full health insurance quote with the different packages that you can choose from. If you have any questions, please let us know. Thank you!

                  Click this link to view your quote: ${shareableLink}`)}`;
                  window.open(smsLink, '_self');
                  onClose();
                }}
                className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium"
              >
                Send SMS
              </Button>
            </div>
          )}

          {/* Shareable Quote Link Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <Label className="text-sm font-medium text-blue-800 mb-2 block">
              Shareable Quote Link:
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={shareableLink}
                readOnly
                className="bg-white text-sm"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy
              </Button>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              This short link will work on any device and browser.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
