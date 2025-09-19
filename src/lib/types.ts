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
  id: string;
  type: 'health' | 'dental' | 'vision' | 'life' | 'cancer' | 'heart' | 'outOfPocket' | 'breeze' | 'disability';
  name: string;
  provider: string;
  monthlyPremium: number;
  deductible?: number;
  copay?: number;
  coverage?: string;
  details?: string;
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
        details: 'Bronze level ACA compliant health insurance'
      },
      {
        type: 'dental',
        name: 'Ameritas PrimeStar Dental',
        provider: 'Ameritas',
        monthlyPremium: 0,
        deductible: 0,
        coverage: 'Preventive and basic dental care',
        details: 'The PrimeStar Care Lite plan is an affordable option for those with a healthy mouth. It offers basic coverage with an emphasis on preventive care such as exams and cleanings. The annual maximum benefit and coverage for Basic and Major procedures increase after the first year on the plan.'
      },
      {
        type: 'vision',
        name: 'Ameritas PrimeStar Select Vision',
        provider: 'Ameritas',
        monthlyPremium: 0,
        deductible: 0,
        coverage: 'Preventive and basic vision care',
        details: 'Protecting your eyes starts with having routine eye exams!'
      },
      {
        type: 'outOfPocket',
        name: 'Manhattan Life Out-of-Pocket Protection',
        provider: 'Manhattan Life',
        monthlyPremium: 0,
        coverage: 'Out-of-pocket expense protection',
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
        monthlyPremium: 450,
        deductible: 4500,
        copay: 30,
        coverage: 'Enhanced health benefits',
        details: 'Silver level ACA compliant health insurance'
      },
      {
        type: 'dental',
        name: 'Ameritas PrimeStar Dental',
        provider: 'Ameritas',
        monthlyPremium: 0,
        deductible: 0,
        coverage: 'Preventive and basic dental care',
        details: 'The PrimeStar Care Lite plan is an affordable option for those with a healthy mouth. It offers basic coverage with an emphasis on preventive care such as exams and cleanings. The annual maximum benefit and coverage for Basic and Major procedures increase after the first year on the plan.'
      },
      {
        type: 'vision',
        name: 'Ameritas PrimeStar Select Vision',
        provider: 'Ameritas',
        monthlyPremium: 0,
        deductible: 0,
        coverage: 'Preventive and basic vision care',
        details: 'Protecting your eyes starts with having routine eye exams!'
      },
      {
        type: 'outOfPocket',
        name: 'Manhattan Life Out-of-Pocket Protection',
        provider: 'Manhattan Life',
        monthlyPremium: 0,
        coverage: 'Out-of-pocket expense protection $100/day',       
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
        details: 'Gold level ACA compliant health insurance'
      },
{
        type: 'dental',
        name: 'Ameritas PrimeStar Dental Complete',
        provider: 'Ameritas',
        monthlyPremium: 0,
        deductible: 0,
        coverage: 'Premium dental care',
        details: 'The PrimeStar Care Complete plan offers extensive dental care with a high annual maximum benefit. This comprehensive plan offers implant coverage as a Major procedure. Hearing benefits for exams and hearing aids are available to plan members of all ages. The annual maximum benefit and coverage for Basic and Major procedures increase after the first year on the plan.'
      },
      {
        type: 'vision',
        name: 'Ameritas PrimeStar Choice Vision',
        provider: 'Ameritas',
        monthlyPremium: 0,
        deductible: 0,
        coverage: 'Enhanced vision benefits',
        details: 'Eye exams, frames, lenses, contacts'
      },
      {
        type: 'outOfPocket',
        name: 'Manhattan Life Out-of-Pocket Protection',
        provider: 'Manhattan Life',
        monthlyPremium: 0,
        coverage: 'Out-of-pocket expense protection',
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
        type: 'outOfPocket',
        name: 'Manhattan Life Out-of-Pocket Premium',
        provider: 'Manhattan Life',
        monthlyPremium: 0,
        coverage: 'Enhanced out-of-pocket protection at $200/day',
        details: 'Higher coverage benefit for unexpected medical expenses'
      }
    ]
  },
  {
    name: 'Healthy Bundle',
    description: 'Complete protection package with all available plans including disability',
    planTypes: ['health', 'dental', 'vision', 'life', 'cancer', 'heart', 'outOfPocket', 'breeze', 'disability'],
    defaultPlans: [
      {
        type: 'health',
        name: 'KonnectMD',
        provider: 'KonnectMD',
        monthlyPremium: 0,
        deductible: 0,
        copay: 0,
        coverage: 'Platinum health benefits',
        details: 'Highest level ACA compliant health insurance'
      },
      {
        type: 'dental',
        name: 'Ameritas Dental Elite',
        provider: 'Ameritas',
        monthlyPremium: 95,
        deductible: 25,
        coverage: 'Elite dental care',
        details: 'All dental procedures with minimal out-of-pocket'
      },
      {
        type: 'vision',
        name: 'Ameritas Vision Elite',
        provider: 'Ameritas',
        monthlyPremium: 45,
        coverage: 'Elite vision benefits',
        details: 'Premium designer frames, all lens options'
      },
      {
        type: 'life',
        name: 'Transamerica Term Life Elite',
        provider: 'Transamerica',
        monthlyPremium: 175,
        coverage: '$1,000,000 term life insurance',
        details: '30-year level term life insurance'
      },
      {
        type: 'cancer',
        name: 'Manhattan Life Cancer Elite',
        provider: 'Manhattan Life',
        monthlyPremium: 65,
        coverage: 'Comprehensive cancer protection',
        details: 'Multiple payments for cancer treatment'
      },
      {
        type: 'heart',
        name: 'Manhattan Life Heart Elite',
        provider: 'Manhattan Life',
        monthlyPremium: 60,
        coverage: 'Comprehensive heart protection',
        details: 'Multiple payments for heart conditions'
      },
      {
        type: 'outOfPocket',
        name: 'Manhattan Life Out-of-Pocket Elite',
        provider: 'Manhattan Life',
        monthlyPremium: 105,
        coverage: 'Maximum out-of-pocket protection',
        details: 'Highest coverage for all medical expenses'
      },
      {
        type: 'breeze',
        name: 'Manhattan Life Breeze',
        provider: 'Manhattan Life',
        monthlyPremium: 55,
        coverage: 'Supplemental health benefits',
        details: 'Additional health and wellness benefits'
      },
      {
        type: 'disability',
        name: 'Manhattan Life Short-Term Disability',
        provider: 'Manhattan Life',
        monthlyPremium: 85,
        coverage: 'Short-term disability income',
        details: 'Income replacement for temporary disabilities'
      }
    ]
  }
];
