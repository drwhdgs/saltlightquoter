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
  type: 'health' | 'konnect' | 'dental' | 'vision' | 'life' | 'cancer' | 'heart' | 'outOfPocket' | 'breeze' | 'disability';
  name: string;
  provider: string;
  monthlyPremium: number;
  deductible?: number;
  copay?: number;
  coverage?: string;
  details?: string;
  // New fields for health plans
  primaryCareCopay?: number;
  specialistCopay?: number;
  genericDrugCopay?: number;
}

export interface Package {
  id: string;
  name: 'Bronze' | 'Silver' | 'Gold' | 'Healthy Bundle';
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
  status: 'draft' | 'completed' | 'presented';
  shareableLink?: string;
}

export interface PackageTemplate {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Healthy Bundle';
  description: string;
  planTypes: InsurancePlan['type'][];
  defaultPlans: Omit<InsurancePlan, 'id'>[];
}

export const PACKAGE_TEMPLATES: PackageTemplate[] = [
  {
    name: 'Bronze',
    description: 'Essential coverage with ACA health, dental, and out-of-pocket protection',
    planTypes: ['health', 'dental', 'outOfPocket'],
    defaultPlans: [
      {
        type: 'health',
        name: 'ACA Bronze Health Plan',
        provider: 'ACA Marketplace',
        monthlyPremium: 0,
        deductible: 0,
        copay: 0,
        coverage: 'Essential health benefits',
        details: 'Bronze level ACA compliant health insurance',
        primaryCareCopay: 0,
        specialistCopay: 0,
        genericDrugCopay: 0
      },
      {
        type: 'dental',
        name: 'Ameritas PrimeStar Care Lite Dental',
        provider: 'Ameritas',
        monthlyPremium: 25.95,
        deductible: 50,
        coverage: 'Preventive and basic dental care',
        details: 'The PrimeStar Care Lite plan is an affordable option for those with a healthy mouth. It offers basic coverage with an emphasis on preventive care such as exams and cleanings. The annual maximum benefit and coverage for Basic and Major procedures increase after the first year on the plan.'
      },
      {
        type: 'vision',
        name: 'Ameritas PrimeStar Select Vision',
        provider: 'Ameritas',
        monthlyPremium: 13.07,
        deductible: 0,
        coverage: 'Preventive and basic vision care',
        details: 'Protecting your eyes starts with having routine eye exams!'
      },
      {
        type: 'outOfPocket',
        name: 'Manhattan Life Out-of-Pocket Protection',
        provider: 'Manhattan Life',
        monthlyPremium: 0,
        coverage: '$100/day Inpatient Hospital Confinement Benefit',
        details: 'Helps cover unexpected medical expenses'
      }
    ]
  },
  {
    name: 'Silver',
    description: 'Comprehensive coverage including health, dental, vision, and life insurance',
    planTypes: ['health', 'dental', 'vision', 'life'],
    defaultPlans: [
      {
        type: 'health',
        name: 'ACA Silver Health Plan',
        provider: 'ACA Marketplace',
        monthlyPremium: 0,
        deductible: 0,
        copay: 0,
        coverage: 'Enhanced health benefits',
        details: 'Silver level ACA compliant health insurance',
        primaryCareCopay: 0,
        specialistCopay: 0,
        genericDrugCopay: 0
      },
      {
        type: 'dental',
        name: 'Ameritas PrimeStar Care Boost Dental',
        provider: 'Ameritas',
        monthlyPremium: 46.89,
        deductible: 50,
        coverage: 'Preventive and basic dental care',
        details: 'The PrimeStar Care Boost plan is great for families who want robust coverage. Unique benefits include teeth whitening and coverage for child orthodontic care. You’ll enjoy additional services under Preventive care and coverage for implants. The dental maximum benefit and coverage for Basic and Major procedures increase after the first year on the plan.'
      },
      {
        type: 'vision',
        name: 'Ameritas PrimeStar Select Vision',
        provider: 'Ameritas',
        monthlyPremium: 13.07,
        deductible: 0,
        coverage: 'Preventive and basic vision care',
        details: 'Protecting your eyes starts with having routine eye exams!'
      },
      {
        type: 'outOfPocket',
        name: 'Manhattan Life Out-of-Pocket Protection',
        provider: 'Manhattan Life',
        monthlyPremium: 0,
        coverage: '$200/day Inpatient Hospital Confinement Benefit',
        details: 'Helps cover unexpected medical expenses'
      },
      {
        type: 'life',
        name: 'Transamerica Trendsetter Super Term Life',
        provider: 'Transamerica',
        monthlyPremium: 0,
        coverage: '$100,000 term life insurance',
        details: '20-year level term life insurance'
      },
      {
        type: 'cancer',
        name: 'Manhattan Life Cancer Protection',
        provider: 'Manhattan Life',
        monthlyPremium: 0,
        coverage: '$10,000 Benefit',
        details: 'Receive a lump-sum cash benefit paid upon diagnosis of Cancer over and above any benefits you receive from any other plan!'
      },
      {
        type: 'heart',
        name: 'Manhattan Life Heart Attack & Stroke Protection',
        provider: 'Manhattan Life',
        monthlyPremium: 0,
        coverage: '$10,000 Benefit',
        details: 'Receive a lump-sum cash benefit paid upon diagnosis of heart and stroke over and above any benefits you receive from any other plan!'
      },
    ]
  },
  {
    name: 'Gold',
    description: 'Premium coverage with all health plans plus supplemental protection',
    planTypes: ['health', 'dental', 'vision', 'life', 'cancer', 'heart', 'outOfPocket'],
    defaultPlans: [
      {
        type: 'health',
        name: 'ACA Gold Health Plan',
        provider: 'ACA Marketplace',
        monthlyPremium: 550,
        deductible: 2500,
        copay: 20,
        coverage: 'Premium health benefits',
        details: 'Gold level ACA compliant health insurance',
        primaryCareCopay: 0,
        specialistCopay: 0,
        genericDrugCopay: 0
      },
      {
        type: 'dental',
        name: 'Ameritas PrimeStar Care Complete Dental',
        provider: 'Ameritas',
        monthlyPremium: 53.85,
        deductible: 50,
        coverage: 'Premium dental care',
        details: 'The PrimeStar Care Complete plan offers extensive dental care with a high annual maximum benefit. This comprehensive plan offers implant coverage as a Major procedure. Hearing benefits for exams and hearing aids are available to plan members of all ages. The annual maximum benefit and coverage for Basic and Major procedures increase after the first year on the plan.'
      },
      {
        type: 'vision',
        name: 'Ameritas PrimeStar Choice Vision',
        provider: 'Ameritas',
        monthlyPremium: 13.07,
        deductible: 0,
        coverage: 'Enhanced vision benefits',
        details: 'Eye exams, frames, lenses, contacts'
      },
      {
        type: 'outOfPocket',
        name: 'Manhattan Life Out-of-Pocket Protection',
        provider: 'Manhattan Life',
        monthlyPremium: 0,
        coverage: '$200/day Inpatient Hospital Confinement Benefit',
        details: 'Helps cover unexpected medical expenses'
      },
      {
        type: 'life',
        name: 'Transamerica Trendsetter Super Term Life',
        provider: 'Transamerica',
        monthlyPremium: 0,
        coverage: '$100,000 term life insurance',
        details: '20-year level term life insurance'
      },
      {
        type: 'cancer',
        name: 'Manhattan Life Cancer Protection',
        provider: 'Manhattan Life',
        monthlyPremium: 0,
        coverage: '$10,000 Benefit',
        details: 'Receive a lump-sum cash benefit paid upon diagnosis of Cancer over and above any benefits you receive from any other plan!'
      },
      {
        type: 'heart',
        name: 'Manhattan Life Heart Attack & Stroke Protection',
        provider: 'Manhattan Life',
        monthlyPremium: 0,
        coverage: '$10,000 Benefit',
        details: 'Receive a lump-sum cash benefit paid upon diagnosis of heart and stroke over and above any benefits you receive from any other plan!'
      },
      {
        type: 'disability',
        name: 'Breeze Short-Term Disability',
        provider: 'Breeze',
        monthlyPremium: 0,
        coverage: 'Short-term disability income',
        details: 'Income replacement for temporary disabilities'
      }
    ]
  },
  {
    name: 'Healthy Bundle',
    description: 'Complete protection package with all available plans including disability',
    planTypes: ['health', 'dental', 'vision', 'life', 'cancer', 'heart', 'outOfPocket', 'breeze', 'disability'],
    defaultPlans: [
      {
        type: 'konnect',
        name: 'KonnectMD',
        provider: 'KonnectMD',
        monthlyPremium: 0,
        deductible: 0,
        copay: 0,
        coverage: 'Unlimited virtual healthcare',
        details: '24/7 access to doctors, therapists, and specialists with no copays, deductibles, or surprise bills.'
      },
      {
        type: 'dental',
        name: 'Ameritas PrimeStar Dental Complete',
        provider: 'Ameritas',
        monthlyPremium: 53.85,
        deductible: 50,
        coverage: 'Premium dental care',
        details: 'The PrimeStar Care Complete plan offers extensive dental care with a high annual maximum benefit. This comprehensive plan offers implant coverage as a Major procedure. Hearing benefits for exams and hearing aids are available to plan members of all ages. The annual maximum benefit and coverage for Basic and Major procedures increase after the first year on the plan.'
      },
      {
        type: 'vision',
        name: 'Ameritas PrimeStar Choice Vision',
        provider: 'Ameritas',
        monthlyPremium: 13.07,
        deductible: 0,
        coverage: 'Enhanced vision benefits',
        details: 'Eye exams, frames, lenses, contacts'
      },
      {
        type: 'life',
        name: 'Transamerica Trendsetter Super Prefered',
        provider: 'Transamerica',
        monthlyPremium: 0,
        coverage: '$500,000 term life insurance',
        details: '25-year level term life insurance'
      },
      {
        type: 'outOfPocket',
        name: 'Manhattan Life Out-of-Pocket Protection',
        provider: 'Manhattan Life',
        monthlyPremium: 0,
        coverage: '$200/day Inpatient Hospital Confinement Benefit',
        details: 'Highest coverage for all medical expenses'
      },
    ]
  }
];

