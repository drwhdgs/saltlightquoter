'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button'; 
import { ClientInfoForm } from './ClientInfoForm';
import { PackageSelection } from './PackageSelection';
import { QuoteReview } from './QuoteReview';
import { Client, Package, Quote, Agent } from '@/lib/types';
import { generateId, saveQuote, generateShareableLink } from '@/lib/storage';
import { ChevronLeft, Check, User, PackageOpen, FileText } from 'lucide-react'; 

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
      // Status is 'draft' when saved from the wizard, then updated to 'presented' later.
      status: existingQuote?.status || 'draft', 
      createdAt: existingQuote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // 🔥 FIX: Removed 'agent: undefined' because it does not exist on type 'Quote'
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

  const getStepIcon = (step: WizardStep) => {
    switch (step) {
      case 'client-info': return User;
      case 'package-selection': return PackageOpen;
      case 'review': return FileText;
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

  const steps: WizardStep[] = ['client-info', 'package-selection', 'review'];


  return (
    // Removed background/padding to rely on parent MainDashboard styling
    <div className="w-full"> 
      <div className="max-w-6xl mx-auto">
        
        {/* --- REVISED: Progress Steps --- */}
        <div className="mb-10 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between space-x-2 sm:space-x-8">
            {steps.map((step, index) => {
                const stepNumber = getStepNumber(step);
                const isActive = currentStep === step;
                const isCompleted = getStepNumber(currentStep) > stepNumber;
                const Icon = getStepIcon(step);

                return (
                <>
                    <div key={step} className="flex items-center flex-1">
                        <div className="flex items-center space-x-3">
                            {/* Step Indicator Circle */}
                            <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-md font-bold transition-all duration-300
                            ${isActive
                                ? 'bg-blue-600 text-white ring-4 ring-blue-100' // Active style
                                : isCompleted
                                ? 'bg-green-600 text-white' // Completed style
                                : 'bg-gray-100 text-gray-500' // Pending style
                            }
                            `}>
                            {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                            </div>
                            
                            {/* Step Title (hidden on small screens) */}
                            <div className="hidden sm:block">
                                <span className="text-xs font-semibold uppercase text-gray-500">Step {stepNumber}</span>
                                <h3 className={`
                                text-lg font-bold transition-colors
                                ${isActive ? 'text-gray-900' : 'text-gray-600'}
                                `}>
                                    {getStepTitle(step)}
                                </h3>
                            </div>
                        </div>
                    </div>
                    {/* Divider Line */}
                    {index < steps.length - 1 && (
                        <div className={`
                        flex-1 h-1 transition-all duration-300
                        ${isCompleted ? 'bg-green-600' : isActive ? 'bg-blue-300' : 'bg-gray-200'}
                        `} />
                    )}
                </>
                );
            })}
            </div>
        </div>

        {/* --- Step Content --- */}
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-8 sm:p-12">
            <header className="mb-8 border-b pb-4 flex items-center justify-between">
                <h2 className="text-3xl font-extrabold text-gray-900">{getStepTitle(currentStep)}</h2>
                {currentStep !== 'client-info' && (
                    <Button 
                        variant="outline"
                        onClick={handleBack}
                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                )}
            </header>


            {currentStep === 'client-info' && (
                <div>
                    <ClientInfoForm
                        initialData={client || undefined}
                        onSubmit={handleClientSubmit}
                        onCancel={onCancel}
                    />
                </div>
            )}

            {currentStep === 'package-selection' && client && (
                <div>
                    <PackageSelection
                        client={client}
                        initialPackages={packages.length > 0 ? packages : undefined}
                        onSubmit={handlePackageSubmit}
                        onBack={handleBack}
                    />
                </div>
            )}

            {currentStep === 'review' && client && packages.length > 0 && (
                <div>
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
