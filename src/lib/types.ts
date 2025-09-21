export interface Agent {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Client {
  name: string;
  zipCode: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  additionalInfo?: string;
}

export interface InsurancePlan {
  id?: string;
  type:
    | "health"
    | "konnect"
    | "dental"
    | "vision"
    | "life"
    | "cancer"
    | "heart"
    | "outOfPocket"
    | "breeze"
    | "disability";
  name: string;
  provider: string;
  monthlyPremium: number;
  deductible?: number;
  outOfPocket?: number; // general out-of-pocket
  outOfPocketMax?: number; // health-specific max
  copay?: number;       // general copay
  coverage?: string;
  details?: string;

  // Health plan–specific copays
  primaryCareCopay?: number;
  specialistCopay?: number;
  genericDrugCopay?: number;

  effectiveDate?: string; // ISO string

  // NEW: optional brochure link
  brochureUrl?: string;
}

export interface Package {
  id: string;
  name: "Bronze" | "Silver" | "Gold" | "Healthy Bundle";
  description: string;
  plans: InsurancePlan[];
  totalMonthlyPremium: number;
}

export interface Quote {
  id: string;
  agentId: string;
  client: Client;
  packages: Package[];
  createdAt: string;
  updatedAt: string;
  status: "draft" | "completed" | "presented";
  shareableLink?: string;
}

export interface PackageTemplate {
  name: "Bronze" | "Silver" | "Gold" | "Healthy Bundle";
  description: string;
  planTypes: InsurancePlan["type"][];
  defaultPlans: Omit<InsurancePlan, "id">[];
}

// Helper functions to generate default effective dates
const getNextDay = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

const getFirstOfNextMonth = (): string => {
  const now = new Date();
  const firstNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return firstNextMonth.toISOString().split("T")[0];
};

// Apply default effective date
const withEffectiveDate = (plan: Omit<InsurancePlan, "id">): Omit<InsurancePlan, "id"> => ({
  ...plan,
  effectiveDate: plan.type === "health" ? getFirstOfNextMonth() : getNextDay(),
});

// Format ISO date to US format MM/DD/YYYY
export const formatEffectiveDateUS = (isoDate?: string) => {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("en-US");
};

// --- PACKAGE TEMPLATES ---
export const PACKAGE_TEMPLATES: PackageTemplate[] = [
  {
    name: "Bronze",
    description: "Essential coverage with ACA health, dental, and out-of-pocket protection",
    planTypes: ["health", "dental", "vision", "outOfPocket"],
    defaultPlans: [
      withEffectiveDate({
        type: "health",
        name: "ACA Bronze Health Plan",
        provider: "ACA",
        monthlyPremium: 0,
        deductible: 0,
        outOfPocketMax: 5000,
        copay: 0,
        coverage: "Essential health benefits",
        details: "Bronze level ACA compliant health insurance",
        primaryCareCopay: 0,
        specialistCopay: 0,
        genericDrugCopay: 0,
      }),
      withEffectiveDate({
        type: "dental",
        name: "Ameritas PrimeStar Care Lite Dental",
        provider: "Ameritas",
        monthlyPremium: 25.95,
        deductible: 50,
        copay: 0,
        coverage: "Preventive and basic dental care",
        details: "Affordable plan for those with a healthy mouth. Preventive care such as exams and cleanings, with increasing coverage after the first year.",
        brochureUrl: "https://apps.topbrokercrm.com/storage/files/rXVEfxXCKgmpqdxZUivjLLWHv9W5WVxEWbrXG0UQ.pdf"
      }),
      withEffectiveDate({
        type: "vision",
        name: "Ameritas PrimeStar Select Vision",
        provider: "Ameritas",
        monthlyPremium: 13.07,
        deductible: 0,
        copay: 0,
        coverage: "Preventive and basic vision care",
        details: "Protecting your eyes starts with routine eye exams!",
        brochureUrl: "https://apps.topbrokercrm.com/storage/files/dW7PpnFCIqGKjSR0wRuv9P9tlUbOzBQ9694KIXwH.pdf"
      }),
      withEffectiveDate({
        type: "outOfPocket",
        name: "Manhattan Life Out-of-Pocket Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$100/day Inpatient Hospital Confinement Benefit",
        details: "Helps cover unexpected medical expenses",
        brochureUrl: "https://apps.topbrokercrm.com/storage/files/aHB0RFsyM9OfQQ6aOgPWSBLP6tFBIs4miR11QMzE.pdf"
      }),
    ],
  },
  {
    name: "Silver",
    description: "Comprehensive coverage including health, dental, vision, and life insurance",
    planTypes: ["health", "dental", "vision", "life", "outOfPocket"],
    defaultPlans: [
      withEffectiveDate({
        type: "health",
        name: "ACA Silver Health Plan",
        provider: "ACA",
        monthlyPremium: 0,
        deductible: 0,
        outOfPocketMax: 4000,
        copay: 0,
        coverage: "Enhanced health benefits",
        details: "Silver level ACA compliant health insurance",
        primaryCareCopay: 0,
        specialistCopay: 0,
        genericDrugCopay: 0,
      }),
      withEffectiveDate({
        type: "dental",
        name: "Ameritas PrimeStar Care Boost Dental",
        provider: "Ameritas",
        monthlyPremium: 46.89,
        deductible: 50,
        copay: 0,
        coverage: "Preventive and family-focused dental care",
        details: "Robust dental coverage with whitening, child orthodontics, implants, and higher benefits after the first year.",
        brochureUrl: "https://apps.topbrokercrm.com/storage/files/rXVEfxXCKgmpqdxZUivjLLWHv9W5WVxEWbrXG0UQ.pdf"
      }),
      withEffectiveDate({
        type: "vision",
        name: "Ameritas PrimeStar Select Vision",
        provider: "Ameritas",
        monthlyPremium: 13.07,
        deductible: 0,
        copay: 0,
        coverage: "Preventive and basic vision care",
        details: "Protecting your eyes starts with routine eye exams!",
        brochureUrl: "https://apps.topbrokercrm.com/storage/files/dW7PpnFCIqGKjSR0wRuv9P9tlUbOzBQ9694KIXwH.pdf"
      }),
      withEffectiveDate({
        type: "outOfPocket",
        name: "Manhattan Life Out-of-Pocket Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$200/day Inpatient Hospital Confinement Benefit",
        details: "Helps cover unexpected medical expenses",
        brochureUrl: "https://apps.topbrokercrm.com/storage/files/aHB0RFsyM9OfQQ6aOgPWSBLP6tFBIs4miR11QMzE.pdf"
      }),
      withEffectiveDate({
        type: "life",
        name: "Transamerica Trendsetter Super Term Life",
        provider: "Transamerica",
        monthlyPremium: 0,
        coverage: "$100,000 term life insurance",
        details: "20-year level term life insurance",
        brochureUrl: "https://www.transamerica.com/brochures/trendsetter-super-term.pdf"
      }),
      withEffectiveDate({
        type: "cancer",
        name: "Manhattan Life Cancer Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$10,000 Benefit",
        details: "Lump-sum cash benefit paid upon diagnosis of cancer, regardless of other coverage.",
        brochureUrl: "https://www.manhattanlife.com/resources/brochures/cancer.pdf"
      }),
      withEffectiveDate({
        type: "heart",
        name: "Manhattan Life Heart Attack & Stroke Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$10,000 Benefit",
        details: "Lump-sum cash benefit upon diagnosis of heart attack or stroke, in addition to any other plan.",
        brochureUrl: "https://www.manhattanlife.com/resources/brochures/heart-stroke.pdf"
      }),
    ],
  },
  {
    name: "Gold",
    description: "Premium coverage with all health plans plus supplemental protection",
    planTypes: ["health","dental","vision","life","cancer","heart","outOfPocket","disability"],
    defaultPlans: [
      withEffectiveDate({
        type: "health",
        name: "ACA Gold Health Plan",
        provider: "ACA",
        monthlyPremium: 550,
        deductible: 2500,
        outOfPocketMax: 3000,
        copay: 20,
        coverage: "Premium health benefits",
        details: "Gold level ACA compliant health insurance",
        primaryCareCopay: 0,
        specialistCopay: 0,
        genericDrugCopay: 0,
      }),
      withEffectiveDate({
        type: "dental",
        name: "Ameritas PrimeStar Care Complete Dental",
        provider: "Ameritas",
        monthlyPremium: 53.85,
        deductible: 50,
        copay: 20,
        coverage: "Premium dental care",
        details: "Extensive dental plan with high annual maximum, implant coverage, and hearing benefits. Expands after first year.",
        brochureUrl: "https://apps.topbrokercrm.com/storage/files/rXVEfxXCKgmpqdxZUivjLLWHv9W5WVxEWbrXG0UQ.pdf"
      }),
      withEffectiveDate({
        type: "vision",
        name: "Ameritas PrimeStar Choice Vision",
        provider: "Ameritas",
        monthlyPremium: 13.07,
        deductible: 0,
        copay: 20,
        coverage: "Enhanced vision benefits",
        details: "Eye exams, frames, lenses, contacts",
        brochureUrl: "https://apps.topbrokercrm.com/storage/files/dW7PpnFCIqGKjSR0wRuv9P9tlUbOzBQ9694KIXwH.pdf"
      }),
      withEffectiveDate({
        type: "outOfPocket",
        name: "Manhattan Life Out-of-Pocket Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$200/day Inpatient Hospital Confinement Benefit",
        details: "Helps cover unexpected medical expenses",
        brochureUrl: "https://apps.topbrokercrm.com/storage/files/aHB0RFsyM9OfQQ6aOgPWSBLP6tFBIs4miR11QMzE.pdf"
      }),
      withEffectiveDate({
        type: "life",
        name: "Transamerica Trendsetter Super Term Life",
        provider: "Transamerica",
        monthlyPremium: 0,
        coverage: "$100,000 term life insurance",
        details: "20-year level term life insurance",
        brochureUrl: "https://www.transamerica.com/brochures/trendsetter-super-term.pdf"
      }),
      withEffectiveDate({
        type: "cancer",
        name: "Manhattan Life Cancer Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$10,000 Benefit",
        details: "Lump-sum cash benefit paid upon diagnosis of cancer.",
        brochureUrl: "https://www.manhattanlife.com/resources/brochures/cancer.pdf"
      }),
      withEffectiveDate({
        type: "heart",
        name: "Manhattan Life Heart Attack & Stroke Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$10,000 Benefit",
        details: "Lump-sum cash benefit paid upon diagnosis of heart attack or stroke.",
        brochureUrl: "https://www.manhattanlife.com/resources/brochures/heart-stroke.pdf"
      }),
      withEffectiveDate({
        type: "disability",
        name: "Breeze Short-Term Disability",
        provider: "Breeze",
        monthlyPremium: 0,
        coverage: "Short-term disability income",
        details: "Income replacement for temporary disabilities",
      }),
    ],
  },
  {
    name: "Healthy Bundle",
    description: "Complete protection package with all available plans including disability",
    planTypes: ["health","konnect","dental","vision","life","cancer","heart","outOfPocket","breeze","disability"],
    defaultPlans: [
      withEffectiveDate({
        type: "konnect",
        name: "KonnectMD",
        provider: "KonnectMD",
        monthlyPremium: 0,
        deductible: 0,
        copay: 0,
        coverage: "Unlimited virtual healthcare",
        details: "24/7 access to doctors, therapists, and specialists with no copays, deductibles, or surprise bills.",
      }),
      withEffectiveDate({
        type: "dental",
        name: "Ameritas PrimeStar Dental Complete",
        provider: "Ameritas",
        monthlyPremium: 53.85,
        deductible: 50,
        copay: 20,
        coverage: "Premium dental care",
        details: "Extensive dental plan with high annual maximum and implant coverage. Expands after first year.",
        brochureUrl: "https://apps.topbrokercrm.com/storage/files/rXVEfxXCKgmpqdxZUivjLLWHv9W5WVxEWbrXG0UQ.pdf"
      }),
      withEffectiveDate({
        type: "vision",
        name: "Ameritas PrimeStar Choice Vision",
        provider: "Ameritas",
        monthlyPremium: 13.07,
        deductible: 0,
        copay: 20,
        coverage: "Enhanced vision benefits",
        details: "Eye exams, frames, lenses, contacts",
        brochureUrl: "https://apps.topbrokercrm.com/storage/files/dW7PpnFCIqGKjSR0wRuv9P9tlUbOzBQ9694KIXwH.pdf"
      }),
      withEffectiveDate({
        type: "life",
        name: "Transamerica Trendsetter Super Prefered",
        provider: "Transamerica",
        monthlyPremium: 0,
        coverage: "$500,000 term life insurance",
        details: "25-year level term life insurance",
        brochureUrl: "https://www.transamerica.com/brochures/trendsetter-super-preferred.pdf"
      }),
      withEffectiveDate({
        type: "outOfPocket",
        name: "Manhattan Life Out-of-Pocket Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$200/day Inpatient Hospital Confinement Benefit",
        details: "Highest coverage for all medical expenses",
        brochureUrl: "https://www.manhattanlife.com/resources/brochures/out-of-pocket.pdf"
      }),
    ],
  },
];
