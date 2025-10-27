import { Package, PackageTemplate, PACKAGE_TEMPLATES, InsurancePlan } from './types';
import { generateId } from './storage';

/**
 * Create a package instance from a template.
 * @param template The package template to base it on.
 * @param useFreshIds Whether to generate new IDs (default: true).
 */
export const createPackageFromTemplate = (
  template: PackageTemplate,
  useFreshIds = true
): Package => {
  const plans: InsurancePlan[] = template.defaultPlans.map((plan, idx) => ({
    ...plan,
    id: useFreshIds ? generateId() : `plan-${template.name}-${idx}`,
  }));

  const totalMonthlyPremium = plans.reduce(
    (total, plan) => total + (plan.monthlyPremium || 0),
    0
  );

  return {
    id: useFreshIds ? generateId() : `package-${template.name}`,
    name: template.name,
    description: template.description,
    plans,
    totalMonthlyPremium,
  };
};

/**
 * Update a package’s pricing.
 */
export const updatePackagePricing = (
  pkg: Package,
  planUpdates: (Partial<InsurancePlan> & { id: string })[]
): Package => {
  const updatedPlans = pkg.plans.map((plan) => {
    const update = planUpdates.find((u) => u.id === plan.id);
    return update ? { ...plan, ...update } : plan;
  });

  const totalMonthlyPremium = updatedPlans.reduce(
    (total, plan) => total + (plan.monthlyPremium || 0),
    0
  );

  return {
    ...pkg,
    plans: updatedPlans,
    totalMonthlyPremium,
  };
};

/**
 * Return all package templates.
 */
export const getPackageTemplates = (): PackageTemplate[] => PACKAGE_TEMPLATES;

/**
 * Generate all default packages.
 */
export const generateAllPackages = (): Package[] =>
  PACKAGE_TEMPLATES.map((template) => createPackageFromTemplate(template, true));

/**
 * Calculate savings relative to the highest-priced package.
 */
export const calculatePackageSavings = (
  packages: Package[]
): { packageId: string; savings: number }[] => {
  if (!packages.length) return [];
  const maxPrice = Math.max(...packages.map((p) => p.totalMonthlyPremium));
  return packages.map((pkg) => ({
    packageId: pkg.id,
    savings: maxPrice - pkg.totalMonthlyPremium,
  }));
};

/**
 * Get the recommended package (prefers ACA Silver).
 */
export const getRecommendedPackage = (packages: Package[]): Package | null => {
  if (!packages.length) return null;
  const silverPackage = packages.find((p) => p.name === 'ACA Silver');
  if (silverPackage) return silverPackage;

  const sorted = packages
    .slice()
    .sort((a, b) => a.totalMonthlyPremium - b.totalMonthlyPremium);
  return sorted[Math.floor(sorted.length / 2)];
};