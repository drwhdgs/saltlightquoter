"use client";

import { Button } from "@/components/ui/button";
import { Phone, Mail, DollarSign } from "lucide-react"; // Keeping only necessary utility icons
import { Quote, InsurancePlan, Package } from "@/lib/types"; // Import Package type
import { useState } from "react";

interface ClientPresentationProps {
  quote: Quote;
  onPackageSelect?: (packageId: string) => void;
  selectedPackageId?: string;
}

/**
 * Calculates the appropriate effective date based on plan type.
 * FIX: Effective Date is now ONLY calculated and displayed for plans where 
 * plan.type === "health". All other plan types return undefined to hide the detail.
 */
const calculateEffectiveDate = (plan: InsurancePlan): Date | undefined => {
  if (plan.type !== "health") return undefined;

  const today = new Date();
  let dateToDisplay = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  dateToDisplay.setHours(12, 0, 0, 0); 

  if (plan.effectiveDate && typeof plan.effectiveDate === 'string' && plan.effectiveDate.length > 0) {
    let storedDate: Date;
    const parts = plan.effectiveDate.match(/(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})/);
    if (parts) {
      const isYearFirst = parts[1].length === 4;
      const year = parseInt(isYearFirst ? parts[1] : parts[3]);
      const month = parseInt(isYearFirst ? parts[2] : parts[1]) - 1;
      const day = parseInt(isYearFirst ? parts[3] : parts[2]);
      storedDate = new Date(year, month, day);
      storedDate.setHours(12, 0, 0, 0);
    } else {
      storedDate = new Date(plan.effectiveDate);
    }
    if (!isNaN(storedDate.getTime())) dateToDisplay = storedDate;
  }

  return dateToDisplay;
};

export default function ClientPresentation({
  quote,
  onPackageSelect,
}: ClientPresentationProps) {
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

  const getPackageColor = (index: number) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-slate-600 to-slate-700",
      "from-amber-500 to-amber-600",
      "from-emerald-500 to-emerald-600",
    ];
    return colors[index % colors.length];
  };

  const formatPlanDetails = (plan: InsurancePlan): (string | string[])[] => {
    const details: (string | string[])[] = [];
    const {
      type,
      deductible,
      coinsurance,
      outOfPocketMax,
      primaryCareCopay,
      specialistCopay,
      genericDrugCopay,
      annualMax,
      deathBenefit,
      term,
      coPay,
      coverage,
      details: planDetails,
    } = plan;

    const addDetail = (
      label: string,
      value: number | string | undefined,
      formatter: (v: number | string) => string = (v) =>
        typeof v === "number" ? v.toLocaleString() : v,
      isMonetary: boolean = true,
      forceString: boolean = false
    ) => {
      if (value !== undefined && value !== null && value !== "") {
        let cleanedValue = value;
        let numericValue = NaN;
        let finalPrefix = '';
        let formattedValue = '';

        if (!forceString) {
          cleanedValue = typeof value === 'string' ? value.toString().replace(/[^0-9.]/g, '') : value;
          numericValue = Number(cleanedValue);
        }

        if (forceString || isNaN(numericValue) || (typeof value === 'string' && value.toString().length === 0)) {
          const originalValue = String(value);
          formattedValue = formatter(originalValue);
          if (isMonetary && !originalValue.trim().startsWith('$') && !formattedValue.endsWith('%')) finalPrefix = '$';
        } else {
          formattedValue = formatter(numericValue);
          finalPrefix = isMonetary && !formattedValue.endsWith('%') ? '$' : '';
        }

        details.push(`${label}: ${finalPrefix}${formattedValue}`);
      }
    };

const addCoverageList = (listTitle: string = "Coverage:") => {
  if (!coverage) return;
  let items: string[] = [];

  if (Array.isArray(coverage)) {
    items = coverage;
  } else if (typeof coverage === "string") {
    // Split on newline first
    items = coverage
      .split(/\n/)
      .map((i) => i.trim())
      .filter(Boolean);

    // If still 1 item, split on commas **not inside numbers**
    if (items.length <= 1) {
      items = coverage
        .split(/,(?=\s*[^\d])/g) // Split on comma NOT followed by a digit
        .map((i) => i.trim())
        .filter(Boolean);
    }
  }

  if (items.length > 1) details.push([listTitle, ...items]);
  else if (items.length === 1) details.push(`${listTitle} ${items[0]}`);
  else if (typeof coverage === "string" && coverage.length > 0) details.push(`${listTitle} ${coverage}`);
};

    if (type === "healthShare") {
      addDetail("Member Share", coinsurance, (v) => `${v}%`, false);
      addDetail("Initial Unshareable Amount (IUA)", deductible);
      addCoverageList();
    } else if (type === "konnect" || plan.provider === "TRUVirtual") {
      addCoverageList("Services Included:");
      addDetail("Initial Unshareable Amount (IUA)", deductible);
    } else if (type === "catastrophic") {
      addDetail("Deductible", deductible);
      addDetail("Coinsurance", coinsurance, (v) => `${v}%`, false);
      addDetail("Out-of-Pocket Max", outOfPocketMax);
      addCoverageList();
    } else if (type === "health") {
      addDetail("Deductible", deductible);
      addDetail("Coinsurance", coinsurance, (v) => `${v}%`, false);
      addDetail("Out-of-Pocket Max", outOfPocketMax);
      addDetail("Primary Care Co-pay", primaryCareCopay);
      addDetail("Specialist Co-pay", specialistCopay);
      addDetail("Generic Drug Co-pay", genericDrugCopay);
      addCoverageList();
    } else if (type === "life") {
      addDetail("Coverage Amount", deathBenefit, undefined, true, false);
      if (term) addDetail("Term Length", term, (v) => `${v} Years`, false, true);
      addCoverageList();
    } else if (type === "dental" || type === "vision") {
      addDetail("Deductible", deductible);
      addDetail("Annual Max Benefit", annualMax);
      addDetail("Co-pay", coPay);
      addCoverageList("Key Benefits:");
    } else if (["cancer", "heart", "outOfPocket", "disability"].includes(type)) {
      addDetail("Deductible", deductible);
      addDetail("Coinsurance", coinsurance, (v) => `${v}%`, false);
      addDetail("Annual Max Benefit", annualMax);
      addCoverageList("Key Benefits:");
    }

    if (planDetails) details.push(planDetails);

    const dateToDisplay = calculateEffectiveDate(plan);
    if (dateToDisplay) details.push(`Effective Date: ${dateToDisplay.toLocaleDateString("en-US")}`);

    return details;
  };

  const PlanLogo: React.FC<{ plan: InsurancePlan }> = ({ plan }) => {
    const logoUrl = carrierLogos[plan.provider];
    const [imageLoaded, setImageLoaded] = useState(true);

    if (!logoUrl || !imageLoaded) {
      const initial = plan.provider.charAt(0).toUpperCase();
      return (
        <div className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full font-bold text-xs text-gray-700 shadow-sm flex-shrink-0">
          {initial}
        </div>
      );
    }

    return (
      <img
        src={logoUrl}
        alt={`${plan.provider} logo`}
        width={24}
        height={24}
        className="object-contain w-6 h-6 border border-gray-100 flex-shrink-0"
        onError={() => setImageLoaded(false)}
      />
    );
  };

  const packageOrder: string[] = ["ACA Bronze", "ACA Silver", "Private Health", "Health Share", "Catastrophic"];
  const sortedPackages = [...quote.packages].sort((a, b) => {
    const indexA = packageOrder.indexOf(a.name);
    const indexB = packageOrder.indexOf(b.name);
    return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white shadow-lg border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-left w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
                Insurance Options for:
              </h1>
              <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                {quote.client.name}
              </div>
             <div className="text-base sm:text-lg text-gray-600">
  <a
    href={`tel:${quote.client.phone}`}
    className="hover:text-blue-600 transition"
  >
    {quote.client.phone.replace(
      /(\d{3})(\d{3})(\d{4})/,
      "($1) $2-$3"
    )}
  </a>
</div>
            </div>

            <div className="flex items-center gap-4 bg-gray-100 p-4 rounded-xl shadow-inner w-full sm:w-auto justify-center sm:justify-start">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center border-2 border-gray-200">
                <img
                  src="https://i.ibb.co/gbLRKXn3/662-815-0033-removebg-preview.png"
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 text-sm">
                  Salt & Light Insurance Group
                </div>
                <div className="text-xs text-gray-600 flex items-center mt-1">
                  <Phone className="w-3 h-3 inline mr-1 text-teal-600" />
                  <a href="tel:+16624603656" className="hover:text-teal-700">
                    (662) 460-3656
                  </a>
                </div>
                <div className="text-xs text-gray-600 flex items-center">
                  <Mail className="w-3 h-3 inline mr-1 text-teal-600" />
                  <a href="mailto:support@saltlightinsurancegroup.com" className="hover:text-teal-700">
                    support@saltlightinsurancegroup.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${quote.packages.length >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
          {sortedPackages.map((pkg, index) => (
            <div key={pkg.id} className="bg-white rounded-xl shadow-2xl hover:shadow-3xl transition-shadow flex flex-col overflow-hidden transform lg:h-full lg:min-h-[600px]">
              <div className={`bg-gradient-to-r ${getPackageColor(index)} text-white p-5 text-center flex-shrink-0`}>
                <h2 className="text-xl sm:text-2xl font-black tracking-wide">{pkg.name} Package</h2>
                <div className="text-sm opacity-90 mt-1 italic">{pkg.description || ""}</div>
              </div>
              <div className="p-5 flex-1 space-y-5 overflow-visible lg:max-h-[400px] lg:overflow-y-auto">
                {pkg.plans.map((plan) => (
                  <div key={plan.id} className="border-l-4 pl-4 py-1 border-blue-400/70 bg-blue-50/50 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <PlanLogo plan={plan} />
                      <div>
                        <div className="text-base font-bold text-gray-900 leading-tight">{plan.name || plan.title}</div>
                        <div className="text-xs text-gray-600 italic">({plan.provider})</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1 ml-1">
                      {formatPlanDetails(plan).map((detail, idx) =>
                        Array.isArray(detail) ? (
                          <div key={idx} className="mt-2">
                            <div className="font-semibold text-gray-800">{detail[0]}</div>
                            <ul className="list-disc list-inside text-gray-600 ml-3">{detail.slice(1).map((item, i) => <li key={i}>{item}</li>)}</ul>
                          </div>
                        ) : (
                          <div key={idx} className="text-sm">• {detail}</div>
                        )
                      )}
                      <div className="text-green-600 font-extrabold text-sm pt-2 flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Monthly Premium: ${plan.monthlyPremium.toLocaleString()}
                      </div>
                      {plan.brochureUrl && (
                        <div className="mt-2">
                          <a href={plan.brochureUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline text-sm font-medium transition">
                            View Plan Brochure
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-gray-100 p-5 pt-4 text-center flex-shrink-0">
                <div className="text-lg font-semibold text-gray-700 mb-1">Total Monthly Payment:</div>
                <div className="text-4xl font-black text-gray-900 mb-3">
                  ${pkg.totalMonthlyPremium.toLocaleString()}{" "}
                  <span className="text-gray-500 text-sm font-normal">(${(pkg.totalMonthlyPremium / 30).toFixed(2)} / day)</span>
                </div>
                <Button onClick={() => onPackageSelect && onPackageSelect(pkg.id)} className={`px-8 py-3 text-lg font-bold bg-gradient-to-r ${getPackageColor(index)} text-white rounded-full shadow-lg hover:opacity-90 transition-opacity w-full`}>
                  Select This Package
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
