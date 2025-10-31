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
 * - NEW LOGIC: Only "health" plans get the First day of the next month.
 * - All others: The next day.
 * Prioritizes a date manually set in the plan object.
 */
const calculateEffectiveDate = (plan: InsurancePlan): Date | undefined => {
  // 1. If date is explicitly provided in the data and is a non-empty string, use it.
  if (plan.effectiveDate && typeof plan.effectiveDate === 'string' && plan.effectiveDate.length > 0) {
    let date: Date;
    
    // FIX: Manually parse the date string to construct the date in local time,
    // which prevents the UTC-midnight parsing error that causes the date rollback.
    const parts = plan.effectiveDate.match(/(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})/);
    
    if (parts) {
      // Logic to handle MM/DD/YYYY or YYYY-MM-DD
      const isYearFirst = parts[1].length === 4;
      const year = parseInt(isYearFirst ? parts[1] : parts[3]);
      // Month is 0-indexed in JS, so we subtract 1
      const month = parseInt(isYearFirst ? parts[2] : parts[1]) - 1; 
      const day = parseInt(isYearFirst ? parts[3] : parts[2]);

      // Construct date in local time, and set it to noon for safety
      date = new Date(year, month, day);
      date.setHours(12, 0, 0, 0);

    } else {
      // Fallback for non-standard formats
      date = new Date(plan.effectiveDate);
    }
    
    // Check if the resulting date object is valid
    if (!isNaN(date.getTime())) {
        return date;
    }
  }

  // 2. Otherwise, calculate the automatic date.
  const today = new Date();
  
  // 🛑 START OF NEW LOGIC
  // Correctly identify plans requiring the first of the next month: ONLY "health"
  const isFirstOfNextMonthPlan = plan.type === "health";
  // 🛑 END OF NEW LOGIC
  
  let dateToDisplay: Date;

  if (isFirstOfNextMonthPlan) {
    // "health" Plans: First day of the next month (e.g., 11/01/2025)
    // Setting day to 1 and month to next month handles year rollover automatically
    dateToDisplay = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  } else {
    // All other products: Next day
    dateToDisplay = new Date(today);
    dateToDisplay.setDate(today.getDate() + 1);
  }
  
  // OPTIMIZATION: Set the time to 12:00 PM local time to prevent 
  // timezone-related display issues (e.g., rolling back to the previous day)
  dateToDisplay.setHours(12, 0, 0, 0); 
  
  return dateToDisplay;
};


export default function ClientPresentation({
  quote,
  onPackageSelect,
}: ClientPresentationProps) {
  // Map of provider names to their logo paths
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

    /**
     * Helper to add a detail, applying the correct formatting and prefix.
     */
    const addDetail = (
      label: string,
      value: number | string | undefined,
      formatter: (v: number | string) => string = (v) =>
        typeof v === "number" ? v.toLocaleString() : v,
      isMonetary: boolean = true,
      forceString: boolean = false
    ) => {
      // NOTE: We check for undefined/null/empty string, but explicitly allow 0
      if (value !== undefined && value !== null && value !== "") {
        
        let cleanedValue = value;
        let numericValue = NaN;
        let finalPrefix = '';
        let formattedValue = '';
        
        if (!forceString) {
          // Attempt to clean and parse the value as a number if not forced to string
          cleanedValue = typeof value === 'string' ? value.toString().replace(/[^0-9.]/g, '') : value;
          numericValue = Number(cleanedValue);
        }

        // --- Formatting Logic ---
        if (forceString || isNaN(numericValue) || typeof value === 'string' && value.toString().length === 0) {
            // Case 1: Force String OR Not a recognizable number
            const originalValue = String(value);
            formattedValue = formatter(originalValue);
            
            // Check if the string already has a monetary or percentage sign
            if (isMonetary && !originalValue.trim().startsWith('$') && !formattedValue.endsWith('%')) {
                // If it's descriptive money text (like "$25,000 term life insurance"), just show the text clean.
                // We'll trust the input string for descriptive non-numerical values.
                finalPrefix = ''; 
                formattedValue = originalValue;
            } else if (isMonetary && originalValue.trim().startsWith('$')) {
                // Already has a dollar sign
                finalPrefix = '';
            } else if (formattedValue.endsWith('%')) {
                // Percentage (non-monetary)
                finalPrefix = '';
            } else if (isMonetary && originalValue.match(/^[0-9,.]/)) {
                // Looks like a clean number string, but not parsed as a number (e.g. from editor)
                finalPrefix = '$';
            } else {
                 finalPrefix = '';
            }
        } else {
            // Case 2: Valid Number (numericValue is a number)
            const valueToFormat = numericValue;
            formattedValue = formatter(valueToFormat);
            finalPrefix = isMonetary && !formattedValue.endsWith('%') ? '$' : '';
        }

        // --- Push final detail ---
        details.push(`${label}: ${finalPrefix}${formattedValue}`);
      }
    };

    // Helper for coverage lists
    const addCoverageList = (listTitle: string = "Coverage:") => {
      if (coverage) {
        let items: string[] = [];

        if (Array.isArray(coverage)) {
          items = coverage;
        } else if (typeof coverage === "string") {
          // Try to split on newlines first
          items = coverage
              .split(/\n/)
              .map((i) => i.trim())
              .filter(Boolean);

          // If splitting by newline didn't work (items.length <= 1) and the string contains common list separators,
          // split by comma or semi-colon to catch the long string format.
          if (items.length <= 1 && (coverage.includes(',') || coverage.includes(';') || coverage.includes(':'))) {
            // Use a regex to split by comma, semi-colon, or a sequence like 'X: ' which indicates a list item
            // This is a robust attempt to parse an inline list string.
            items = coverage
              .split(/,\s*(?=[A-Z])|;\s*(?=[A-Z])/) // Split by ',' or ';' followed by a space and an uppercase letter (to avoid splitting numbers)
              .map((i) => i.trim())
              .filter(Boolean);

            // Final fallback: if it's still one item, and it contains common separators, split by basic comma
             if (items.length <= 1 && coverage.includes(',')) {
                items = coverage
                    .split(/,\s*/)
                    .map((i) => i.trim())
                    .filter(Boolean);
            }
          }
        }

        // Add to the main details array only if we have items
        if (items.length > 1) {
          details.push([listTitle, ...items]);
        } else if (items.length === 1) {
          details.push(`${listTitle} ${items[0]}`);
        }
      }
    };

    // --- TYPE-SPECIFIC LOGIC ---

    // 1. Health Share (Specific terms: IUA, Member Share)
    if (type === "healthShare") {
      // Coinsurance is a percentage, so isMonetary is false
      addDetail("Member Share", coinsurance, (v) => `${v}%`, false);
      addDetail("Initial Unshareable Amount (IUA)", deductible);
      addCoverageList();
    }
    // 2. Telehealth/Virtual Care (Konnect)
    else if (type === "konnect" || plan.provider === "TRUVirtual") {
      addCoverageList("Services Included:");
      addDetail("Initial Unshareable Amount (IUA)", deductible);
    }
    // 3. Catastrophic/Short Term Medical (Exclude copays)
    else if (type === "catastrophic") {
      addDetail("Deductible", deductible);
      // Coinsurance is a percentage, so isMonetary is false
      addDetail("Coinsurance", coinsurance, (v) => `${v}%`, false);
      addDetail("Out-of-Pocket Max", outOfPocketMax);
      // CALLING THE UPDATED HELPER HERE
      addCoverageList();
      // Excluded: primaryCareCopay, specialistCopay, genericDrugCopay
    }
    // 4. Health (ACA - Comprehensive)
    else if (type === "health") {
      addDetail("Deductible", deductible);
      // Coinsurance is a percentage, so isMonetary is false
      addDetail("Coinsurance", coinsurance, (v) => `${v}%`, false);
      addDetail("Out-of-Pocket Max", outOfPocketMax);
      addDetail("Primary Care Co-pay", primaryCareCopay);
      addDetail("Specialist Co-pay", specialistCopay);
      addDetail("Generic Drug Co-pay", genericDrugCopay);
      addCoverageList();
    }
    // 5. Life Insurance (Death Benefit, Term, Coverage) - UPDATED
    else if (type === "life") {
      // The previous logic (forceString: true) prevented monetary formatting for raw numerical coverage amounts.
      // Changing to isMonetary: true, forceString: false allows raw numbers (e.g., 250000) to be formatted as $250,000.
      addDetail("Coverage Amount", deathBenefit, undefined, true, false); 
      
      // Show Term Length (Non-monetary, non-formattable)
      // NEW: Enforce (number) Years format for term.
      if (term) {
        addDetail(
          "Term Length", 
          term, 
          (v) => `${v} Years`, // Custom formatter to append " Years"
          false, 
          true
        );
      }

      // Show Coverage (Riders/Summary) - FIX APPLIED HERE
      if (coverage) {
        // Ensure coverage is treated as a list of items or a single descriptive block
        const coverageItems = Array.isArray(coverage) 
            ? coverage 
            : typeof coverage === 'string' 
            ? coverage.split(/\n/) // Only split on newlines for cleaner list formatting
                      .map((i) => i.trim())
                      .filter(Boolean)
            : [];
            
        // If multiple items, display as a list
        if (coverageItems.length > 1) {
            details.push(["Coverage:", ...coverageItems]); 
        } else if (coverageItems.length === 1) {
            // If it's a single line (like the default rider text), display it as a single detail line
            details.push(`Coverage: ${coverageItems[0]}`);
        } else if (typeof coverage === 'string' && coverage.length > 0) {
            // Fallback for an un-splittable but existing string
             details.push(`Coverage: ${coverage}`);
        }
      }
    }
    // 6. Dental/Vision (Annual Max, Copays, Deductible)
    else if (type === "dental" || type === "vision") {
      addDetail("Deductible", deductible);
      addDetail("Annual Max Benefit", annualMax);
      addDetail("Co-pay", coPay);
      addCoverageList("Key Benefits:");
    }
    // 7. Supplemental/Disability/Cancer/Heart/Out of Pocket (Financials + Coverage)
    else if (
  type === "cancer" ||
  type === "heart" ||
  type === "outOfPocket" ||
  type === "disability"
) {
  addDetail("Deductible", deductible);
  // Coinsurance is a percentage, so isMonetary is false
      // Coinsurance is a percentage, so isMonetary is false
      addDetail("Coinsurance", coinsurance, (v) => `${v}%`, false);
      addDetail("Annual Max Benefit", annualMax);
      addCoverageList("Key Benefits:");
    }

    // Always add general details (which includes the life insurance rider text from 'details')
    if (planDetails) details.push(planDetails);
    
    // --- EFFECTIVE DATE LOGIC ---
    const dateToDisplay = calculateEffectiveDate(plan);
    
    // Display the date if it's a valid Date object
    if (dateToDisplay) {
      details.push(
        `Effective Date: ${dateToDisplay.toLocaleDateString(
          "en-US"
        )}`
      );
    }
    // --- END EFFECTIVE DATE LOGIC ---

    return details;
  };

  // Component to handle logo display with a provider-initial fallback
  const PlanLogo: React.FC<{ plan: InsurancePlan }> = ({ plan }) => {
    const logoUrl = carrierLogos[plan.provider];
    const [imageLoaded, setImageLoaded] = useState(true); // Assume loaded initially

    // If no logo is defined, or if the image failed to load, show the provider initial
    if (!logoUrl || !imageLoaded) {
      // Get the first initial of the provider's name
      const initial = plan.provider.charAt(0).toUpperCase();

      return (
        <div className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full font-bold text-xs text-gray-700 shadow-sm flex-shrink-0">
          {initial}
        </div>
      );
    }

    // Otherwise, show the image using a standard <img> tag
    return (
      <img
        src={logoUrl}
        alt={`${plan.provider} logo`}
        width={24}
        height={24}
        className="object-contain w-6 h-6 border border-gray-100 flex-shrink-0"
        onError={() => setImageLoaded(false)} // This forces the fallback initial to display if loading fails
      />
    );
  };

  // --- NEW: Sort packages by fixed order before rendering ---
  const packageOrder: string[] = [
    "ACA Bronze",
    "ACA Silver",
    "Private Health",
    "Health Share",
    "Catastrophic",
  ];

  const sortedPackages = [...quote.packages].sort((a, b) => {
    const indexA = packageOrder.indexOf(a.name);
    const indexB = packageOrder.indexOf(b.name);

    // If a package name isn't in the list, push it to the end
    const sortA = indexA === -1 ? Infinity : indexA;
    const sortB = indexB === -1 ? Infinity : indexB;

    return sortA - sortB;
  });
  // --- End new sort logic ---

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
              <div className="text-base sm:text-lg text-gray-600 break-all">
                <a href={`tel:${quote.client.phone}`} className="hover:text-blue-600 transition">
                  {quote.client.phone}
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
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
            quote.packages.length >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
          }`}
        >
          {/* USE THE SORTED ARRAY HERE */}
          {sortedPackages.map((pkg, index) => (
            <div
              key={pkg.id}
              // NEW: Added lg:min-h-[600px] and lg:h-full to ensure cards have a consistent fixed-tight height on desktop.
              className="bg-white rounded-xl shadow-2xl hover:shadow-3xl transition-shadow duration-300 flex flex-col overflow-hidden transform lg:h-full lg:min-h-[600px]"
            >
              <div
                className={`bg-gradient-to-r ${getPackageColor(
                  index
                )} text-white p-5 text-center flex-shrink-0`}
              >
                <h2 className="text-xl sm:text-2xl font-black tracking-wide">
                  {pkg.name} Package
                </h2>
                <div className="text-sm opacity-90 mt-1 italic">
                  {pkg.description || ""}
                </div>
              </div>

              {/* NEW: Added lg:max-h-[400px] and lg:overflow-y-auto for desktop scrolling */}
              <div className="p-5 flex-1 space-y-5 overflow-visible lg:max-h-[400px] lg:overflow-y-auto">
                {pkg.plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border-l-4 pl-4 py-1 border-blue-400/70 bg-blue-50/50 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <PlanLogo plan={plan} />
                      <div>
                        <div className="text-base font-bold text-gray-900 leading-tight">
                          {/* UPDATED: Changed to use plan.name for display, with a fallback to plan.title. */}
                          {plan.name || plan.title} 
                        </div>
                        <div className="text-xs text-gray-600 italic">
                          ({plan.provider})
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 space-y-1 ml-1">
                      {formatPlanDetails(plan).map((detail, idx) =>
                        Array.isArray(detail) ? (
                          <div key={idx} className="mt-2">
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
                          <div key={idx} className="text-sm">• {detail}</div>
                        )
                      )}

                      <div className="text-green-600 font-extrabold text-sm pt-2 flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Monthly Premium: ${plan.monthlyPremium.toLocaleString()}
                      </div>

                      {plan.brochureUrl && (
                        <div className="mt-2">
                          <a
                            href={plan.brochureUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 underline text-sm font-medium transition"
                          >
                            View Plan Brochure
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-100 p-5 pt-4 text-center flex-shrink-0">
                <div className="text-lg font-semibold text-gray-700 mb-1">
                  Total Monthly Payment:
                </div>
                <div className="text-4xl font-black text-gray-900 mb-3">
                  ${pkg.totalMonthlyPremium.toLocaleString()}{" "}
                  <span className="text-gray-500 text-sm font-normal">
                    (${(pkg.totalMonthlyPremium / 30).toFixed(2)} / day)
                  </span>
                </div>

                <Button
                  onClick={() => onPackageSelect && onPackageSelect(pkg.id)}
                  className={`px-8 py-3 text-lg font-bold bg-gradient-to-r ${getPackageColor(
                    index
                  )} text-white rounded-full shadow-lg hover:opacity-90 transition-opacity w-full`}
                >
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
