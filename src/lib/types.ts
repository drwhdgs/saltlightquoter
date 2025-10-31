export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;        // optional phone number
  createdAt?: string;    // optional date if not always provided
}

export interface Client {
  name: string;
  zipCode: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  additionalInfo?: string;
}

export type InsuranceType =
  | "health"
  | "konnect"
  | "dental"
  | "catastrophic"
  | "vision"
  | "life"
  | "cancer"
  | "heart"
  | "outOfPocket"
  | "disability"
  | "healthShare";

export interface InsurancePlan {
  id?: string;
  type: InsuranceType;
  name: string;
  title: string;
  provider: string;
  monthlyPremium: number;
  deductible?: number;
  outOfPocket?: number;
  outOfPocketMax?: number;
  primaryCareCopay?: number;
  specialistCopay?: number;
  genericDrugCopay?: number;
  coinsurance?: number;
  annualMax?: number | string;
  coPay?: number | string;
  deathBenefit?: string;
  coverageAmount?: number;
  term?: string;
  premium?: number;
  coverage?: string | string[];
  details?: string;
  effectiveDate?: string;
  brochureUrl?: string;
}

export type PackageName =
  | "ACA Bronze"
  | "ACA Silver"
  | "Gold"
  | "Healthy Bundle"
  | "Health Share"
  | "Private Health"
  | "Catastrophic";

export interface Package {
  id: string;
  name: PackageName | string;
  description: string;
  plans: InsurancePlan[];
  totalMonthlyPremium: number;
}

// ✅ Define a strong type for calendar events
export interface CalendarEvent {
  id: string; // Unique identifier
  title: string; // Event name/title
  date: string; // ISO date string (e.g. "2025-10-30")
  type: "follow-up" | "renewal" | "birthday" | "marketing"; // Event category
}

export interface Quote {
  id: string;
  agentId: string;
  client: Client;
  packages: Package[];
  createdAt: string;
  updatedAt: string;
  // ✅ CRITICAL FIX: Removed 'completed' status to resolve the persistent type conflict.
  // The union type is now harmonized across the codebase.
  status: "draft" | "accepted" | "completed" | "presented";  
  shareableLink?: string;
  acceptedPackageId?: string; 
}

export interface PackageTemplate {
  name: PackageName;
  description: string;
  planTypes: InsuranceType[];
  defaultPlans: Omit<InsurancePlan, "id">[];
}

// -----------------------------------------------------------------------
// ✅ FIX: Define HEALTH_PLAN_TYPES to include ONLY "health" based on new requirement.
// -----------------------------------------------------------------------
export const HEALTH_PLAN_TYPES: InsuranceType[] = [
  "health",
];
// -----------------------------------------------------------------------
// END OF FIX
// -----------------------------------------------------------------------

// Helper functions for effective dates
export const getNextDay = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

export const getFirstOfNextMonth = (): string => {
  const now = new Date();
  const firstNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return firstNextMonth.toISOString().split("T")[0];
};

export const withEffectiveDate = (
  plan: Omit<InsurancePlan, "id">
): Omit<InsurancePlan, "id"> => ({
  ...plan,
  // ✅ FIX: Check if the plan type is in the simplified HEALTH_PLAN_TYPES array.
  effectiveDate: HEALTH_PLAN_TYPES.includes(plan.type)
    ? getFirstOfNextMonth()
    : getNextDay(),
});

export const formatEffectiveDateUS = (isoDate?: string) => {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("en-US");
};

// ✅ --- PACKAGE TEMPLATES ---
export const PACKAGE_TEMPLATES: PackageTemplate[] = [
  {
    name: "ACA Bronze",
    description:
      "",
    planTypes: ["health", "dental", "vision", "life", "outOfPocket"],
    defaultPlans: [
      withEffectiveDate({
        type: "health",
        name: "ACA Health Insurance",
        title: "Ambetter - HMO",
        provider: "Ambetter - HMO",
        monthlyPremium: 0,
        deductible: 0,
        outOfPocketMax: 4000,
        coinsurance: 30,
        details:
          "Provides enhanced coverage with moderate premiums and cost-sharing, balancing benefits and affordability for typical medical care.",
        primaryCareCopay: 0,
        specialistCopay: 0,
        genericDrugCopay: 0,
      }),
      withEffectiveDate({
        type: "dental",
        name: "Dental & Vision",
        title: "Ameritas Primestar",
        provider: "Ameritas",
        monthlyPremium: 39.02,
        deductible: 50,
        details: "Preventive and basic dental and vision care",
        brochureUrl:
          "https://apps.topbrokercrm.com/storage/files/rXVEfxXCKgmpqdxZUivjLLWHv9W5WVxEWbrXG0UQ.pdf",
      }),
      withEffectiveDate({
        type: "life",
        name: "Life Insurance",
        title: "Term Made Simple",
        provider: "American Amicable",
        monthlyPremium: 0,
        coverage: "$25,000 term life insurance",
        details:
          "20-year level term life insurance. Includes Terminal Illness Accelerated Death Benefit Rider, Accelerated Death Benefits Rider and Chronic Illness Accelerated Benefit Rider.",
        brochureUrl:
          "https://www.americanamicable.com/CGI/SupplyReq/SupplyReqv2.exe?f=common/3236.pdf",
      }),
    ],
  },
  {
    name: "ACA Silver",
    description:
      "",
    planTypes: ["health", "dental", "vision", "life", "outOfPocket"],
    defaultPlans: [
      withEffectiveDate({
        type: "health",
        name: "ACA Health Insurance",
        title: "Ambetter - HMO",
        provider: "Ambetter - HMO",
        monthlyPremium: 0,
        deductible: 0,
        outOfPocketMax: 4000,
        coinsurance: 30,
        details:
          "Provides enhanced coverage with moderate premiums and cost-sharing, balancing benefits and affordability for typical medical care.",
        primaryCareCopay: 0,
        specialistCopay: 0,
        genericDrugCopay: 0,
      }),
      withEffectiveDate({
        type: "dental",
        name: "Dental & Vision",
        title: "Ameritas Primestar",
        provider: "Ameritas",
        monthlyPremium: 39.02,
        deductible: 50,
        details: "Preventive and basic dental and vision care",
        brochureUrl:
          "https://apps.topbrokercrm.com/storage/files/rXVEfxXCKgmpqdxZUivjLLWHv9W5WVxEWbrXG0UQ.pdf",
      }),
      withEffectiveDate({
        type: "life",
        name: "Life Insurance",
        title: "Term Made Simple",
        provider: "American Amicable",
        monthlyPremium: 0,
        coverage: "$25,000 term life insurance",
        details:
          "20-year level term life insurance. Includes Terminal Illness Accelerated Death Benefit Rider, Accelerated Death Benefits Rider and Chronic Illness Accelerated Benefit Rider.",
        brochureUrl:
          "https://www.americanamicable.com/CGI/SupplyReq/SupplyReqv2.exe?f=common/3236.pdf",
      }),
    ],
  },
  {
    name: "Private Health",
    description:
      "",
    planTypes: [
      "health",
      "konnect",
      "dental",
      "vision",
      "life",
      "cancer",
      "heart",
      "outOfPocket",
      "disability",
      "catastrophic",
    ],
    defaultPlans: [
      withEffectiveDate({
        type: "catastrophic",
        name: "Short Term Medical Health Insurance",
        title: "UHC TriTerm Co-Pay",
        provider: "United Healthcare",
        monthlyPremium: 0,
        deductible: 5000,
        coinsurance: 30,
        outOfPocketMax: 4500,
        coverage:
          "Continuous protection for 3 years, $2 Million lifetime benefit per person, Doctors visits: $50 copay for first 4 visits, Urgent care: $75 copay, Preventative care: $50 copay, Emergency room: 30% after deductible, Inpatient hospital services & outpatient surgery: 30% after deductible, Labs and X-rays: 30% after deductible",
        details:
          "Covers major illnesses & accidents: hospitalization, ER, surgeries, cancer care.",
        brochureUrl:
          "https://www.uhone.com/api/supplysystem/?FileName=52405E-G202510.pdf",
      }),
      withEffectiveDate({
        type: "dental",
        name: "Dental & Vision",
        title: "Ameritas Primestar",
        provider: "Ameritas",
        monthlyPremium: 39.02,
        deductible: 50,
        details: "Preventive and basic dental and vision care",
        brochureUrl:
          "https://apps.topbrokercrm.com/storage/files/rXVEfxXCKgmpqdxZUivjLLWHv9W5WVxEWbrXG0UQ.pdf",
      }),
      withEffectiveDate({
        type: "life",
        name: "Life Insurance",
        title: "Term Made Simple",
        provider: "American Amicable",
        monthlyPremium: 0,
        coverage: "$25,000 term life insurance",
        details:
          "20-year level term life insurance. Includes Terminal Illness Accelerated Death Benefit Rider, Accelerated Death Benefits Rider and Chronic Illness Accelerated Benefit Rider.",
        brochureUrl:
          "https://www.americanamicable.com/CGI/SupplyReq/SupplyReqv2.exe?f=common/3236.pdf",
      }),
    ],
  },
  {
    name: "Health Share",
    description:
      "",
    planTypes: ["healthShare", "konnect"],
    defaultPlans: [
      withEffectiveDate({
        type: "healthShare",
        name: "Medical Cost Sharing",
        title: "Sedera Access+",
        provider: "Sedera Health",
        monthlyPremium: 0,
        deductible: 2500,
        coverage:
          "",
        details:
          "Sedera Health provides an innovative alternative to traditional health insurance through community cost sharing. Members contribute monthly and share in each other’s eligible medical costs.",
        brochureUrl:
          "https://assets.ctfassets.net/01zqqfy0bb2m/4zhy5ey63Lpwhw6xCjNefg/4a5d2b1fed45991e7cf632fb7ef51f83/02-03-0003_A_MembershipSummary__080125_.pdf",
      }),
      withEffectiveDate({
        type: "konnect",
        name: "Virtual Care",
        title: "TRU-Virtual First Membership",
        provider: "TRUVirtual",
        monthlyPremium: 0,
        coverage:
          "Over 800 Medications for $0, Virtual Urgent Primary & Specialty Care, $0 labs, In Person Urgent Care Visits, Discount Dental & Vision, Wellness & Lifestyle Discounts",
        details:
          "Get your care needs where you want it at your home or work. Avoid long wait times to see your doctor and avoid additional illness in the waiting room.",
        brochureUrl:
          "https://www.1enrollment.com/media/1518/TRU-Virtual/TRU-04-02-0002-TRU_Virtual%20First_Healthshare_Brochure%20_8-29-24.pdf",
      }),
      withEffectiveDate({
        type: "dental",
        name: "Dental & Vision",
        title: "Ameritas Primestar",
        provider: "Ameritas",
        monthlyPremium: 39.02,
        deductible: 50,
        details: "Preventive and basic dental and vision care",
        brochureUrl:
          "https://apps.topbrokercrm.com/storage/files/rXVEfxXCKgmpqdxZUivjLLWHv9W5WVxEWbrXG0UQ.pdf",
      }),
      withEffectiveDate({
        type: "life",
        name: "Life Insurance",
        title: "Term Made Simple",
        provider: "American Amicable",
        monthlyPremium: 0,
        coverage: "$25,000 term life insurance",
        details:
          "20-year level term life insurance. Includes Terminal Illness Accelerated Death Benefit Rider, Accelerated Death Benefits Rider and Chronic Illness Accelerated Benefit Rider.",
        brochureUrl:
          "https://www.americanamicable.com/CGI/SupplyReq/SupplyReqv2.exe?f=common/3236.pdf",
      }),
    ],
  },
  {
    name: "Catastrophic",
    description:
      "",
    planTypes: ["catastrophic"],
    defaultPlans: [
      withEffectiveDate({
        type: "catastrophic",
        name: "Short Term Medical Health Insurance",
        title: "UHC TriTerm Value",
        provider: "United Healthcare",
        monthlyPremium: 0,
        deductible: 15000,
        coinsurance: 30,
        outOfPocketMax: 10000,
        coverage: "$2 Million lifetime benefit per person",
        details:
          "Covers major illnesses & accidents: hospitalization, ER, surgeries, cancer care. Continuous protection for 3 years.",
        brochureUrl:
          "https://www.uhone.com/api/supplysystem/?FileName=45747C1-G202509.pdf",
      }),
    ],
  },
];
