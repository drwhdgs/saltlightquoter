'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// Removing Card imports, as the parent QuoteWizard provides the container
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; 
import { Client } from '@/lib/types';

interface ClientInfoFormProps {
  initialData?: Partial<Client>;
  onSubmit: (client: Client) => void;
  onCancel: () => void;
}

export function ClientInfoForm({ initialData, onSubmit, onCancel }: ClientInfoFormProps) {
  const [formData, setFormData] = useState<Client>({
    name: initialData?.name || '',
    zipCode: initialData?.zipCode || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    additionalInfo: initialData?.additionalInfo || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // --- Validation Logic (Unchanged, as it's correct) ---
    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode.trim())) {
      newErrors.zipCode = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18 || age > 100) {
        newErrors.dateOfBirth = 'Client must be between 18 and 100 years old';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\(\)\+\.]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const cleanedData: Client = {
        name: formData.name.trim(),
        zipCode: formData.zipCode.trim(),
        dateOfBirth: formData.dateOfBirth,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        additionalInfo: formData.additionalInfo?.trim() || undefined,
      };

      onSubmit(cleanedData);
    }
  };

  const handleInputChange = (field: keyof Client, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateAge = (dateOfBirth: string): number | null => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const age = calculateAge(formData.dateOfBirth);

  return (
    // Removed Card wrapper to use the parent QuoteWizard's container
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Contact Information Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-semibold">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                type="text"
                placeholder="John Smith"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-semibold">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-semibold">Phone Number <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : ''}`}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          
            {/* ZIP Code */}
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-gray-700 font-semibold">ZIP Code <span className="text-red-500">*</span></Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="12345"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.zipCode ? 'border-red-500' : ''}`}
              />
              {errors.zipCode && (
                <p className="text-sm text-red-600">{errors.zipCode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Demographic & Notes Section */}
        <div className="space-y-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-gray-700 font-semibold">Date of Birth <span className="text-red-500">*</span></Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
              />
              {age !== null && formData.dateOfBirth && (
                <p className="text-sm text-gray-600 mt-1 font-medium">Calculated Age: **{age} years old**</p>
              )}
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600">{errors.dateOfBirth}</p>
              )}
            </div>
            {/* Placeholder to align grid */}
            <div></div> 
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="additionalInfo" className="text-gray-700 font-semibold">Additional Information (Optional)</Label>
            <Textarea
              id="additionalInfo"
              placeholder="Any additional notes about the client or their insurance needs..."
              value={formData.additionalInfo || ''}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              rows={4}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between md:justify-end space-x-4 pt-6 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onCancel} className="text-gray-600 border-gray-300 hover:bg-gray-50">
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md">
            Continue to Package Selection
          </Button>
        </div>
      </form>
    </div>
  );
}