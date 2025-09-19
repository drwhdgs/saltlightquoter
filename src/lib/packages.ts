import { Package, PackageTemplate, PACKAGE_TEMPLATES, InsurancePlan } from './types';
import { generateId } from './storage';

export const createPackageFromTemplate = (template: PackageTemplate): Package => {
  const plans: InsurancePlan[] = template.defaultPlans.map(plan => ({
    ...plan,
    id: generateId(),
  }));

  const totalMonthlyPremium = plans.reduce((total, plan) => total + plan.monthlyPremium, 0);

  return {
    id: generateId(),
    name: template.name,
    description: template.description,
    plans,
    totalMonthlyPremium,
  };
};

export const updatePackagePricing = (pkg: Package, planUpdates: Partial<InsurancePlan>[]): Package => {
  const updatedPlans = pkg.plans.map(plan => {
    const update = planUpdates.find(u => u.id === plan.id);
    return update ? { ...plan, ...update } : plan;
  });

  const totalMonthlyPremium = updatedPlans.reduce((total, plan) => total + plan.monthlyPremium, 0);

  return {
    ...pkg,
    plans: updatedPlans,
    totalMonthlyPremium,
  };
};

export const getPackageTemplates = (): PackageTemplate[] => {
  return PACKAGE_TEMPLATES;
};

export const generateAllPackages = (): Package[] => {
  return PACKAGE_TEMPLATES.map(createPackageFromTemplate);
};

export const calculatePackageSavings = (packages: Package[]): { packageId: string; savings: number }[] => {
  if (packages.length === 0) return [];

  const maxPrice = Math.max(...packages.map(p => p.totalMonthlyPremium));

  return packages.map(pkg => ({
    packageId: pkg.id,
    savings: maxPrice - pkg.totalMonthlyPremium,
  }));
};

export const getRecommendedPackage = (packages: Package[]): Package | null => {
  if (packages.length === 0) return null;

  // Return Silver package as default recommendation, or the middle option
  const silverPackage = packages.find(p => p.name === 'Silver');
  if (silverPackage) return silverPackage;

  // Fallback to middle package by price
  const sortedByPrice = packages.sort((a, b) => a.totalMonthlyPremium - b.totalMonthlyPremium);
  return sortedByPrice[Math.floor(sortedByPrice.length / 2)];
};
