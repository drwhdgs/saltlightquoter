"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Shield,
  Eye,
  Heart,
  Activity,
  DollarSign,
  Edit
} from 'lucide-react';
import { Client, Package, InsurancePlan } from '@/lib/types';

interface QuoteReviewProps {
  client: Client;
  packages: Package[];
  onComplete: () => void;
  onBack: () => void;
  onEditClient: () => void;
  onEditPackages: () => void;
}

export function QuoteReview({
  client,
  packages,
  onComplete,
  onBack,
  onEditClient,
  onEditPackages
}: QuoteReviewProps) {
  const totalMonthlyPremium = packages.reduce((sum, pkg) => sum + pkg.totalMonthlyPremium, 0);
  const totalAnnualPremium = totalMonthlyPremium * 12;

  const carrierLogos: Record<string, string> = {
    "Ameritas": "/logos/ameritas.png",
    "American Amicable": "/logos/AmericanAmicable.jpeg",
    "Manhattan Life": "/logos/manhattan-life.png",
    KonnectMD: "/logos/konnect.png",
    TRUVirtual: "/logos/virtual.png",
    Breeze: "/logos/breeze.png",
    "Ambetter - HMO": "/logos/aca.png",
    "United Healthcare": "/logos/uhc.png",
    "Health Share": "/logos/healthshare.png",
    "Sedera Health": "/logos/sedera.jpg",
  };

  const getPlanIcon = (type: InsurancePlan['type']) => {
    switch (type) {
      case 'health': return <Shield className="w-4 h-4" />;
      case 'catastrophic': return <Shield className="w-4 h-4 text-red-500" />;
      case 'dental': return <Activity className="w-4 h-4" />;
      case 'vision': return <Eye className="w-4 h-4" />;
      case 'life': return <Heart className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Review Quote</h2>
        <p className="text-gray-600 mt-2">
          Review all details before generating the final quote
        </p>
      </div>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Client Information
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onEditClient}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{client.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-medium">{calculateAge(client.dateOfBirth)} years old</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">ZIP Code</p>
                  <p className="font-medium">{client.zipCode}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium break-words">{client.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>
              {client.additionalInfo && (
                <div>
                  <p className="text-sm text-gray-600">Additional Information</p>
                  <p className="font-medium">{client.additionalInfo}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Packages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Selected Packages ({packages.length})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onEditPackages}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {packages.map((pkg, index) => (
            <div key={pkg.id}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {pkg.name}
                    {pkg.name === 'ACA Silver' && <Badge variant="secondary">Recommended</Badge>}
                  </h3>
                  <p className="text-sm text-gray-600">{pkg.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    ${pkg.totalMonthlyPremium.toLocaleString()}/mo
                  </p>
                  <p className="text-sm text-gray-600">
                    ${(pkg.totalMonthlyPremium * 12).toLocaleString()}/year
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {pkg.plans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
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
                        <h4 className="font-medium">{plan.name}</h4>
                        <Badge variant="outline">{plan.provider}</Badge>
                      </div>
                      <span className="font-medium text-green-600">
                        ${plan.monthlyPremium}/mo
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3">
                      {plan.deductible !== undefined && (
                        <div>
                          <p className="text-gray-600">Deductible</p>
                          <p className="font-medium">${plan.deductible.toLocaleString()}</p>
                        </div>
                      )}
                      {(plan.type === 'health' || plan.type === 'catastrophic') && (
                        <>
                          {plan.primaryCareCopay !== undefined && (
                            <div>
                              <p className="text-gray-600">Primary Care Copay</p>
                              <p className="font-medium">${plan.primaryCareCopay}</p>
                            </div>
                          )}
                          {plan.specialistCopay !== undefined && (
                            <div>
                              <p className="text-gray-600">Specialist Copay</p>
                              <p className="font-medium">${plan.specialistCopay}</p>
                            </div>
                          )}
                          {plan.genericDrugCopay !== undefined && (
                            <div>
                              <p className="text-gray-600">Generic Drug Copay</p>
                              <p className="font-medium">${plan.genericDrugCopay}</p>
                            </div>
                          )}
                          {plan.outOfPocketMax !== undefined && (
                            <div>
                              <p className="text-gray-600">Out-of-Pocket Max</p>
                              <p className="font-medium">${plan.outOfPocketMax.toLocaleString()}</p>
                            </div>
                          )}
                        </>
                      )}
                      {plan.coinsurance !== undefined && (
                        <div>
                          <p className="text-gray-600">Coinsurance</p>
                          <p className="font-medium">{plan.coinsurance}%</p>
                        </div>
                      )}
                      {plan.coverage && (
                        <div>
                          <p className="text-gray-600">Coverage</p>
                          <p className="font-medium">{plan.coverage}</p>
                        </div>
                      )}
                      {plan.effectiveDate && (
                        <div>
                          <p className="text-gray-600">Effective Date</p>
                          <p className="font-medium">{plan.effectiveDate}</p>
                        </div>
                      )}
                    </div>

                    {plan.details && (
                      <p className="text-sm text-gray-600 mt-2">{plan.details}</p>
                    )}
                  </div>
                ))}
              </div>

              {index < packages.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quote Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Quote Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Packages:</span>
              <span className="font-medium">{packages.length}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Plans:</span>
              <span className="font-medium">
                {packages.reduce((sum, pkg) => sum + pkg.plans.length, 0)}
              </span>
            </div>

            <Separator />

            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <p className="text-sm text-blue-600">
                <strong>Next Steps:</strong> Once generated, you'll receive a shareable link
                to present these packages to your client. The client will be able to review
                all options and make their selection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back to Packages
        </Button>
        <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
          Generate Quote & Create Shareable Link
        </Button>
      </div>
    </div>
  );
}
