'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Heart,
  Activity,
  Phone,
  Mail,
  DollarSign,
  Shield
} from 'lucide-react';
import { Quote, Package, InsurancePlan } from '@/lib/types';

interface ClientPresentationProps {
  quote: Quote;
  onPackageSelect?: (packageId: string) => void;
  selectedPackageId?: string;
}

export function ClientPresentation({
  quote,
  onPackageSelect,
  selectedPackageId
}: ClientPresentationProps) {
  const carrierLogos: Record<string, string> = {
    Ameritas: '/logos/ameritas.png',
    Transamerica: '/logos/transamerica.png',
    'Manhattan Life': '/logos/manhattan-life.png',
    KonnectMD: '/logos/konnect.png',
    TRUVirtual: '/logos/virtual.png',
    Breeze: '/logos/breeze.png',
    ACA: '/logos/aca.png',
    'United Healthcare': '/logos/uhc.png',
    'Health Share': '/logos/healthshare.png',
    'Sedera Health': '/logos/sedera.jpg'
  };

  const getPlanIcon = (type: InsurancePlan['type']) => {
    switch (type) {
      case 'health':
        return <Shield className="w-4 h-4 text-blue-600" />;
      // FIX: Changed icon color from text-orange-500 to text-blue-600
      case 'healthShare':
        return <Heart className="w-4 h-4 text-blue-600" />;
      case 'catastrophic':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'dental':
        return <Activity className="w-4 h-4 text-green-600" />;
      case 'vision':
        return <Eye className="w-4 h-4 text-purple-600" />;
      case 'life':
        return <Heart className="w-4 h-4 text-red-600" />;
      case 'heart':
        return <Heart className="w-4 h-4 text-pink-600" />;
      case 'outOfPocket':
        return <DollarSign className="w-4 h-4 text-indigo-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPackageColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-slate-600 to-slate-700',
      'from-amber-500 to-amber-600',
      'from-emerald-500 to-emerald-600'
    ];
    return colors[index % colors.length];
  };

  const formatPlanDetails = (plan: InsurancePlan) => {
    const details: (string | string[])[] = [];

    // --- Health Share Plans ---
    if (plan.type === 'healthShare') {
      if (plan.coinsurance !== undefined)
        details.push(`Member Share: ${plan.coinsurance}%`);
      if (plan.deductible !== undefined)
        details.push(`Initial Unshareable Amount (IUA): $${plan.deductible.toLocaleString()}`);
      if (plan.outOfPocketMax !== undefined)
        details.push(`Max Share Amount: $${plan.outOfPocketMax.toLocaleString()}`);
      if (plan.details) details.push(plan.details);
      return details;
    }

    // --- Normal Health / Other Plans ---
    if (plan.deductible !== undefined)
      details.push(`Deductible: $${plan.deductible.toLocaleString()}`);
    if (plan.coinsurance !== undefined)
      details.push(`Coinsurance: ${plan.coinsurance}%`);

    if (plan.type === 'health' || plan.type === 'catastrophic') {
      if (plan.outOfPocketMax !== undefined)
        details.push(`Out-of-Pocket Max: $${plan.outOfPocketMax.toLocaleString()}`);
    }

    if (plan.type === 'outOfPocket' && plan.outOfPocketMax !== undefined)
      details.push(`Out-of-Pocket Max: $${plan.outOfPocketMax.toLocaleString()}`);

    // --- Coverage Formatting ---
    if (plan.provider === 'KonnectMD' || plan.type === 'outOfPocket') {
      if (Array.isArray(plan.coverage)) {
        details.push(['Coverage:', ...plan.coverage]);
      } else if (typeof plan.coverage === 'string') {
        const items = plan.coverage
          .replace(/and /gi, '')
          .split(/[,]+/)
          .map(i => i.trim())
          .filter(i => i.length > 0);
        details.push(['Coverage:', ...items]);
      }
    } else if (plan.coverage) {
      details.push(`Coverage: ${plan.coverage}`);
    }

        // --- Coverage Formatting ---
    if (plan.provider === 'TRUVirtual' || plan.type === 'outOfPocket') {
      if (Array.isArray(plan.coverage)) {
        details.push(['Coverage:', ...plan.coverage]);
      } else if (typeof plan.coverage === 'string') {
        const items = plan.coverage
          .replace(/and /gi, '')
          .split(/[,]+/)
          .map(i => i.trim())
          .filter(i => i.length > 0);
        details.push(['Coverage:', ...items]);
      }
    } else if (plan.coverage) {
      details.push(`Coverage: ${plan.coverage}`);
    }

    if (plan.details) details.push(plan.details);

    if (plan.effectiveDate) {
      const effectiveDate = new Date(plan.effectiveDate);
      details.push(`Effective Date: ${effectiveDate.toLocaleDateString('en-US')}`);
    }

    return details;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Packages Prepared For:
              </h1>
              <div className="text-2xl font-semibold text-gray-800 mb-1">
                {quote.client.name}
              </div>
              <div className="text-lg text-gray-600">
                <a href={`tel:${quote.client.phone}`} className="hover:underline">
                  {quote.client.phone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <img
                  src="https://i.ibb.co/gbLRKXn3/662-815-0033-removebg-preview.png"
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Salt & Light Insurance Group
                </div>
                <div className="text-sm text-gray-600">
                  <Phone className="w-3 h-3 inline mr-1" />
                  <a href="tel:+16624603656" className="hover:underline">
                    (662) 460-3656
                  </a>
                </div>
                <div className="text-sm text-gray-600">
                  <Mail className="w-3 h-3 inline mr-1" />
                  <a
                    href="mailto:support@saltlightinsurancegroup.com"
                    className="hover:underline"
                  >
                    support@saltlightinsurancegroup.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`grid grid-cols-1 ${
            quote.packages.length === 2
              ? 'lg:grid-cols-2'
              : quote.packages.length === 3
              ? 'lg:grid-cols-3'
              : 'lg:grid-cols-2 xl:grid-cols-4'
          } gap-6`}
        >
          {quote.packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div
                className={`bg-gradient-to-r ${getPackageColor(
                  index
                )} text-white p-4 text-center`}
              >
                <h2 className="text-xl font-bold">Package #{index + 1}</h2>
                <div className="text-sm opacity-90 mt-1">{pkg.name}</div>
              </div>

              {/* Plans */}
              <div className="p-4 flex-1 overflow-y-auto max-h-[400px] space-y-4">
                {pkg.plans.map(plan => (
                  <div
                    key={plan.id}
                    // FIX: Removed the conditional orange border/bg and applied the default gray border
                    className={`border-l-4 pl-3 border-gray-200 rounded`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {carrierLogos[plan.provider] ? (
                        <Image
                          src={carrierLogos[plan.provider]}
                          alt={plan.provider}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      ) : (
                        getPlanIcon(plan.type)
                      )}
                      <span className="font-semibold text-gray-900 uppercase tracking-wide text-sm">
                        {plan.type === 'healthShare'
                          ? 'HEALTH SHARE MEMBERSHIP'
                          : plan.type === 'outOfPocket'
                          ? 'OUT-OF-POCKET PROTECTION'
                          : plan.type === 'life'
                          ? 'LIFE INSURANCE'
                          : plan.type === 'health'
                          ? 'ACA HEALTH INSURANCE'
                          : plan.type === 'catastrophic'
                          ? 'CATASTROPHIC HEALTH PLAN'
                          : plan.type === 'dental'
                          ? 'DENTAL INSURANCE'
                          : plan.type === 'vision'
                          ? 'VISION INSURANCE'
                          : plan.type === 'cancer'
                          ? 'CANCER PROTECTION'
                          : plan.type === 'heart'
                          ? 'HEART ATTACK & STROKE PROTECTION'
                          : plan.type === 'disability'
                          ? 'SHORT-TERM DISABILITY'
                          : plan.name.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-sm text-gray-800 mb-2">{plan.name}</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {formatPlanDetails(plan).map((detail, idx) =>
                        Array.isArray(detail) ? (
                          <div key={idx}>
                            <div className="font-semibold text-gray-800">
                              {detail[0]}
                            </div>
                            <ul className="list-disc list-inside text-gray-600 ml-3">
                              {detail.slice(1).map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div key={idx}>• {detail}</div>
                        )
                      )}

                      <div className="text-blue-600 font-medium">
                        Monthly Premium: ${plan.monthlyPremium.toLocaleString()}
                      </div>

                      {plan.brochureUrl && (
                        <div className="mt-1">
                          <a
                            href={plan.brochureUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 underline text-sm"
                          >
                            View Brochure
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Monthly Total */}
              <div className="border-t-2 border-gray-200 pt-4 mb-4 text-center">
                <div className="text-lg font-semibold text-gray-700 mb-1">
                  Your Monthly Payment:
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  ${pkg.totalMonthlyPremium.toLocaleString()}
                </div>
              </div>

              {/* Button */}
              <div className="flex justify-center mt-2 mb-4">
                <Button
                  onClick={() => onPackageSelect && onPackageSelect(pkg.id)}
                  className={`px-6 py-3 text-lg font-semibold bg-gradient-to-r text-white ${getPackageColor(
                    index
                  )} hover:opacity-90 transition-opacity`}
                  variant={selectedPackageId === pkg.id ? 'default' : 'outline'}
                >
                  I want this package
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
