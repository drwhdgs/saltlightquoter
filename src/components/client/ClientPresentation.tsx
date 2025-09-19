'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Eye,
  Heart,
  Activity,
  Phone,
  Mail,
  DollarSign,
  User,
  CheckCircle
} from 'lucide-react';
import { Quote, Package, InsurancePlan } from '@/lib/types';

interface ClientPresentationProps {
  quote: Quote;
  onPackageSelect?: (packageId: string) => void;
  selectedPackageId?: string;
}

export function ClientPresentation({ quote, onPackageSelect, selectedPackageId }: ClientPresentationProps) {
  const getPlanIcon = (type: InsurancePlan['type']) => {
    switch (type) {
      case 'health': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'dental': return <Activity className="w-4 h-4 text-green-600" />;
      case 'vision': return <Eye className="w-4 h-4 text-purple-600" />;
      case 'life': return <Heart className="w-4 h-4 text-red-600" />;
      case 'cancer': return <Shield className="w-4 h-4 text-orange-600" />;
      case 'heart': return <Heart className="w-4 h-4 text-pink-600" />;
      case 'outOfPocket': return <DollarSign className="w-4 h-4 text-indigo-600" />;
      case 'breeze': return <CheckCircle className="w-4 h-4 text-teal-600" />;
      case 'disability': return <Shield className="w-4 h-4 text-gray-600" />;
      default: return <Shield className="w-4 h-4 text-blue-600" />;
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
    const details = [];
    if (plan.deductible) details.push(`• Deductible: $${plan.deductible.toLocaleString()}`);
    if (plan.copay) details.push(`• Copay: $${plan.copay}`);
    if (plan.coverage) details.push(`• ${plan.coverage}`);
    if (plan.details) details.push(`• ${plan.details}`);
    return details;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Client Information */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Packages Prepared For:</h1>
              <div className="text-2xl font-semibold text-gray-800 mb-1">{quote.client.name}</div>
              <div className="text-lg text-gray-600">
                <a href={`tel:${quote.client.phone}`} className="hover:underline">
                  {quote.client.phone}
                </a>
              </div>
            </div>

            {/* Agent Information */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
              {/* Logo */}
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <img
                  src="https://i.ibb.co/gbLRKXn3/662-815-0033-removebg-preview.png" // replace with your logo path
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Agent Details */}
              <div>
                <div className="font-semibold text-gray-900">
                  Salt & Light Insurance Group
                </div>
                <div className="text-sm text-gray-600">
                  <Phone className="w-3 h-3 inline mr-1" />
                  <a href="tel:6628828179" className="hover:underline">(662) 882-8179</a>
                </div>
                <div className="text-sm text-gray-600">
                  <Mail className="w-3 h-3 inline mr-1" />
                  <a href="mailto:info@saltlightinsurancegroup.com" className="hover:underline">
                    info@saltlightinsurancegroup.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid grid-cols-1 ${quote.packages.length === 2 ? 'lg:grid-cols-2' : quote.packages.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2 xl:grid-cols-4'} gap-6`}>
          {quote.packages.map((pkg, index) => (
            <div key={pkg.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Package Header */}
              <div className={`bg-gradient-to-r ${getPackageColor(index)} text-white p-4 text-center`}>
                <h2 className="text-xl font-bold">Package #{index + 1}</h2>
                <div className="text-sm opacity-90 mt-1">{pkg.name}</div>
              </div>

              {/* Package Content */}
              <div className="p-4">
                <div className="space-y-4 mb-6">
                  {pkg.plans.map((plan) => (
                    <div key={plan.id} className="border-l-4 border-gray-200 pl-3">
                      <div className="flex items-center gap-2 mb-1">
                        {getPlanIcon(plan.type)}
                        <span className="font-semibold text-gray-900 uppercase tracking-wide text-sm">
                          {plan.type === 'outOfPocket' ? 'OUT-OF-POCKET PROTECTION' :
                           plan.type === 'life' ? 'LIFE INSURANCE' :
                           plan.type === 'health' ? 'ACA PLAN' :
                           plan.name.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-sm text-gray-800 mb-2">{plan.name}</div>

                      <div className="text-xs text-gray-600 space-y-1">
                        {formatPlanDetails(plan).map((detail, idx) => (
                          <div key={idx}>{detail}</div>
                        ))}
                        <div className="text-blue-600 font-medium">
                          Monthly Premium: ${plan.monthlyPremium}
                        </div>
                      </div>

                      {plan.type === 'health' && (
                        <div className="mt-2 text-xs">
                          <div className="text-green-600">✓ ACA COMPLIANT PLAN</div>
                          <div className="text-green-600">✓ 100% Coverage of ALL Preventative Care!</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Monthly Payment */}
                <div className="border-t-2 border-gray-200 pt-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-700 mb-1">
                      Your Monthly Payment:
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      ${pkg.totalMonthlyPremium.toLocaleString()}
                    </div>
                  </div>
                </div>

                <Button
  onClick={() => window.open(
    'https://www.cognitoforms.com/SaltLightInsuranceGroup/ClientIntakeForm',
    '_blank', // opens in new tab/window
    'noopener,noreferrer' // security best practice
  )}
  className={`w-full py-3 text-lg font-semibold bg-gradient-to-r ${getPackageColor(index)} hover:opacity-90 transition-opacity`}
>
  I want this package
</Button>



                {index === 1 && (
                  <div className="text-center mt-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ⭐ Most Popular Choice
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

       
        {/* Contact Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Have Questions? We're Here to Help
          </h3>
          <p className="text-gray-600 mb-6">
            Our insurance experts are ready to answer your questions and help you choose the right coverage.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">
                <a href="tel:6628828179" className="hover:underline">Call: (662) 882-8179</a>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">
                <a href="mailto:info@saltlightinsurancegroup.com" className="hover:underline">Email: info@saltlightinsurancegroup.com</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
