'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus } from 'lucide-react';
import {
  Package,
  InsurancePlan,
  Client,
  InsuranceType,
  PACKAGE_TEMPLATES,
} from '@/lib/types';
import {
  generateAllPackages,
  updatePackagePricing,
} from '@/lib/packages';
import { generateId } from '@/lib/storage';

// -------------------------------
// --- Helper & Static Data ---
// -------------------------------

const CARRIERS: Record<InsuranceType, string[]> = {
  health: ['Molina', 'Blue Cross Blue Shield', 'Cigna'],
  healthShare: ['Sedera Health'],
  konnect: ['TRUVirtual', 'KonnectMD'],
  dental: ['Ameritas'],
  life: ['American Amicable', 'Transamerica'],
  catastrophic: ['United Healthcare'],
  cancer: ['Some Carrier'],
  heart: ['Some Carrier'],
  outOfPocket: ['Generic'],
  disability: ['Some Carrier'],
  vision: [],
  breeze: [],
};

const carrierLogos: Record<string, string> = {
  Ameritas: '/logos/ameritas.png',
  'American Amicable': '/logos/AmericanAmicable.jpeg',
  Transamerica: '/logos/transamerica.png',
  KonnectMD: '/logos/konnect.png',
  TRUVirtual: '/logos/virtual.png',
  ACA: '/logos/aca.png',
  'United Healthcare': '/logos/uhc.png',
  'Sedera Health': '/logos/sedera.jpg',
  'Blue Cross Blue Shield':
    'https://placehold.co/75x20/F0F4F8/005A9C?text=BCBS',
  Cigna: 'https://placehold.co/75x20/F0F4F8/D93737?text=CIGNA',
  Molina: 'https://placehold.co/75x20/F0F4F8/1070A0?text=MOLINA',
  'Some Carrier': 'https://placehold.co/75x20/F0F4F8/6B7280?text=CARRIER',
  Generic: 'https://placehold.co/75x20/F0F4F8/6B7280?text=GENERIC',
};

const getCarrierLogo = (carrierName: string) =>
  carrierLogos[carrierName] ||
  'https://placehold.co/75x20/F0F4F8/6B7280?text=LOGO';

const getPlanTypeLabel = (type: InsuranceType) => {
  const labels: Record<InsuranceType, string> = {
    health: 'ACA',
    healthShare: 'Health Sharing',
    konnect: 'Telemedicine',
    dental: 'Dental & Vision',
    life: 'Life Insurance',
    catastrophic: 'Catastrophic',
    cancer: 'Cancer',
    heart: 'Heart',
    outOfPocket: 'Out-of-Pocket',
    disability: 'Disability',
    vision: '',
    breeze: '',
  };
  return labels[type] ?? type;
};

const isTemplatePackage = (pkg: Package) =>
  PACKAGE_TEMPLATES.some((t) => t.name === pkg.name);

// -------------------------------
// --- Types ---
// -------------------------------

interface PackageSelectionProps {
  client: Client;
  initialPackages?: Package[];
  onSubmit: (packages: Package[]) => void;
  onBack: () => void;
}

type EditableInsurancePlan = Partial<InsurancePlan> & {
  id: string;
  title: string;
  provider: string;
  type: InsuranceType;
  monthlyPremium?: number;
};

// -------------------------------
// --- Component ---
// -------------------------------

export function PackageSelection({
  client,
  initialPackages,
  onSubmit,
  onBack,
}: PackageSelectionProps) {
  const [availablePackages, setAvailablePackages] = useState<Package[]>(() => {
    const templates = generateAllPackages();

    if (!initialPackages?.length) return templates;

    const packageMap = new Map<string, Package>(
      templates.map((pkg) => [pkg.name, pkg])
    );

    initialPackages.forEach((pkg) => {
      const isTemplate = isTemplatePackage(pkg);
      if (isTemplate) {
        packageMap.set(pkg.name, pkg);
      } else {
        packageMap.set(pkg.id, pkg);
      }
    });

    return Array.from(packageMap.values());
  });

  const [selectedPackageIds, setSelectedPackageIds] = useState<Set<string>>(
    new Set(initialPackages?.map((pkg) => pkg.id) || [])
  );

  const [packageBeingCustomEdited, setPackageBeingCustomEdited] =
    useState<Package | null>(null);

  const [newPlanForCustomEditor, setNewPlanForCustomEditor] =
    useState<EditableInsurancePlan>({
      id: generateId(),
      type: 'health',
      title: '',
      provider: '',
      monthlyPremium: 0,
    });

  const [planEditorError, setPlanEditorError] = useState<string | null>(null);

  const getPackageToDisplay = (id: string) =>
    availablePackages.find((pkg) => pkg.id === id);

  const handlePackageToggle = (packageId: string) => {
    setSelectedPackageIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(packageId)) newSet.delete(packageId);
      else newSet.add(packageId);
      return newSet;
    });
  };

  const handleStartNewCustomPackage = () => {
    setPackageBeingCustomEdited({
      id: generateId(),
      name: '',
      description: '',
      plans: [],
      totalMonthlyPremium: 0,
    });
    setNewPlanForCustomEditor({
      id: generateId(),
      type: 'health',
      title: '',
      provider: '',
      monthlyPremium: 0,
    });
    setPlanEditorError(null);
  };

  const handleStartCustomEdit = (pkg: Package) => {
    setPackageBeingCustomEdited({
      ...pkg,
      plans: pkg.plans.map((p) => ({ ...p })),
    });
    setNewPlanForCustomEditor({
      id: generateId(),
      type: 'health',
      title: '',
      provider: '',
      monthlyPremium: 0,
    });
    setPlanEditorError(null);
  };

  const handlePlanTypeChangeInCustomEditor = (type: InsuranceType) => {
    setNewPlanForCustomEditor({
      id: generateId(),
      type,
      title: '',
      provider: '',
      monthlyPremium: 0,
    });
    setPlanEditorError(null);
  };

  const handlePlanUpdate = (
    planId: string,
    field: keyof InsurancePlan,
    value: string | number | boolean
  ) => {
    setPackageBeingCustomEdited((prev) =>
      prev
        ? {
            ...prev,
            plans: prev.plans.map((p) =>
              p.id === planId ? { ...p, [field]: value } : p
            ),
          }
        : null
    );
  };

  const handleAddPlanToCustomPackage = () => {
    if (!packageBeingCustomEdited) return;

    const plan = newPlanForCustomEditor;

    if (!plan.title || !plan.provider || (plan.monthlyPremium ?? 0) <= 0) {
      setPlanEditorError(
        'Please fill in Plan Title, select a Carrier, and enter a Monthly Premium greater than $0.'
      );
      return;
    }

    const planToAdd: InsurancePlan = {
      ...plan,
      id: generateId(),
      name: plan.title,
      details: plan.details || '',
      coverage: plan.coverage || '',
      monthlyPremium: plan.monthlyPremium || 0,
    } as InsurancePlan;

    const updatedPlans = [...packageBeingCustomEdited.plans, planToAdd];
    const newTotal = updatedPlans.reduce(
      (sum, p) => sum + (p.monthlyPremium || 0),
      0
    );

    setPackageBeingCustomEdited({
      ...packageBeingCustomEdited,
      plans: updatedPlans,
      totalMonthlyPremium: newTotal,
    });

    setNewPlanForCustomEditor({
      id: generateId(),
      type: 'health',
      title: '',
      provider: '',
      monthlyPremium: 0,
    });
  };

  const handleSaveModification = () => {
    if (!packageBeingCustomEdited) return;
    const original = availablePackages.find(
      (p) => p.id === packageBeingCustomEdited.id
    );
    if (!original) return;

    const planUpdates = packageBeingCustomEdited.plans.map((p) => ({
      id: p.id!,
      monthlyPremium: p.monthlyPremium,
      name: p.name,
      provider: p.provider,
    }));

    const updatedPkg = updatePackagePricing(original, planUpdates);

    setAvailablePackages((prev) =>
      prev.map((pkg) =>
        pkg.id === updatedPkg.id ? updatedPkg : pkg
      )
    );

    // ✅ Avoid unused expression — explicitly reset editor
    setPackageBeingCustomEdited(null);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold mb-6">
        2. Select Insurance Packages
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availablePackages.map((pkg) => {
          const isSelected = selectedPackageIds.has(pkg.id);
          return (
            <Card
              key={pkg.id}
              className={`border-2 ${
                isSelected
                  ? 'border-indigo-500 ring-4 ring-indigo-200'
                  : 'border-gray-200 hover:border-indigo-400'
              }`}
            >
              <CardHeader className="flex justify-between items-center">
                <div
                  onClick={() => handlePackageToggle(pkg.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox checked={isSelected} />
                  <CardTitle>{pkg.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  onClick={() =>
                    isTemplatePackage(pkg)
                      ? handleSaveModification()
                      : handleStartCustomEdit(pkg)
                  }
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p>{pkg.description}</p>
                <p className="font-bold text-indigo-600">
                  ${pkg.totalMonthlyPremium.toFixed(2)}/mo
                </p>
              </CardContent>
            </Card>
          );
        })}

        <Card
          className="border-dashed border-gray-400 cursor-pointer hover:border-indigo-500"
          onClick={handleStartNewCustomPackage}
        >
          <div className="text-center py-10 text-gray-600">
            <Plus className="mx-auto mb-2" />
            Create Custom Package
          </div>
        </Card>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          disabled={selectedPackageIds.size === 0}
          onClick={() =>
            onSubmit(
              Array.from(selectedPackageIds)
                .map(getPackageToDisplay)
                .filter((p): p is Package => !!p)
            )
          }
        >
          Continue ({selectedPackageIds.size})
        </Button>
      </div>
    </div>
  );
}