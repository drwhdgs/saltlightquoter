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

// Temporary type used for plans *inside the editor state* (packageBeingCustomEdited).
// It extends InsurancePlan to enforce a string ID (if the original is optional) 
// and adds the temporary `title` property used for editing the plan name.
type PlanInEditor = InsurancePlan & {
  id: string; // Enforce non-optional ID for editor use
  title: string;
};

// -------------------------------
// --- Component ---
// -------------------------------

// Renders the editor for plans within a package
const PlanEditorCard = ({
  plan,
  onUpdate,
}: {
  plan: PlanInEditor;
  onUpdate: (field: keyof InsurancePlan, value: string | number | boolean) => void;
}) => (
  <Card className="p-4 mb-2 bg-gray-50">
    <div className="flex justify-between items-center mb-2">
      <h4 className="font-semibold text-sm">
        {plan.title || 'New Plan'}
        <Badge variant="secondary" className="ml-2">
          {getPlanTypeLabel(plan.type)}
        </Badge>
      </h4>
    </div>
    <div className="grid grid-cols-3 gap-2 text-sm">
      <div>
        <Label>Title</Label>
        <Input
          value={plan.title}
          // Update 'name' in the package state, which will automatically update 'title' via handlePlanUpdate
          onChange={(e) => onUpdate('name', e.target.value)}
        />
      </div>
      <div>
        <Label>Carrier/Provider</Label>
        <Input
          value={plan.provider}
          onChange={(e) => onUpdate('provider', e.target.value)}
        />
      </div>
      <div>
        <Label>Premium</Label>
        <Input
          type="number"
          step="0.01"
          value={plan.monthlyPremium ?? 0}
          onChange={(e) =>
            onUpdate('monthlyPremium', parseFloat(e.target.value) || 0)
          }
        />
      </div>
    </div>
  </Card>
);

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
      // Use ID for custom packages, Name for templates (to allow overrides)
      if (isTemplate) {
        packageMap.set(pkg.name, pkg);
      } else {
        packageMap.set(pkg.id, pkg);
      }
    });

    return Array.from(packageMap.values());
  });

  const [selectedPackageIds, setSelectedPackageIds] = useState<Set<string>>(() => {
    // If a template package was overridden/modified, its ID might be from initialPackages,
    // so we get all unique IDs from the final availablePackages list that match names
    // or IDs in initialPackages.
    const initialIds = new Set(initialPackages?.map((pkg) => pkg.id) || []);
    const initialNames = new Set(initialPackages?.map((pkg) => pkg.name) || []);

    return new Set(
      availablePackages
        .filter((pkg) => initialIds.has(pkg.id) || initialNames.has(pkg.name))
        .map((pkg) => pkg.id)
    );
  });

  // State now holds Package, but we cast the plans array when setting it
  const [packageBeingCustomEdited, setPackageBeingCustomEdited] =
    useState<Package | null>(null);

  const [newPlanForCustomEditor, setNewPlanForCustomEditor] =
    useState<PlanInEditor>({
      id: generateId(),
      type: 'health',
      title: '',
      name: '', // Required by InsurancePlan
      provider: '',
      monthlyPremium: 0,
    } as PlanInEditor); // Cast to PlanInEditor

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
      description: 'A custom package tailored for the client.',
      plans: [],
      totalMonthlyPremium: 0,
    });
    setNewPlanForCustomEditor({
      id: generateId(),
      type: 'health',
      title: '',
      name: '',
      provider: '',
      monthlyPremium: 0,
    } as PlanInEditor);
    setPlanEditorError(null);
  };

  // Start editing an existing custom package
  const handleStartCustomEdit = (pkg: Package) => {
    setPackageBeingCustomEdited({
      ...pkg,
      // Map plans to PlanInEditor type: ensure ID is defined and add title
      plans: pkg.plans.map(p => ({ 
        ...p, 
        id: p.id || generateId(), // Ensure ID is present
        title: p.name || 'Untitled Plan' 
      })) as PlanInEditor[],
    });
    setNewPlanForCustomEditor({
      id: generateId(),
      type: 'health',
      title: '',
      name: '',
      provider: '',
      monthlyPremium: 0,
    } as PlanInEditor);
    setPlanEditorError(null);
  };

  // Start editing a template package (only premium/plan details)
  const handleStartModificationEdit = (pkg: Package) => {
    setPackageBeingCustomEdited({
      ...pkg,
      // Map plans to PlanInEditor type: ensure ID is defined and add title
      plans: pkg.plans.map(p => ({ 
        ...p, 
        id: p.id || generateId(), 
        title: p.name || 'Untitled Plan' 
      })) as PlanInEditor[],
    });
    setNewPlanForCustomEditor({
      id: generateId(), // This plan is not used for template mods
      type: 'health',
      title: '',
      name: '',
      provider: '',
      monthlyPremium: 0,
    } as PlanInEditor);
    setPlanEditorError(null);
  };

  const handlePlanTypeChangeInCustomEditor = (type: InsuranceType) => {
    setNewPlanForCustomEditor({
      id: generateId(),
      type,
      title: '',
      name: '',
      provider: '',
      monthlyPremium: 0,
    } as PlanInEditor);
    setPlanEditorError(null);
  };

  // Updates a field on an *existing* plan within the packageBeingCustomEdited
  const handlePlanUpdate = (
    planId: string,
    field: keyof InsurancePlan,
    value: string | number | boolean
  ) => {
    setPackageBeingCustomEdited((prev) =>
      prev
        ? {
            ...prev,
            plans: prev.plans.map((p) => {
              // Cast to PlanInEditor for safe property access
              const plan = p as PlanInEditor;
              if (plan.id === planId) {
                // Update the plan fields
                const updatedPlan = { ...plan, [field]: value };
                
                // If 'name' is updated, update the temporary 'title' as well for the editor view
                if (field === 'name') {
                  updatedPlan.title = value as string;
                }
                return updatedPlan;
              }
              return plan;
            }) as InsurancePlan[], // Cast back to the base array type (InsurancePlan[])
          }
        : null
    );
  };

  // Adds the plan from the 'add new plan' form to the custom package
  const handleAddPlanToCustomPackage = () => {
    if (!packageBeingCustomEdited) return;

    const plan = newPlanForCustomEditor;

    if (!plan.title || !plan.provider || (plan.monthlyPremium ?? 0) <= 0) {
      setPlanEditorError(
        'Please fill in Plan Title, select a Carrier, and enter a Monthly Premium greater than $0.'
      );
      return;
    }

    // Create the final InsurancePlan object
    const planToAdd: InsurancePlan = {
      id: generateId(),
      name: plan.title, // Use title as the official name
      type: plan.type,
      provider: plan.provider,
      details: plan.details || '',
      coverage: plan.coverage || '',
      monthlyPremium: plan.monthlyPremium || 0,
      title: ''
    };

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

    // Reset the new plan form
    setNewPlanForCustomEditor({
      id: generateId(),
      type: 'health',
      title: '',
      name: '',
      provider: '',
      monthlyPremium: 0,
    } as PlanInEditor);
    setPlanEditorError(null);
  };

  // Saves modifications to a TEMPLATE package's plan prices/details
  const handleSaveModification = () => {
    if (!packageBeingCustomEdited) return;

    const originalTemplate = PACKAGE_TEMPLATES.find(
      (p) => p.name === packageBeingCustomEdited.name
    );
    
    if (!originalTemplate) {
      setPlanEditorError("Cannot save modifications. The original template was not found.");
      return;
    }
    
    // FIX: Map plans to a type that guarantees 'id: string' for the utility function
    const plansWithGuaranteedId = packageBeingCustomEdited.plans.map(p => ({
      ...p,
      id: p.id || generateId(), // Ensure ID is present
    })) as (InsurancePlan & { id: string })[]; // Assert the resulting type array
    
    // The utility function updatePackagePricing must accept the type with guaranteed IDs
    const updatedPkg = updatePackagePricing(
      packageBeingCustomEdited, 
      plansWithGuaranteedId // Pass the type-safe array
    );

    setAvailablePackages((prev) =>
      prev.map((pkg) =>
        pkg.name === updatedPkg.name ? updatedPkg : pkg
      )
    );

    setSelectedPackageIds((prev) => new Set(prev).add(updatedPkg.id));
    
    setPackageBeingCustomEdited(null);
  };

  // Saves a NEW or EDITED fully custom package
  const handleSaveCustomPackage = () => {
    if (!packageBeingCustomEdited) return;

    if (!packageBeingCustomEdited.name) {
      setPlanEditorError('Please provide a name for your custom package.');
      return;
    }

    if (packageBeingCustomEdited.plans.length === 0) {
      setPlanEditorError('A custom package must contain at least one plan.');
      return;
    }

    const isNew = !availablePackages.some(p => p.id === packageBeingCustomEdited.id);
    
    // Finalize total premium
    const totalMonthlyPremium = packageBeingCustomEdited.plans.reduce(
      (sum, p) => sum + (p.monthlyPremium || 0),
      0
    );

    const savedPackage: Package = {
      ...packageBeingCustomEdited,
      totalMonthlyPremium,
      plans: packageBeingCustomEdited.plans.map(p => {
        const plan = p as PlanInEditor;
        return {
          ...p,
          // Ensure 'name' is set, using the temporary 'title' if 'name' is missing
          name: plan.name || plan.title, 
        }
      }) as InsurancePlan[], // Cast back to the base array type (InsurancePlan[])
    };

    setAvailablePackages((prev) => {
      if (isNew) {
        return [...prev, savedPackage];
      }
      return prev.map((pkg) =>
        pkg.id === savedPackage.id ? savedPackage : pkg
      );
    });

    // Select the new/edited custom package
    setSelectedPackageIds((prev) => new Set(prev).add(savedPackage.id));

    setPackageBeingCustomEdited(null);
  };

  // ---------------------------------
  // --- Custom/Modification Editor UI ---
  // ---------------------------------
  if (packageBeingCustomEdited) {
    const isEditingTemplate = isTemplatePackage(packageBeingCustomEdited);
    const isNewCustom = !availablePackages.some(p => p.id === packageBeingCustomEdited.id);

    return (
      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle>
            {isNewCustom
              ? 'Create New Custom Package'
              : isEditingTemplate
              ? `Modify Template: ${packageBeingCustomEdited.name}`
              : `Edit Custom Package: ${packageBeingCustomEdited.name}`}
          </CardTitle>
          <p className="text-sm text-gray-500">
            {isEditingTemplate
              ? 'Adjust plan prices and details for this client. The template definition is preserved.'
              : 'Add, remove, or modify plans to create a unique package.'}
          </p>
        </CardHeader>
        <Separator className="mb-4" />

        {!isEditingTemplate && (
          <div className="mb-4">
            <Label htmlFor="packageName">Package Name</Label>
            <Input
              id="packageName"
              value={packageBeingCustomEdited.name}
              onChange={(e) =>
                setPackageBeingCustomEdited((prev) =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
            />
          </div>
        )}

        <h3 className="text-lg font-semibold mb-3">Plans in Package</h3>
        
        {/* Render existing plans, cast to PlanInEditor for the editor component */}
        {(packageBeingCustomEdited.plans as PlanInEditor[]).map((plan) => (
          <PlanEditorCard
            key={plan.id}
            plan={plan}
            onUpdate={(field, value) => handlePlanUpdate(plan.id!, field, value)}
          />
        ))}

        {!isEditingTemplate && (
          <>
            <Separator className="my-4" />
            <h3 className="text-lg font-semibold mb-3">Add New Plan</h3>
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              {planEditorError && (
                <p className="text-sm text-red-600 mb-2">{planEditorError}</p>
              )}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Plan Type</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newPlanForCustomEditor.type}
                    onChange={(e) =>
                      handlePlanTypeChangeInCustomEditor(
                        e.target.value as InsuranceType
                      )
                    }
                  >
                    {Object.keys(CARRIERS).map((type) => (
                      <option key={type} value={type}>
                        {getPlanTypeLabel(type as InsuranceType)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Plan Title</Label>
                  <Input
                    value={newPlanForCustomEditor.title}
                    onChange={(e) =>
                      setNewPlanForCustomEditor((p) => ({
                        ...p,
                        title: e.target.value,
                        name: e.target.value, // Keep 'name' updated with 'title'
                      } as PlanInEditor))
                    }
                  />
                </div>
                <div>
                  <Label>Carrier</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newPlanForCustomEditor.provider}
                    onChange={(e) =>
                      setNewPlanForCustomEditor((p) => ({
                        ...p,
                        provider: e.target.value,
                      } as PlanInEditor))
                    }
                  >
                    <option value="">Select Carrier</option>
                    {CARRIERS[newPlanForCustomEditor.type].map((carrier) => (
                      <option key={carrier} value={carrier}>
                        {carrier}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Monthly Premium ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newPlanForCustomEditor.monthlyPremium ?? 0}
                    onChange={(e) =>
                      setNewPlanForCustomEditor((p) => ({
                        ...p,
                        monthlyPremium: parseFloat(e.target.value) || 0,
                      } as PlanInEditor))
                    }
                  />
                </div>
              </div>
              <Button onClick={handleAddPlanToCustomPackage} className="mt-4">
                <Plus className="w-4 h-4 mr-2" /> Add Plan to Package
              </Button>
            </Card>
          </>
        )}

        <div className="mt-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => setPackageBeingCustomEdited(null)}>
            Cancel
          </Button>
          <div className="text-xl font-bold">
            Total: $
            {packageBeingCustomEdited.plans
              .reduce((sum, p) => sum + (p.monthlyPremium || 0), 0)
              .toFixed(2)}
            /mo
          </div>
          <Button
            onClick={
              isEditingTemplate ? handleSaveModification : handleSaveCustomPackage
            }
          >
            {isEditingTemplate ? 'Save Modification' : 'Save Custom Package'}
          </Button>
        </div>
      </Card>
    );
  }

  // ---------------------------------
  // --- Main Package Selection UI ---
  // ---------------------------------
  return (
    <div className="p-4 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold mb-6">
        2. Select Insurance Packages
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availablePackages.map((pkg) => {
          const isSelected = selectedPackageIds.has(pkg.id);
          const isTemplate = isTemplatePackage(pkg);

          // Use the package ID as the key for rendering stability
          const displayKey = pkg.id;

          return (
            <Card
              key={displayKey}
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
                    isTemplate
                      ? handleStartModificationEdit(pkg)
                      : handleStartCustomEdit(pkg)
                  }
                  title={
                    isTemplate
                      ? 'Modify Template Pricing'
                      : 'Edit Custom Package'
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
                <Separator className="my-2" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {pkg.plans.map((plan) => (
                    <Badge key={plan.id} variant="secondary">
                      {getPlanTypeLabel(plan.type)}
                    </Badge>
                  ))}
                </div>
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