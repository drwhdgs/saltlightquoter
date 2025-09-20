// src/lib/types.ts

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
  outOfPocket?: number;
  coverage?: string;
  details?: string;

  // Change "OutOfPocket" to "Copay" to match component
  primaryCareCopay?: number;
  specialistCopay?: number;
  genericDrugCopay?: number;
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

export const PACKAGE_TEMPLATES: PackageTemplate[] = [
  {
    name: "Bronze",
    description:
      "Essential coverage with ACA health, dental, and out-of-pocket protection",
    planTypes: ["health", "dental", "outOfPocket"],
    defaultPlans: [
      {
        type: "health",
        name: "ACA Bronze Health Plan",
        provider: "ACA Marketplace",
        monthlyPremium: 0,
        deductible: 0,
        outOfPocket: 0,
        coverage: "Essential health benefits",
        details: "Bronze level ACA compliant health insurance",
        primaryCareCopay: 0, // Updated property name
        specialistCopay: 0, // Updated property name
        genericDrugCopay: 0, // Updated property name
      },
      {
        type: "dental",
        name: "Ameritas PrimeStar Care Lite Dental",
        provider: "Ameritas",
        monthlyPremium: 25.95,
        deductible: 50,
        coverage: "Preventive and basic dental care",
        details:
          "Affordable plan for those with a healthy mouth. Preventive care such as exams and cleanings, with increasing coverage after the first year.",
      },
      {
        type: "vision",
        name: "Ameritas PrimeStar Select Vision",
        provider: "Ameritas",
        monthlyPremium: 13.07,
        deductible: 0,
        coverage: "Preventive and basic vision care",
        details: "Protecting your eyes starts with routine eye exams!",
      },
      {
        type: "outOfPocket",
        name: "Manhattan Life Out-of-Pocket Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$100/day Inpatient Hospital Confinement Benefit",
        details: "Helps cover unexpected medical expenses",
      },
    ],
  },
  {
    name: "Silver",
    description:
      "Comprehensive coverage including health, dental, vision, and life insurance",
    planTypes: ["health", "dental", "vision", "life"],
    defaultPlans: [
      {
        type: "health",
        name: "ACA Silver Health Plan",
        provider: "ACA Marketplace",
        monthlyPremium: 0,
        deductible: 0,
        outOfPocket: 0,
        coverage: "Enhanced health benefits",
        details: "Silver level ACA compliant health insurance",
        primaryCareCopay: 0, // Updated property name
        specialistCopay: 0, // Updated property name
        genericDrugCopay: 0, // Updated property name
      },
      {
        type: "dental",
        name: "Ameritas PrimeStar Care Boost Dental",
        provider: "Ameritas",
        monthlyPremium: 46.89,
        deductible: 50,
        coverage: "Preventive and family-focused dental care",
        details:
          "Robust dental coverage with whitening, child orthodontics, implants, and higher benefits after the first year.",
      },
      {
        type: "vision",
        name: "Ameritas PrimeStar Select Vision",
        provider: "Ameritas",
        monthlyPremium: 13.07,
        deductible: 0,
        coverage: "Preventive and basic vision care",
        details: "Protecting your eyes starts with routine eye exams!",
      },
      {
        type: "outOfPocket",
        name: "Manhattan Life Out-of-Pocket Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$200/day Inpatient Hospital Confinement Benefit",
        details: "Helps cover unexpected medical expenses",
      },
      {
        type: "life",
        name: "Transamerica Trendsetter Super Term Life",
        provider: "Transamerica",
        monthlyPremium: 0,
        coverage: "$100,000 term life insurance",
        details: "20-year level term life insurance",
      },
      {
        type: "cancer",
        name: "Manhattan Life Cancer Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$10,000 Benefit",
        details:
          "Lump-sum cash benefit paid upon diagnosis of cancer, regardless of other coverage.",
      },
      {
        type: "heart",
        name: "Manhattan Life Heart Attack & Stroke Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$10,000 Benefit",
        details:
          "Lump-sum cash benefit upon diagnosis of heart attack or stroke, in addition to any other plan.",
      },
    ],
  },
  {
    name: "Gold",
    description:
      "Premium coverage with all health plans plus supplemental protection",
    planTypes: [
      "health",
      "dental",
      "vision",
      "life",
      "cancer",
      "heart",
      "outOfPocket",
    ],
    defaultPlans: [
      {
        type: "health",
        name: "ACA Gold Health Plan",
        provider: "ACA Marketplace",
        monthlyPremium: 550,
        deductible: 2500,
        outOfPocket: 20,
        coverage: "Premium health benefits",
        details: "Gold level ACA compliant health insurance",
        primaryCareCopay: 0, // Updated property name
        specialistCopay: 0, // Updated property name
        genericDrugCopay: 0, // Updated property name
      },
      {
        type: "dental",
        name: "Ameritas PrimeStar Care Complete Dental",
        provider: "Ameritas",
        monthlyPremium: 53.85,
        deductible: 50,
        coverage: "Premium dental care",
        details:
          "Extensive dental plan with high annual maximum, implant coverage, and hearing benefits. Expands after first year.",
      },
      {
        type: "vision",
        name: "Ameritas PrimeStar Choice Vision",
        provider: "Ameritas",
        monthlyPremium: 13.07,
        deductible: 0,
        coverage: "Enhanced vision benefits",
        details: "Eye exams, frames, lenses, contacts",
      },
      {
        type: "outOfPocket",
        name: "Manhattan Life Out-of-Pocket Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$200/day Inpatient Hospital Confinement Benefit",
        details: "Helps cover unexpected medical expenses",
      },
      {
        type: "life",
        name: "Transamerica Trendsetter Super Term Life",
        provider: "Transamerica",
        monthlyPremium: 0,
        coverage: "$100,000 term life insurance",
        details: "20-year level term life insurance",
      },
      {
        type: "cancer",
        name: "Manhattan Life Cancer Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$10,000 Benefit",
        details: "Lump-sum cash benefit paid upon diagnosis of cancer.",
      },
      {
        type: "heart",
        name: "Manhattan Life Heart Attack & Stroke Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$10,000 Benefit",
        details:
          "Lump-sum cash benefit paid upon diagnosis of heart attack or stroke.",
      },
      {
        type: "disability",
        name: "Breeze Short-Term Disability",
        provider: "Breeze",
        monthlyPremium: 0,
        coverage: "Short-term disability income",
        details: "Income replacement for temporary disabilities",
      },
    ],
  },
  {
    name: "Healthy Bundle",
    description:
      "Complete protection package with all available plans including disability",
    planTypes: [
      "health",
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
      {
        type: "konnect",
        name: "KonnectMD",
        provider: "KonnectMD",
        monthlyPremium: 0,
        deductible: 0,
        outOfPocket: 0,
        coverage: "Unlimited virtual healthcare",
        details:
          "24/7 access to doctors, therapists, and specialists with no copays, deductibles, or surprise bills.",
      },
      {
        type: "dental",
        name: "Ameritas PrimeStar Dental Complete",
        provider: "Ameritas",
        monthlyPremium: 53.85,
        deductible: 50,
        coverage: "Premium dental care",
        details:
          "Extensive dental plan with high annual maximum and implant coverage. Expands after first year.",
      },
      {
        type: "vision",
        name: "Ameritas PrimeStar Choice Vision",
        provider: "Ameritas",
        monthlyPremium: 13.07,
        deductible: 0,
        coverage: "Enhanced vision benefits",
        details: "Eye exams, frames, lenses, contacts",
      },
      {
        type: "life",
        name: "Transamerica Trendsetter Super Prefered",
        provider: "Transamerica",
        monthlyPremium: 0,
        coverage: "$500,000 term life insurance",
        details: "25-year level term life insurance",
      },
      {
        type: "outOfPocket",
        name: "Manhattan Life Out-of-Pocket Protection",
        provider: "Manhattan Life",
        monthlyPremium: 0,
        coverage: "$200/day Inpatient Hospital Confinement Benefit",
        details: "Highest coverage for all medical expenses",
      },
    ],
  },
];
