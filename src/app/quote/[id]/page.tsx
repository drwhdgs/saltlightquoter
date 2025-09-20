'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ClientPresentation } from '@/components/client/ClientPresentation';
import { Quote, Package, InsurancePlan } from '@/lib/types';
import { getQuoteDataByShortId, initializeStorage } from '@/lib/storage';

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function ClientQuotePage() {
  const params = useParams();
  const shortId = params?.id as string | undefined;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shortId) {
      setError('Invalid quote link format.');
      setIsLoading(false);
      console.error('No short ID found in URL');
      return;
    }

    console.log('ClientQuotePage - shortId:', shortId);
    console.log('ClientQuotePage - full URL:', window.location.href);

    try {
      initializeStorage();
      const quoteData = getQuoteDataByShortId(shortId);

      if (!quoteData || !quoteData.client || !quoteData.packages) {
        setError('Quote not found. The link may have expired or be invalid.');
        console.error('Quote data is invalid:', quoteData);
        setIsLoading(false);
        return;
      }

      // Reconstruct packages ensuring all plan fields are preserved
      const reconstructedPackages: Package[] = quoteData.packages.map((pkg: Package) => ({
        ...pkg,
        id: pkg.id || generateUniqueId(),
        plans: pkg.plans.map((plan: InsurancePlan) => ({
          ...plan,
          id: plan.id || generateUniqueId(),
          primaryCareCopay: plan.primaryCareCopay ?? 0,
          specialistCopay: plan.specialistCopay ?? 0,
          genericDrugCopay: plan.genericDrugCopay ?? 0,
          outOfPocketMax: plan.outOfPocketMax ?? plan.outOfPocket ?? 0,
        })),
        totalMonthlyPremium: pkg.plans.reduce((sum, plan) => sum + (plan.monthlyPremium || 0), 0),
      }));

      const reconstructedQuote: Quote = {
        id: 'shared',
        agentId: 'shared',
        client: quoteData.client,
        packages: reconstructedPackages,
        createdAt: quoteData.createdAt,
        updatedAt: quoteData.createdAt,
        status: 'presented',
        shareableLink: window.location.href,
      };

      setQuote(reconstructedQuote);

      const defaultPackage = reconstructedQuote.packages.find(pkg => pkg.name === 'Silver')
        || reconstructedQuote.packages[0];

      if (defaultPackage) setSelectedPackageId(defaultPackage.id);

      console.log('Reconstructed quote:', reconstructedQuote);
      console.log('Default package selected:', defaultPackage?.id);

    } catch (err) {
      setError('Unable to load quote. Please check the link and try again.');
      console.error('Error in ClientQuotePage:', err);
    } finally {
      setIsLoading(false);
    }
  }, [shortId]);

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackageId(packageId);
    const redirectUrl = `https://www.cognitoforms.com/SaltLightInsuranceGroup/ClientIntakeForm`;
    console.log('Redirecting to:', redirectUrl);
    window.open(redirectUrl, '_blank');
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your insurance quote...</p>
        <p className="text-xs text-gray-400 mt-2">Quote ID: {shortId}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 mx-auto mb-4 text-red-500">
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="text-left bg-gray-100 p-4 rounded-lg mb-4">
          <p className="text-xs text-gray-600 mb-2">Debug Information:</p>
          <p className="text-xs text-gray-600">URL: {window.location.href}</p>
          <p className="text-xs text-gray-600">Quote ID: {shortId}</p>
        </div>
        <p className="text-sm text-gray-500">Please check the link or contact your insurance agent for assistance.</p>
      </div>
    </div>
  );

  if (!quote) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Available</h1>
        <p className="text-gray-600">Unable to load the requested quote.</p>
      </div>
    </div>
  );

  return (
    <ClientPresentation
      quote={quote}
      onPackageSelect={handlePackageSelect}
      selectedPackageId={selectedPackageId || undefined}
    />
  );
}
