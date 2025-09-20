'use client';

import { useState } from 'react';
import { generateShareableLink, decodeQuoteFromUrl } from '@/lib/storage';
import { Quote, Client, Package, InsurancePlan } from '@/lib/types';

export default function TestQuotePage() {
  const [testResult, setTestResult] = useState<string>('');

  const createTestQuote = (): Quote => {
    const testClient: Client = {
      name: 'John Doe',
      zipCode: '90210',
      dateOfBirth: '1990-01-01',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      additionalInfo: 'Test client',
    };

    const testPackages: Package[] = [
      {
        id: 'pkg1',
        name: 'Bronze',
        description: 'Basic coverage',
        plans: [
          {
            id: 'plan1',
            type: 'health',
            name: 'Basic Health Plan',
            provider: 'ACA',
            monthlyPremium: 300,
            deductible: 5000,
            primaryCareOutOfPocket: 30,
            specialistOutOfPocket: 50,
            genericDrugOutOfPocket: 10,
            coverage: 'Basic health coverage',
            details: 'Basic ACA plan',
          } as InsurancePlan,
        ],
        totalMonthlyPremium: 300,
      },
    ];

    return {
      id: 'test-quote',
      agentId: 'test-agent',
      client: testClient,
      packages: testPackages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'completed',
    };
  };

  const runTest = () => {
    try {
      setTestResult('Starting ultra-compression test...\n');

      // Create test quote
      const testQuote = createTestQuote();
      setTestResult(prev => prev + 'Created test quote\n');

      // Generate ultra-short shareable link
      const shareableLink = generateShareableLink(testQuote);
      setTestResult(prev => prev + `Generated ultra-short link: ${shareableLink}\n`);
      setTestResult(prev => prev + `Total URL length: ${shareableLink.length} characters\n`);

      // Extract encoded data from the link
      const urlParts = shareableLink.split('/quote/');
      if (urlParts.length < 2) throw new Error('Invalid shareable link format');
      const encodedData = urlParts[1];

      setTestResult(prev => prev + `Encoded data length: ${encodedData.length} characters\n`);
      setTestResult(prev => prev + `Encoded data: ${encodedData}\n`);

      // Decode data
      const decodedData: Quote | null = decodeQuoteFromUrl(encodedData);

      if (decodedData?.client && decodedData?.packages) {
        setTestResult(prev =>
          prev +
          '✅ Test PASSED - Ultra-compressed quote works correctly!\n' +
          `Client: ${decodedData.client.name}\n` +
          `Packages: ${decodedData.packages.map(p => p.name).join(', ')}\n` +
          `🎉 URL is now ${shareableLink.length} characters (much shorter!)\n`
        );
      } else {
        setTestResult(prev => prev + '❌ Test FAILED - Decoded data is invalid\n');
      }
    } catch (error: any) {
      setTestResult(prev => prev + `❌ Test FAILED with error: ${error.message || error}\n`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Ultra-Compressed Quote Links Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={runTest}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Ultra-Compression
          </button>
        </div>

        {testResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Test Results:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
