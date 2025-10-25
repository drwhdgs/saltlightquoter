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
    | "catastrophic"
    | "vision"
    | "life"
    | "cancer"
    | "heart"
    | "outOfPocket"
    | "breeze"
    | "disability"
    | "healthShare";
  name: string;
  provider: string;
  monthlyPremium: number;
  deductible?: number;
  outOfPocket?: number; // general out-of-pocket
  outOfPocketMax?: number; // health-specific max
  coverage?: string | string[];
  details?: string;
  primaryCareCopay?: number;
  specialistCopay?: number;
  genericDrugCopay?: number;
  coinsurance?: number;
  effectiveDate?: string; // ISO string
  brochureUrl?: string;
}

export interface Package {
  id: string;
  name: "Bronze" | "Silver" | "Gold" | "Healthy Bundle" | "Health Share";
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
  name: "Bronze" | "Silver" | "Gold" | "Healthy Bundle" | "Health Share";
  description: string;
  planTypes: InsurancePlan["type"][];
  defaultPlans: Omit<InsurancePlan, "id">[];
}

// Helper functions
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

const withEffectiveDate = (
  plan: Omit<InsurancePlan, "id">
): Omit<InsurancePlan, "id"> => ({
  ...plan,
  effectiveDate:
    plan.type === "health" || plan.type === "healthShare"
      ? getFirstOfNextMonth()
      : getNextDay(),
});

export const formatEffectiveDateUS = (isoDate?: string) => {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("en-US");
};

// --- PACKAGE TEMPLATES ---
export const PACKAGE_TEMPLATES: PackageTemplate[] = [
  {
    name: "Silver",
    description:
      "Comprehensive coverage including health, dental, vision, and life insurance",
    planTypes: ["health", "dental", "vision", "life", "outOfPocket"],
    defaultPlans: [
      withEffectiveDate({
        type: "health",
        name: "Molina Silver 12 150 - HMO",
        provider: "ACA",
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
        name: "Ameritas PrimeStar Care Boost Dental",
        provider: "Ameritas",
        monthlyPremium: 25.95,
        deductible: 50,
        details:
          "Robust dental coverage with whitening, child orthodontics, implants, and higher benefits after the first year.",
        brochureUrl:
          "https://apps.topbrokercrm.com/storage/files/rXVEfxXCKgmpqdxZUivjLLWHv9W5WVxEWbrXG0UQ.pdf",
      }),
      withEffectiveDate({
        type: "vision",
        name: "Ameritas PrimeStar Select Vision",
        provider: "Ameritas",
        monthlyPremium: 13.07,
        deductible: 0,
        details:
          "Preventive and basic vision care protecting your eyes starts with routine eye exams!",
        brochureUrl:
          "https://apps.topbrokercrm.com/storage/files/dW7PpnFCIqGKjSR0wRuv9P9tlUbOzBQ9694KIXwH.pdf",
      }),
      withEffectiveDate({
        type: "life",
        name: "Transamerica Trendsetter Super Term Life",
        provider: "Transamerica",
        monthlyPremium: 0,
        coverage: "$25,000 term life insurance",
        details: "20-year level term life insurance",
        brochureUrl:
          "https://apps.topbrokercrm.com/storage/files/qBPOKuq4TgR9pyHs3USH3IG9uDRosSnRPbpCdrpc.pdf",
      }),
    ],
  },
  {
    name: "Private Health",
    description:
      "Complete protection package with all available plans including disability",
    planTypes: [
      "health",
      "konnect",
      "dental",
      "vision",
      "life",
      "cancer",
      "heart",
      "outOfPocket",
      "breeze",
      "disability",
    ],
    defaultPlans: [
      withEffectiveDate({
        type: "catastrophic",
        name: "UHC TriTerm Co-Pay Medical Catastrophic Coverage",
        provider: "United Healthcare",
        monthlyPremium: 0,
        deductible: 15000,
        coinsurance: 70,
        outOfPocketMax: 10000,
        coverage: "$2 Million lifetime benefit per person",
        details: `Covers major illnesses & accidents: hospitalization, ER, surgeries, cancer care. Continuous protection for nearly 3 years with one application.`,
        brochureUrl:
          "https://www.uhone.com/api/supplysystem/?FileName=45747C1-G202509.pdf",
      }),
      withEffectiveDate({
        type: "dental",
        name: "Ameritas PrimeStar Care Boost Dental",
        provider: "Ameritas",
        monthlyPremium: 25.95,
        deductible: 50,
        details:
          "Robust dental coverage with whitening, child orthodontics, implants, and higher benefits after the first year.",
        brochureUrl:
          "https://apps.topbrokercrm.com/storage/files/rXVEfxXCKgmpqdxZUivjLLWHv9W5WVxEWbrXG0UQ.pdf",
      }),
      withEffectiveDate({
        type: "vision",
        name: "Ameritas PrimeStar Select Vision",
        provider: "Ameritas",
        monthlyPremium: 13.07,
        deductible: 0,
        details:
          "Preventive and basic vision care protecting your eyes starts with routine eye exams!",
        brochureUrl:
          "https://apps.topbrokercrm.com/storage/files/dW7PpnFCIqGKjSR0wRuv9P9tlUbOzBQ9694KIXwH.pdf",
      }),
      withEffectiveDate({
        type: "life",
        name: "Transamerica Trendsetter Super Term Life",
        provider: "Transamerica",
        monthlyPremium: 0,
        coverage: "$25,000 term life insurance",
        details: "20-year level term life insurance",
        brochureUrl:
          "https://apps.topbrokercrm.com/storage/files/qBPOKuq4TgR9pyHs3USH3IG9uDRosSnRPbpCdrpc.pdf",
      }),
    ],
  },
  {
    name: "Health Share",
    description:
      "An alternative to traditional insurance combining Sedera Health cost sharing with KonnectMD direct virtual care for a complete healthcare solution.",
    planTypes: ["healthShare", "konnect"],
    defaultPlans: [
      withEffectiveDate({
        type: "healthShare",
        name: "Sedera Access+ Medical Cost Sharing",
        provider: "Sedera Health",
        monthlyPremium: 0,
        deductible: 2500,
        coverage:
          "Community-based cost sharing for medical needs. Members share expenses above an Initial Unshareable Amount (IUA) per medical need.",
        details:
          "Sedera Health provides an innovative alternative to traditional health insurance through community cost sharing. Members contribute monthly and share in each other’s eligible medical costs.",
        brochureUrl:
          "https://assets.ctfassets.net/01zqqfy0bb2m/4zhy5ey63Lpwhw6xCjNefg/4a5d2b1fed45991e7cf632fb7ef51f83/02-03-0003_A_MembershipSummary__080125_.pdf",
      }),
     withEffectiveDate({
        type: "konnect",
        name: "TRU-Virtual First Membership",
        provider: "TRUVirtual",
        monthlyPremium: 0,
        coverage: 
          "Over 800 Medications for $0, Virtual Urgent Primary & Specialty Care, $0 labs, In Person Urgent Care Visits, Discount Dental & Vision, Wellness & Lifestyle Discounts",
        details: "Get your care needs where you want it at your home or work. Avoid long wait times to see your doctor and avoid additional illness in the waiting room.",
        brochureUrl:
        "https://www.1enrollment.com/media/1518/TRU-Virtual/TRU-04-02-0002-TRU_Virtual%20First_Healthshare_Brochure%20_8-29-24.pdf",
      }),
      withEffectiveDate({
        type: "dental",
        name: "Ameritas PrimeStar Care Boost Dental",
        provider: "Ameritas",
        monthlyPremium: 25.95,
        deductible: 50,
        details:
          "Robust dental coverage with whitening, child orthodontics, implants, and higher benefits after the first year.",
        brochureUrl:
          "https://apps.topbrokercrm.com/storage/files/rXVEfxXCKgmpqdxZUivjLLWHv9W5WVxEWbrXG0UQ.pdf",
      }),
      withEffectiveDate({
        type: "vision",
        name: "Ameritas PrimeStar Select Vision",
        provider: "Ameritas",
        monthlyPremium: 13.07,
        deductible: 0,
        details:
          "Preventive and basic vision care protecting your eyes starts with routine eye exams!",
        brochureUrl:
          "https://apps.topbrokercrm.com/storage/files/dW7PpnFCIqGKjSR0wRuv9P9tlUbOzBQ9694KIXwH.pdf",
      }),
      withEffectiveDate({
        type: "life",
        name: "Transamerica Trendsetter Super Term Life",
        provider: "Transamerica",
        monthlyPremium: 0,
        coverage: "$25,000 term life insurance",
        details: "20-year level term life insurance",
        brochureUrl:
          "https://apps.topbrokercrm.com/storage/files/qBPOKuq4TgR9pyHs3USH3IG9uDRosSnRPbpCdrpc.pdf",
      }),
  ],
},
];
