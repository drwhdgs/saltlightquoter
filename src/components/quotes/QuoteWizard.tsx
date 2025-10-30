'use client';

import { useState } from 'react';
import { ClientInfoForm } from './ClientInfoForm';
import { PackageSelection } from './PackageSelection';
import { QuoteReview } from './QuoteReview';
import { Client, Package, Quote, Agent } from '@/lib/types';
import { generateId, saveQuote, generateShareableLink } from '@/lib/storage';

interface QuoteWizardProps {
  agent: Agent;
  existingQuote?: Quote;
  onComplete: (quote: Quote) => void;
  onCancel: () => void;
}

type WizardStep = 'client-info' | 'package-selection' | 'review';

export function QuoteWizard({ agent, existingQuote, onComplete, onCancel }: QuoteWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('client-info');
  const [client, setClient] = useState<Client | null>(existingQuote?.client || null);
  const [packages, setPackages] = useState<Package[]>(existingQuote?.packages || []);

  const handleClientSubmit = (clientData: Client) => {
    setClient(clientData);
    setCurrentStep('package-selection');
  };

  const handlePackageSubmit = (selectedPackages: Package[]) => {
    setPackages(selectedPackages);
    setCurrentStep('review');
  };

  const handleQuoteComplete = () => {
    if (!client || packages.length === 0) return;

    const quote: Quote = {
      id: existingQuote?.id || generateId(),
      agentId: agent.id,
      client,
      packages,
      createdAt: existingQuote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'completed',
    };

    // Generate shareable link - this will be consistent for the same quote
    quote.shareableLink = generateShareableLink(quote);

    saveQuote(quote);
    onComplete(quote);
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'package-selection':
        setCurrentStep('client-info');
        break;
      case 'review':
        setCurrentStep('package-selection');
        break;
    }
  };

  const getStepNumber = (step: WizardStep): number => {
    switch (step) {
      case 'client-info': return 1;
      case 'package-selection': return 2;
      case 'review': return 3;
      default: return 1;
    }
  };

  const getStepTitle = (step: WizardStep): string => {
    switch (step) {
      case 'client-info': return 'Client Information';
      case 'package-selection': return 'Package Selection';
      case 'review': return 'Review & Generate';
      default: return 'Client Information';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {(['client-info', 'package-selection', 'review'] as WizardStep[]).map((step, index) => {
              const stepNumber = getStepNumber(step);
              const isActive = currentStep === step;
              const isCompleted = getStepNumber(currentStep) > stepNumber;

              return (
                <div key={step} className="flex items-center">
                  <div className="flex items-center space-x-2">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }
                    `}>
                      {isCompleted ? '✓' : stepNumber}
                    </div>
                    <span className={`
                      text-lg font-medium
                      ${isActive ? 'text-blue-500' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                    `}>
                      {getStepTitle(step)}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`
                      w-16 h-px mx-4
                      ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {currentStep === 'client-info' && (
            <div className="p-8">
              <ClientInfoForm
                initialData={client || undefined}
                onSubmit={handleClientSubmit}
                onCancel={onCancel}
              />
            </div>
          )}

          {currentStep === 'package-selection' && client && (
            <div className="p-8">
              <PackageSelection
                client={client}
                initialPackages={packages.length > 0 ? packages : undefined}
                onSubmit={handlePackageSubmit}
                onBack={handleBack}
              />
            </div>
          )}

          {currentStep === 'review' && client && packages.length > 0 && (
            <div className="p-8">
              <QuoteReview
                client={client}
                packages={packages}
                onComplete={handleQuoteComplete}
                onBack={handleBack}
                onEditClient={() => setCurrentStep('client-info')}
                onEditPackages={() => setCurrentStep('package-selection')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
