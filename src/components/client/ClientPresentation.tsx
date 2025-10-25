"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Phone, Mail, DollarSign, Shield, Eye, Heart, Activity } from "lucide-react";
import { Quote, InsurancePlan } from "@/lib/types";

interface ClientPresentationProps {
  quote: Quote;
  onPackageSelect?: (packageId: string) => void;
  selectedPackageId?: string;
}

export function ClientPresentation({ quote, onPackageSelect }: ClientPresentationProps) {
  const carrierLogos: Record<string, string> = {
    Ameritas: "/logos/ameritas.png",
    AmericanAmicable: "/logos/AmericanAmicable.jpeg",
    "Manhattan Life": "/logos/manhattan-life.png",
    KonnectMD: "/logos/konnect.png",
    TRUVirtual: "/logos/virtual.png",
    Breeze: "/logos/breeze.png",
    ACA: "/logos/aca.png",
    "United Healthcare": "/logos/uhc.png",
    "Health Share": "/logos/healthshare.png",
    "Sedera Health": "/logos/sedera.jpg",
  };

  const getPlanIcon = (type: InsurancePlan["type"]) => {
    switch (type) {
      case "health": return <Shield className="w-4 h-4 text-blue-600" />;
      case "healthShare": return <Heart className="w-4 h-4 text-blue-600" />;
      case "catastrophic": return <Shield className="w-4 h-4 text-red-600" />;
      case "dental": return <Activity className="w-4 h-4 text-green-600" />;
      case "vision": return <Eye className="w-4 h-4 text-purple-600" />;
      case "life": return <Heart className="w-4 h-4 text-red-600" />;
      case "heart": return <Heart className="w-4 h-4 text-pink-600" />;
      case "outOfPocket": return <DollarSign className="w-4 h-4 text-indigo-600" />;
      default: return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPackageColor = (index: number) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-slate-600 to-slate-700",
      "from-amber-500 to-amber-600",
      "from-emerald-500 to-emerald-600"
    ];
    return colors[index % colors.length];
  };

  const formatPlanDetails = (plan: InsurancePlan) => {
    const details: (string | string[])[] = [];

    if (plan.type === "healthShare") {
      if (plan.coinsurance !== undefined) details.push(`Member Share: ${plan.coinsurance}%`);
      if (plan.deductible !== undefined) details.push(`Initial Unshareable Amount (IUA): $${plan.deductible.toLocaleString()}`);
      if (plan.details) details.push(plan.details);
      return details;
    }

    if (plan.provider === "TRUVirtual") {
      if (plan.deductible !== undefined) details.push(`Initial Unshareable Amount (IUA): $${plan.deductible.toLocaleString()}`);
      const items: string[] = Array.isArray(plan.coverage)
        ? plan.coverage
        : typeof plan.coverage === "string"
        ? plan.coverage.split(/, /).map(i => i.trim()).filter(Boolean)
        : [];
      if (items.length) details.push(["Coverage:", ...items]);
      if (plan.details) details.push(plan.details);
      return details;
    }

    if (plan.type === "catastrophic") {
      if (plan.deductible !== undefined) details.push(`Deductible: $${plan.deductible.toLocaleString()}`);
      if (plan.coinsurance !== undefined) details.push(`Coinsurance: ${plan.coinsurance}%`);
      if (plan.outOfPocketMax !== undefined) details.push(`Out-of-Pocket Max: $${plan.outOfPocketMax.toLocaleString()}`);
      const items: string[] = Array.isArray(plan.coverage)
        ? plan.coverage
        : typeof plan.coverage === "string"
        ? plan.coverage.split(/, |\n|;/).map(i => i.trim()).filter(Boolean)
        : [];
      if (items.length) details.push(["Coverage:", ...items]);
      if (plan.details) details.push(plan.details);
      return details;
    }

    if (plan.deductible !== undefined) details.push(`Deductible: $${plan.deductible.toLocaleString()}`);
    if (plan.coinsurance !== undefined) details.push(`Coinsurance: ${plan.coinsurance}%`);
    if (plan.type === "health" && plan.outOfPocketMax !== undefined) details.push(`Out-of-Pocket Max: $${plan.outOfPocketMax.toLocaleString()}`);
    if (plan.type === "outOfPocket" && plan.outOfPocketMax !== undefined) details.push(`Out-of-Pocket Max: $${plan.outOfPocketMax.toLocaleString()}`);

    if (plan.provider === "KonnectMD" || plan.provider === "TRUVirtual" || plan.name === "UHC Short Term Medical - TriTerm Co-Pay") {
      const items: string[] = Array.isArray(plan.coverage)
        ? plan.coverage
        : typeof plan.coverage === "string"
        ? plan.coverage.split(/, |\n|;/).map(i => i.trim()).filter(Boolean)
        : [];
      if (items.length) details.push(["Coverage:", ...items]);
    } else if (plan.coverage) {
      details.push(`Coverage: ${plan.coverage}`);
    }

    if (plan.details) details.push(plan.details);
    if (plan.effectiveDate) details.push(`Effective Date: ${new Date(plan.effectiveDate).toLocaleDateString("en-US")}`);

    return details;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sm:sticky sm:top-0 sm:z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <div className="text-center sm:text-left w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Packages Prepared For:</h1>
              <div className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">{quote.client.name}</div>
              <div className="text-base sm:text-lg text-gray-600 break-all">
                <a href={`tel:${quote.client.phone}`} className="hover:underline">{quote.client.phone}</a>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg w-full sm:w-auto justify-center sm:justify-start">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <img src="https://i.ibb.co/gbLRKXn3/662-815-0033-removebg-preview.png" alt="Company Logo" className="w-full h-full object-cover"/>
              </div>
              <div className="text-center sm:text-left">
                <div className="font-semibold text-gray-900 text-sm sm:text-base">Salt & Light Insurance Group</div>
                <div className="text-xs sm:text-sm text-gray-600">
                  <Phone className="w-3 h-3 inline mr-1"/>
                  <a href="tel:+16624603656" className="hover:underline">(662) 460-3656</a>
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  <Mail className="w-3 h-3 inline mr-1"/>
                  <a href="mailto:support@saltlightinsurancegroup.com" className="hover:underline">support@saltlightinsurancegroup.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${quote.packages.length >= 3 ? "3" : "2"} gap-4 sm:gap-6`}>
          {quote.packages.map((pkg,index)=>(
            <div key={pkg.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
              <div className={`bg-gradient-to-r ${getPackageColor(index)} text-white p-3 sm:p-4 text-center`}>
                <h2 className="text-lg sm:text-xl font-bold">Package #{index+1}</h2>
                <div className="text-xs sm:text-sm opacity-90 mt-1">{pkg.name}</div>
              </div>

              <div className="p-3 sm:p-4 flex-1 space-y-4 overflow-visible sm:overflow-y-auto max-h-auto sm:max-h-[450px]">
                {pkg.plans.map(plan=>(
                  <div key={plan.id} className="border-l-4 pl-3 border-gray-200 rounded">
                    <div className="flex items-start sm:items-center gap-2 mb-2 flex-wrap">
                      {carrierLogos[plan.provider] ? (
                        <Image src={carrierLogos[plan.provider]} alt={plan.provider} width={20} height={20} className="object-contain"/>
                      ) : getPlanIcon(plan.type)}
                      <div>
                        <div className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">{plan.name}</div>
                        {plan.title && <div className="text-xs sm:text-sm text-gray-600 italic">{plan.title}</div>}
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                      {formatPlanDetails(plan).map((detail,idx)=>Array.isArray(detail)?(
                        <div key={idx}>
                          <div className="font-semibold text-gray-800">{detail[0]}</div>
                          <ul className="list-disc list-inside text-gray-600 ml-3">
                            {detail.slice(1).map((item,i)=><li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      ) : <div key={idx}>• {detail}</div>)}

                      <div className="text-blue-600 font-medium">
                        Monthly Premium: ${plan.monthlyPremium.toLocaleString()}{" "}
                        <span className="text-gray-600 text-xs sm:text-sm">
                          (${(plan.monthlyPremium/30).toFixed(2)} per day)
                        </span>
                      </div>

                      {plan.brochureUrl && (
                        <div className="mt-1">
                          <a href={plan.brochureUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline text-xs sm:text-sm">
                            View Brochure
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-200 pt-3 sm:pt-4 mb-3 sm:mb-4 text-center">
                <div className="text-base sm:text-lg font-semibold text-gray-700 mb-1">Your Monthly Payment:</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ${pkg.totalMonthlyPremium.toLocaleString()}{" "}
                  <span className="text-gray-600 text-xs sm:text-sm">
                    (${(pkg.totalMonthlyPremium/30).toFixed(2)} per day)
                  </span>
                </div>
              </div>

              <div className="flex justify-center mt-1 sm:mt-2 mb-3 sm:mb-4">
                <Button onClick={()=>onPackageSelect && onPackageSelect(pkg.id)} className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-semibold bg-gradient-to-r text-white ${getPackageColor(index)} hover:opacity-90 transition-opacity w-[90%] sm:w-auto`}>
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
