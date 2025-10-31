// fileName: PackageSelection.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Package, InsurancePlan, Client, InsuranceType, PACKAGE_TEMPLATES, PackageTemplate } from '@/lib/types';
import { generateAllPackages, createPackageFromTemplate, updatePackagePricing } from '@/lib/packages';
import { generateId } from '@/lib/storage';

interface PackageSelectionProps {
  client: Client;
  initialPackages?: Package[];
  onSubmit: (packages: Package[]) => void;
  onBack: () => void;
}

// FIX: Added missing 'vision' and 'breeze' keys to satisfy the Record<InsuranceType, string[]> type definition
const CARRIERS: Record<InsuranceType, string[]> = {
  health: ['Ambetter', 'Molina', 'Blue Cross Blue Shield', 'Cigna', ],
  healthShare: ['Sedera Health'],
  konnect: ['TRUVirtual', 'KonnectMD'],
  dental: ['Ameritas'],
  life: ['American Amicable', 'Transamerica'],
  catastrophic: ['United Healthcare'],
  cancer: ['Manhattan Life', 'Cigna'],
  heart: ['Manhattan Life', 'Cigna'],
  outOfPocket: ['Manhattan Life'],
  disability: ['Breeze'],
  vision: ['Ameritas'], // Added missing vision type
};

// NEW: Define carrier logos, using placeholders for missing images
const carrierLogos: Record<string, string> = {
    "Ameritas": "/logos/ameritas.png",
    "American Amicable": "/logos/AmericanAmicable.jpeg",
    "Manhattan Life": "/logos/manhattan-life.png",
    KonnectMD: "/logos/konnect.png",
    TRUVirtual: "/logos/virtual.png",
    Breeze: "/logos/breeze.png",
    "Ambetter - HMO": "/logos/aca.png",
    "United Healthcare": "/logos/uhc.png",
    "Health Share": "/logos/healthshare.png",
    "Sedera Health": "/logos/sedera.jpg",
  
  // Placeholders for carriers listed in CARRIERS object but not in the known logo map
  "Blue Cross Blue Shield": "https://placehold.co/75x20/F0F4F8/005A9C?text=BCBS",
  Cigna: "https://placehold.co/75x20/F0F4F8/D93737?text=CIGNA",
  Molina: "https://placehold.co/75x20/F0F4F8/1070A0?text=MOLINA",
  "Some Carrier": "https://placehold.co/75x20/F0F4F8/6B7280?text=CARRIER",
  Generic: "https://placehold.co/75x20/F0F4F8/6B7280?text=GENERIC",
};

// --- Helper Functions ---

// NEW: Helper function to retrieve logo or placeholder
const getCarrierLogo = (carrierName: string) => {
    return carrierLogos[carrierName] || 'https://placehold.co/75x20/F0F4F8/6B7280?text=LOGO';
};

// UPDATED: Wrap emoji in span for better vertical alignment
const getPlanIcon = (type: InsurancePlan['type']) => {
  let icon = '';
  switch (type) {
    // Only need the structure here, actual icon logic can be in separate file
    default:
        icon = ''; 
        break;
  }
  // Use a span to ensure consistent vertical alignment with the Image component
  return <span className="text-lg leading-none">{icon}</span>;
};

const getPlanTypeLabel = (type: InsurancePlan['type']) => {
  switch (type) {
    case 'health':
      return 'ACA';
    case 'healthShare':
      return 'Health Sharing';
    case 'konnect':
      return 'Telemedicine';
    case 'dental':
      return 'Dental';
    case 'vision':
      return 'Vision'; // Added label for vision
    case 'life':
      return 'Life Insurance';
    case 'catastrophic':
      return 'Catastrophic';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};
const isTemplatePackage = (pkg: Package) => PACKAGE_TEMPLATES.some(t => t.name === pkg.name);
// --- End Helper Functions ---


// Define a union type for all possible InsurancePlan property values for the setter function
type InsurancePlanValue = InsurancePlan[keyof InsurancePlan];

export function PackageSelection({ client, initialPackages, onSubmit, onBack }: PackageSelectionProps) {
  // All packages available to select (templates + custom ones added by user)
  const [availablePackages, setAvailablePackages] = useState<Package[]>(() => {
    const templates = generateAllPackages();

    if (!initialPackages || initialPackages.length === 0) {
      return templates;
    }

    // FIX: Correctly merge initialPackages (saved quote data) with fresh templates
    // 1. Create a map of fresh templates, keyed by name
    const packageMap = new Map<string, Package>(templates.map(pkg => [pkg.name, pkg]));

    // 2. Iterate through the saved packages (initialPackages)
    initialPackages.forEach(pkg => {
      // Check if the saved package corresponds to a template (using name)
      const isTemplate = isTemplatePackage(pkg);
      
      if (isTemplate) {
        // If it's a template, overwrite the fresh template in the map with the saved version.
        // This ensures the saved version, which has the ID used in selectedPackageIds, is kept.
        packageMap.set(pkg.name, pkg);
      } else {
        // If it's a custom package, add it to the map keyed by its ID to ensure it is available.
        // This relies on custom packages having unique names or IDs (using ID here is safer)
        packageMap.set(pkg.id, pkg); 
      }
    });

    // Return all package objects from the map.
    return Array.from(packageMap.values());
  });
  
  // Set of IDs for selected packages
  const [selectedPackageIds, setSelectedPackageIds] = useState<Set<string>>(() => {
    // This remains correct: it uses the IDs from the saved quote.
    return new Set(initialPackages?.map(pkg => pkg.id) || []);
  });

  // NEW STATE: State for the package being created or comprehensively edited (custom packages only)
  const [packageBeingCustomEdited, setPackageBeingCustomEdited] = useState<Package | null>(null); 
  
  type EditableInsurancePlan = Partial<InsurancePlan> & {
    id: string;
    title: string;
    provider: string;
    type: InsuranceType;
    monthlyPremium?: number;
  };

  const [newPlanForCustomEditor, setNewPlanForCustomEditor] = useState<EditableInsurancePlan>({
    id: generateId(),
    type: 'health',
    title: '',
    provider: '',
    monthlyPremium: 0,
  }); 

  // NEW STATE: Error message for the plan builder
  const [planEditorError, setPlanEditorError] = useState<string | null>(null);


  // Function to get a package from availablePackages by ID
  const getPackageToDisplay = (id: string): Package | undefined => {
    // Search by ID, which is the key in selectedPackageIds
    return availablePackages.find(pkg => pkg.id === id); 
  };

  const handlePackageToggle = (packageId: string) => {
    setSelectedPackageIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(packageId)) {
        newSet.delete(packageId);
      } else {
        newSet.add(packageId);
      }
      return newSet;
    });
  };

  const totalSelectedValue = Array.from(selectedPackageIds).reduce((sum, id) => {
    const pkg = getPackageToDisplay(id);
    return sum + (pkg?.totalMonthlyPremium || 0);
  }, 0);

  // --- Custom Package Creation/Editing Logic (Unified) ---

  const handleStartNewCustomPackage = () => {
    setPackageBeingCustomEdited({
        id: generateId(),
        name: '',
        description: '',
        plans: [],
        totalMonthlyPremium: 0,
    });
    // Reset the plan builder form
    setNewPlanForCustomEditor({
        id: generateId(),
        type: 'health',
        title: '',
        provider: '',
        monthlyPremium: 0,
    }); 
    setPlanEditorError(null); // Reset error state
  };

  const handleStartCustomEdit = (pkg: Package) => {
      // Deep clone the package and plans to prevent direct state mutation
      setPackageBeingCustomEdited({
          ...pkg,
          plans: pkg.plans.map(p => ({ ...p }))
      });
      // Reset the plan builder form
      setNewPlanForCustomEditor({
          id: generateId(),
          type: 'health',
          title: '',
          provider: '',
          monthlyPremium: 0,
      }); 
      setPlanEditorError(null); // Reset error state
  };


  const handlePlanTypeChangeInCustomEditor = (type: InsuranceType) => {
    setNewPlanForCustomEditor({
      id: generateId(),
      type: type,
      title: '',
      provider: '',
      monthlyPremium: 0,
    }); 
    setPlanEditorError(null); // Clear error on interaction
  };

  const handleAddPlanToCustomPackage = () => {
    if (!packageBeingCustomEdited) return;
    const currentPlan = newPlanForCustomEditor;

    // FIX: Use optional chaining and default value (|| 0) to resolve the 'possibly undefined' error
    if (!currentPlan.title || !currentPlan.provider || (currentPlan.monthlyPremium || 0) <= 0) {
      setPlanEditorError('Please fill in Plan Title, select a Carrier, and enter a Monthly Premium greater than $0.');
      return;
    }

    setPlanEditorError(null); // Clear error on success

    const planToAdd: InsurancePlan = {
      // Cast currentPlan to InsurancePlan, relying on the state flow to ensure required fields (id, name, type, provider, monthlyPremium) are present.
      ...(currentPlan as InsurancePlan),
      id: generateId(),
      name: currentPlan.title, // Ensure 'name' is synced with 'title' on creation
      details: currentPlan.details || '',
      coverage: currentPlan.coverage || '',
    };

    const updatedPlans = [...packageBeingCustomEdited.plans, planToAdd];
    const newTotal = updatedPlans.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);
    
    setPackageBeingCustomEdited(prev => prev ? ({
      ...prev,
      plans: updatedPlans,
      totalMonthlyPremium: newTotal,
    }) : null);

    // Reset new plan form
    setNewPlanForCustomEditor({
      id: generateId(),
      type: 'health',
      title: '',
      provider: '',
      monthlyPremium: 0,
    }); 
  };
  
  /**
   * NEW FUNCTION: Unified handler for updating any field in a custom package plan.
   * Crucially, it syncs 'name' and 'title' for display consistency across app views.
   */
  const handleUpdatePlanFieldInCustomPackage = (planId: string, field: keyof InsurancePlan, value: InsurancePlanValue) => {
    if (!packageBeingCustomEdited) return;

    const updatedPlans = packageBeingCustomEdited.plans.map(p => {
        if (p.id === planId) {
const updatedPlan = { ...p, [field]: value };
            
            // Keep name and title in sync for display consistency in both PackageSelection list and ClientPresentation.
            if (field === 'name') {
                updatedPlan.title = String(value);
            } else if (field === 'title') {
                updatedPlan.name = String(value);
            }
            
            // Ensure monthly premium is a number and recalculate total
            if (field === 'monthlyPremium') {
                updatedPlan.monthlyPremium = parseFloat(String(value)) || 0;
            }

            return updatedPlan;
        }
        return p;
    });

    const newTotal = updatedPlans.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);

    setPackageBeingCustomEdited(prev => prev ? ({
        ...prev,
        plans: updatedPlans,
        totalMonthlyPremium: newTotal,
    }) : null);
  };
  
  const handleRemovePlanFromCustomPackage = (planId: string) => {
    if (!packageBeingCustomEdited) return;

    const updatedPlans = packageBeingCustomEdited.plans.filter(p => p.id !== planId);
    const newTotal = updatedPlans.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);
    
    setPackageBeingCustomEdited(prev => prev ? ({
        ...prev,
        plans: updatedPlans,
        totalMonthlyPremium: newTotal,
    }) : null);
  };
  
  const handleSaveCustomPackage = () => {
    if (!packageBeingCustomEdited || !packageBeingCustomEdited.name || packageBeingCustomEdited.plans.length === 0) {
      console.error('Please name the package and add at least one plan.'); 
      return;
    }
    
    // Finalize total monthly premium calculation
    const finalPackage = {
        ...packageBeingCustomEdited,
        totalMonthlyPremium: packageBeingCustomEdited.plans.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0),
    };

    setAvailablePackages(prev => {
        const existingIndex = prev.findIndex(p => p.id === finalPackage.id);
        if (existingIndex !== -1 && !isTemplatePackage(finalPackage)) {
            // Editing existing custom package (must be non-template)
            const newPackages = [...prev];
            newPackages[existingIndex] = finalPackage;
            return newPackages;
        } else if (existingIndex === -1) {
            // Saving brand new custom package (ID was generated in handleStartNewCustomPackage)
            return [...prev, finalPackage];
        }
        return prev; // Should not happen for templates via this flow
    });

    setSelectedPackageIds(prev => new Set(prev).add(finalPackage.id));
    setPackageBeingCustomEdited(null); // Close modal
  };

  // --- End Custom Package Creation/Editing Logic ---

  // --- Delete Custom Package Logic ---
  const handleDeleteCustomPackage = (packageId: string) => {
    // Only allow deletion of non-template packages
    const pkgToDelete = availablePackages.find(p => p.id === packageId);
    if (pkgToDelete && !isTemplatePackage(pkgToDelete)) {
        setAvailablePackages(prev => prev.filter(p => p.id !== packageId));
        setSelectedPackageIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(packageId);
            return newSet;
        });
    }
  };
  // --- End Delete Custom Package Logic ---


  // --- Template Modification Logic (Existing) ---
  // State for package modification (only for templates)
  const [modifyingPackageId, setModifyingPackageId] = useState<string | null>(null);
  const [modifiedPlans, setModifiedPlans] = useState<InsurancePlan[]>([]);


  const handleStartModify = (pkg: Package) => {
    setModifyingPackageId(pkg.id);
    // Deep clone the plans for modification
    setModifiedPlans(pkg.plans.map(p => ({ ...p })));
  };

  // UPDATED: Handle plan name/title update in template modification modal
  const handlePlanUpdate = (planId: string, field: keyof InsurancePlan, value: InsurancePlanValue) => {
    setModifiedPlans(prev => 
      prev.map(p => {
        if (p.id === planId) {
const updatedPlan = { ...p, [field]: value };
            
            // Sync name and title when editing in the template modification modal
            if (field === 'name') {
                updatedPlan.title = String(value);
            } else if (field === 'title') {
                updatedPlan.name = String(value);
            }
            // Ensure monthly premium is a number
            if (field === 'monthlyPremium') {
                updatedPlan.monthlyPremium = parseFloat(String(value)) || 0;
            }
            return updatedPlan;
        }
        return p;
      })
    );
  };

  const handleSaveModification = () => {
    const originalPackage = availablePackages.find(p => p.id === modifyingPackageId);
    if (!originalPackage) return;

    // Map the modified plans into the required type: (Partial<InsurancePlan> & { id: string })[]
    const planUpdates = modifiedPlans
      .filter((p): p is InsurancePlan & { id: string } => !!p.id)
      .map(p => {
          const originalPlan = originalPackage.plans.find(op => op.id === p.id);
          
          // The base structure the utility needs: { id: string }
          const updates: Partial<InsurancePlan> & { id: string } = { id: p.id };
          
          // Build the updates object by comparing with the original plan
          if (originalPlan) {
              (Object.keys(p) as (keyof InsurancePlan)[]).forEach(key => {
                // Check if the property changed and is not 'id'
                if (key !== 'id' && p[key] !== originalPlan[key]) {
                  // Only include the property if it was changed
                  (updates as Record<string, unknown>)[key] = p[key];
                }
              });
          }
          
          // CRUCIAL: Since the user edits 'title' (which also updates 'name' via handlePlanUpdate), 
          // we need to ensure 'title' is included in the updates if it changed,
          // so it propagates to ClientPresentation.
          if (p.title !== originalPlan?.title) {
            updates.title = p.title;
          }
          // Also include name for consistency if it changed
          if (p.name !== originalPlan?.name) {
            updates.name = p.name;
          }

          return updates;
      })
      // Only keep updates where something besides the ID was changed (i.e., keys > 1)
      .filter(u => Object.keys(u).length > 1);
      
    // updatePackagePricing handles recalculation of the total premium based on the modified plans/premiums.
    const updatedPkg = updatePackagePricing(originalPackage, planUpdates);

    // Replace the old package with the updated one in the available list
    setAvailablePackages(prev => 
      prev.map(p => (p.id === modifyingPackageId ? updatedPkg : p))
    );

    // Close the modal
    setModifyingPackageId(null);
  };
  // Find the package being modified to display in the modal
  const packageToModify = availablePackages.find(p => p.id === modifyingPackageId);
  // --- End Template Modification Logic ---


  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">2. Select Insurance Packages</h2>
      <p className="mb-6 text-gray-600">
        Review the package options and select the combination that best fits {client.name}'s needs.
      </p>

      {/* Available Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availablePackages.map((pkg) => {
          const isSelected = selectedPackageIds.has(pkg.id);
          const isTemplate = isTemplatePackage(pkg);

          return (
            <Card
              key={pkg.id}
              className={`
                transition-all duration-300 cursor-pointer 
                ${isSelected 
                  ? 'border-4 border-[#1d2333] shadow-xl ring-4 ring-gray-200' 
                  : 'border-2 border-gray-200 hover:border-gray-400 hover:shadow-lg'}
              `}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b">
                {/* This div now handles the toggle for the whole clickable area of the title/checkbox. */}
                <div 
                    className="flex items-center space-x-2 flex-1 min-w-0 pr-4 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePackageToggle(pkg.id);
                    }}
                >
                    <Checkbox
                        checked={isSelected}
                        className="w-5 h-5 rounded-md border-indigo-500"
                    />
                    <CardTitle className="text-xl font-bold text-gray-900 truncate">{pkg.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                    {/* Edit button: For Templates (price modification) or Custom (full edit) */}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            if (isTemplate) {
                                handleStartModify(pkg); // Existing template price modifier
                            } else {
                                handleStartCustomEdit(pkg); // New full custom editor
                            }
                        }}
                        title={isTemplate ? "Modify Plan Pricing/Details/Name" : "Edit Custom Package"}
                        className="text-gray-500 hover:text-indigo-600"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>

                    {/* Delete button: Only for custom packages (non-templates) */}
                    {!isTemplate && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => { e.stopPropagation(); handleDeleteCustomPackage(pkg.id); }}
                            title="Delete Custom Package"
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
              </CardHeader>
              {/* CardContent click handles selection if user clicks on plan details instead of header */}
              <CardContent 
                className="p-4 cursor-pointer"
                onClick={() => handlePackageToggle(pkg.id)}
              >
                <p className="text-sm text-gray-500 mb-3">{pkg.description}</p>
                <div className="text-center mb-4">
                  <span className="text-3xl font-extrabold text-gray-900">
                    ${pkg.totalMonthlyPremium.toLocaleString()}
                  </span>
                  <span className="text-base text-gray-600">/mo</span>
                </div>
                <Separator className="mb-3" />
                <ul className="space-y-2 text-sm">
                  {pkg.plans.map((plan, index) => (
                    <li 
                      key={index} 
                      className="flex items-center justify-between space-x-2 w-full"
                    >
                      {/* Left Side: Icon and Title. Added flex-1 and min-w-0 to title to ensure proper truncation */}
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className="flex items-center flex-shrink-0">
                          {getPlanIcon(plan.type)}
                        </div>
                        {/* Use plan.title for display here, which is synced with plan.name in the editor */}
                        <span className="font-medium truncate min-w-0">{plan.title}</span> 
                      </div>
                      
                      {/* Right Side: Carrier Logo and Name. Used flex-shrink-0 and constrained image/text. */}
                      <div className="flex items-center space-x-1 text-gray-700 flex-shrink-0">
                          <Image
                              src={getCarrierLogo(plan.provider)}
                              alt={`${plan.provider} Logo`}
                              width={75}
                              height={20}
                              // max-w-[60px] helps constrain the logo's space
                              className="object-contain h-4 max-w-[60px] w-auto" 
                          />
                          {/* Hidden on default/sm, visible on md and up. Added truncate for extra safety. */}
                          <span className="text-xs font-normal hidden md:inline truncate">{plan.provider}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}

        {/* Add New Custom Package Card */}
        <Card 
            className="border-2 border-dashed border-gray-300 flex items-center justify-center p-6 cursor-pointer hover:border-indigo-500 transition-colors"
            onClick={handleStartNewCustomPackage}
        >
            <div className="text-center text-gray-500 hover:text-indigo-600">
                <Plus className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">Create New Custom Package</p>
            </div>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Quote Summary */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
        <p className="text-2xl mt-1 font-bold">
            Packages Selected: <strong className="text-indigo-600">{selectedPackageIds.size}</strong>
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button 
            onClick={() => onSubmit(Array.from(selectedPackageIds).map(getPackageToDisplay).filter((pkg): pkg is Package => pkg !== undefined))}
            disabled={selectedPackageIds.size === 0}
            className="bg-blue-500 hover:bg-indigo-700 disabled:opacity-50"
        >
            Continue ({selectedPackageIds.size} Package{selectedPackageIds.size !== 1 ? 's' : ''})
        </Button>
      </div>

      {/* Modal for Creating/Editing Custom Package (Unified Editor) */}
      {packageBeingCustomEdited && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">
                {isTemplatePackage(packageBeingCustomEdited) ? 'Create Custom Package' : 'Edit Custom Package'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Package Details */}
              <Label htmlFor="pkg-name">Package Name</Label>
              <Input 
                id="pkg-name" 
                value={packageBeingCustomEdited.name} 
                onChange={e => setPackageBeingCustomEdited(prev => prev ? ({...prev, name: e.target.value}) : null)} 
                placeholder="e.g., Premier Custom Health Plan"
              />
              <Label htmlFor="pkg-desc">Description</Label>
              <Textarea 
                id="pkg-desc" 
                value={packageBeingCustomEdited.description} 
                onChange={e => setPackageBeingCustomEdited(prev => prev ? ({...prev, description: e.target.value}) : null)} 
                placeholder="A brief description of this package."
              />
              
              <Separator />

              {/* Plans in Package List (Editable) */}
              <h4 className="text-lg font-semibold">
                Plans in Package ({packageBeingCustomEdited.plans.length})
                <span className="text-sm font-normal ml-2 text-gray-500">
                    Total: ${packageBeingCustomEdited.totalMonthlyPremium.toLocaleString()}
                </span>
              </h4>
              <div className="p-3 border rounded bg-gray-50 max-h-40 overflow-y-auto">
                {packageBeingCustomEdited.plans.map(p => (
                  <div key={p.id} className="flex flex-col space-y-2 py-2 border-b last:border-b-0">
                    <div className="flex justify-between items-center w-full">
                        {/* FIX: Use Input for editable plan name (name field is displayed here) */}
                        <div className="flex items-center space-x-2 flex-1 min-w-0"> 
                            <Input 
                                type="text"
                                // Use 'name' for the input value in the editor
                                value={p.name}
                                onChange={(e) => {
                                    // Use the generic handler to update the name and sync the title
                                    handleUpdatePlanFieldInCustomPackage(p.id!, 'name', e.target.value);
                                }}
                                className="flex-1 text-sm font-medium text-gray-800 h-8 p-1 px-2 border-gray-300"
                            />
                            <Badge variant="secondary" className="flex-shrink-0">{p.provider}</Badge>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <Input 
                                type="number"
                                value={p.monthlyPremium}
                                onChange={(e) => {
                                    const newPremium = parseFloat(e.target.value) || 0;
                                    // Use the generic handler to update the premium
                                    handleUpdatePlanFieldInCustomPackage(p.id!, 'monthlyPremium', newPremium);
                                }}
                                className="w-24 text-right h-8"
                            />
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                // Use non-null assertion '!' here as plans in the editor state should have an ID
                                onClick={() => handleRemovePlanFromCustomPackage(p.id!)}
                                className="w-7 h-7 text-red-500 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    {p.details && <p className="text-xs text-gray-500 italic">{p.details}</p>}
                  </div>
                ))}
                {packageBeingCustomEdited.plans.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No plans added to this package yet.</p>
                )}
              </div>

              <Separator />
              <h4 className="text-lg font-semibold">Add New Plan</h4>
              
              {/* NEW: Display Error Message */}
              {planEditorError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                  {planEditorError}
                </div>
              )}
              
              {/* Add New Plan Form */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="plan-type">Plan Type</Label>
                    <select
                        id="plan-type"
                        value={newPlanForCustomEditor.type}
                        onChange={e => handlePlanTypeChangeInCustomEditor(e.target.value as InsuranceType)}
                        className="p-2 border rounded-md w-full"
                    >
                        {(Object.keys(CARRIERS) as InsuranceType[]).map(type => (
                            <option key={type} value={type}>{getPlanTypeLabel(type)}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="plan-provider">Provider/Carrier</Label>
                    <select
                        id="plan-provider"
                        value={newPlanForCustomEditor.provider}
                        onChange={e => setNewPlanForCustomEditor(prev => ({...prev, provider: e.target.value}))}
                        className="p-2 border rounded-md w-full"
                    >
                        <option value="">Select Carrier</option>
                        {(CARRIERS[newPlanForCustomEditor.type] || []).map(carrier => (
                            <option key={carrier} value={carrier}>{carrier}</option>
                        ))}
                    </select>
                </div>
              </div>

              <Label>Plan Title</Label>
              <Input 
                value={newPlanForCustomEditor.title} 
                onChange={e => setNewPlanForCustomEditor(prev => ({...prev, title: e.target.value}))} 
                placeholder="e.g., Gold PPO 500"
              />

              <Label>Monthly Premium ($)</Label>
              <Input 
                type="number" 
                value={newPlanForCustomEditor.monthlyPremium || ''} 
                onChange={e => setNewPlanForCustomEditor(prev => ({...prev, monthlyPremium: parseFloat(e.target.value) || 0}))} 
                placeholder="150.00"
              />

              {/* Conditional Inputs based on Plan Type (Simplified) */}
              {newPlanForCustomEditor.type === 'health' && (
                <>
                  <Label>Deductible</Label>
                  <Input type="number" value={newPlanForCustomEditor.deductible ?? ''} onChange={e => setNewPlanForCustomEditor(prev => ({...prev, deductible: parseInt(e.target.value) || 0}))} />
                  <Label>Out-of-Pocket Max</Label>
                  <Input type="number" value={newPlanForCustomEditor.outOfPocketMax ?? ''} onChange={e => setNewPlanForCustomEditor(prev => ({...prev, outOfPocketMax: parseInt(e.target.value) || 0}))} />
                </>
              )}

              {newPlanForCustomEditor.type === 'life' && (
                <>
                  <Label>Term (Years)</Label>
                  <Input 
                    value={newPlanForCustomEditor.term ?? ''} 
                    onChange={e => {
                        // FIX: Clean non-numeric characters to ensure only the number of years is saved
                        const cleanValue = e.target.value.replace(/[^0-9]/g, '');
                        setNewPlanForCustomEditor(prev => ({...prev, term: cleanValue}))
                    }} 
                  />
                   <Label>Coverage Amount ($)</Label>
                  <Input 
                    // Changed type to text to allow custom formatting
                    type="text" 
                    // Format the value for display as a currency string (e.g., $100,000)
                    value={newPlanForCustomEditor.deathBenefit ? `$${String(newPlanForCustomEditor.deathBenefit).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : ''} 
                    onChange={e => {
                        // Remove non-digit characters (like $, commas) before updating state
                        const cleanValue = e.target.value.replace(/[^0-9]/g, '');
                        setNewPlanForCustomEditor(prev => ({
                            ...prev, 
                            deathBenefit: cleanValue
                        }))
                    }} 
                    placeholder="e.g., 250,000"
                  />
                </>
              )}
              
              <Label>Summary</Label>
              <Textarea 
                value={newPlanForCustomEditor.coverage as string || 
                       (newPlanForCustomEditor.type === 'life' 
                          ? 'Includes Terminal Illness Accelerated Death Benefit Rider, Accelerated Death Benefits Rider and Chronic Illness Accelerated Benefit Rider.' 
                          : '')
                      } 
                onChange={e => setNewPlanForCustomEditor(prev => ({...prev, coverage: e.target.value}))} 
                placeholder={newPlanForCustomEditor.type === 'life' 
                             ? 'Includes Terminal Illness Accelerated Death Benefit Rider, Accelerated Death Benefits Rider and Chronic Illness Accelerated Benefit Rider.' 
                             : 'e.g., $10 Copay, $50 Specialist, Free Annual Exam'}
              />


              <Button onClick={handleAddPlanToCustomPackage} className="mt-2 bg-green-500 hover:bg-green-600">Add Plan to Package</Button>
            </CardContent>

            <div className="flex justify-end space-x-2 p-4 border-t">
              <Button variant="outline" onClick={() => setPackageBeingCustomEdited(null)}>Cancel</Button>
              <Button 
                onClick={handleSaveCustomPackage} 
                className="bg-[#1d2333] hover:bg-indigo-700" 
                disabled={!packageBeingCustomEdited.name || packageBeingCustomEdited.plans.length === 0}
              >
                Save Package
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal for Modifying Template Package (Pricing/Details/Name) */}
      {modifyingPackageId && packageToModify && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-4xl">
                  <CardHeader>
                      <CardTitle className="text-2xl">Modify Package: {packageToModify.name}</CardTitle>
                      <p className="text-sm text-gray-500">Adjust the pricing, details, or plan name for this quote only.</p>
                  </CardHeader>
                  <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto">
                      {modifiedPlans.map(plan => (
                          <div key={plan.id} className="border p-4 rounded-lg space-y-3 bg-gray-50">
                              <h4 className="text-lg font-semibold flex items-center justify-between space-x-2">
                                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                                      {getPlanIcon(plan.type)}
                                      <Image
                                          src={getCarrierLogo(plan.provider)}
                                          alt={`${plan.provider} Logo`}
                                          width={75}
                                          height={20}
                                          className="object-contain h-4 w-auto" 
                                      />
                                      <span className="truncate">{plan.title}</span>
                                  </div>
                                  <div className="text-gray-500 text-sm flex-shrink-0">
                                      ({getPlanTypeLabel(plan.type)})
                                  </div>
                              </h4>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                  {/* NEW: Plan Name/Title Adjustment */}
                                  <div className="space-y-1 col-span-full">
                                      <Label htmlFor={`title-${plan.id}`} className="font-medium text-gray-700">
                                          Plan Name/Title
                                      </Label>
                                      <Input
                                          id={`title-${plan.id}`}
                                          type="text"
                                          // Use 'title' for display and editing
                                          value={plan.title}
                                          // Update 'title' which also syncs 'name' via handlePlanUpdate
                                          onChange={e => handlePlanUpdate(plan.id!, 'title', e.target.value)}
                                          placeholder="e.g., New Gold PPO 500"
                                          className="text-base"
                                      />
                                  </div>

                                  {/* Monthly Premium Adjustment */}
                                  <div className="space-y-1">
                                      <Label htmlFor={`premium-${plan.id}`} className="font-medium text-gray-700">
                                          Monthly Premium ($)
                                      </Label>
                                      <Input
                                          id={`premium-${plan.id}`}
                                          type="number"
                                          value={plan.monthlyPremium || ''}
                                          onChange={e => handlePlanUpdate(plan.id!, 'monthlyPremium', parseFloat(e.target.value) || 0)}
                                          placeholder="0.00"
                                          className="text-base"
                                      />
                                  </div>
                                  
                                  {/* Deductible Adjustment (Only for Health/Catastrophic/HealthShare plans) */}
                                  {(plan.type === 'health' || plan.type === 'catastrophic' || plan.type === 'healthShare') && (
                                      <div className="space-y-1">
                                          <Label htmlFor={`deductible-${plan.id}`} className="font-medium text-gray-700">
                                              Deductible
                                          </Label>
                                          <Input
                                              id={`deductible-${plan.id}`}
                                              type="number"
                                              value={plan.deductible || ''} // Use 'plan.deductible' for existing value
                                              onChange={e => handlePlanUpdate(plan.id!, 'deductible', parseInt(e.target.value) || 0)}
                                              placeholder="0"
                                              className="text-base"
                                          />
                                      </div>
                                  )}

                                  {/* Coinsurance Adjustment (Only for Health/Catastrophic/HealthShare plans) */}
                                  {(plan.type === 'health' || plan.type === 'catastrophic' || plan.type === 'healthShare') && (
                                      <div className="space-y-1">
                                          <Label htmlFor={`coinsurance-${plan.id}`} className="font-medium text-gray-700">
                                              Coinsurance (%)
                                          </Label>
                                          <Input
                                              id={`coinsurance-${plan.id}`}
                                              type="number"
                                              value={plan.coinsurance || ''}
                                              onChange={e => handlePlanUpdate(plan.id!, 'coinsurance', parseInt(e.target.value) || 0)}
                                              placeholder="20"
                                              className="text-base"
                                          />
                                      </div>
                                  )}

                                  {/* Out-of-Pocket Max Adjustment (Only for Health/Catastrophic plans) */}
                                  {(plan.type === 'health' || plan.type === 'catastrophic') && (
                                      <div className="space-y-1">
                                          <Label htmlFor={`oop-max-${plan.id}`} className="font-medium text-gray-700">
                                              Out-of-Pocket Max
                                          </Label>
                                          <Input
                                              id={`oop-max-${plan.id}`}
                                              type="number"
                                              value={plan.outOfPocketMax || ''}
                                              onChange={e => handlePlanUpdate(plan.id!, 'outOfPocketMax', parseInt(e.target.value) || 0)}
                                              placeholder="0"
                                              className="text-base"
                                          />
                                      </div>
                                  )}

                                  {/* Co-pays for Health Plans (New Fields) */}
                                  {(plan.type === 'health') && (
                                      <>
                                          {/* Primary Care Co-pay */}
                                          <div className="space-y-1">
                                              <Label htmlFor={`pcp-copay-${plan.id}`} className="font-medium text-gray-700">
                                                  Primary Care Co-pay ($)
                                              </Label>
                                              <Input
                                                  id={`pcp-copay-${plan.id}`}
                                                  type="number"
                                                  value={plan.primaryCareCopay || ''}
                                                  onChange={e => handlePlanUpdate(plan.id!, 'primaryCareCopay', parseInt(e.target.value) || 0)}
                                                  placeholder="30"
                                                  className="text-base"
                                              />
                                          </div>

                                          {/* Specialist Co-pay */}
                                          <div className="space-y-1">
                                              <Label htmlFor={`spec-copay-${plan.id}`} className="font-medium text-gray-700">
                                                  Specialist Co-pay ($)
                                              </Label>
                                              <Input
                                                  id={`spec-copay-${plan.id}`}
                                                  type="number"
                                                  value={plan.specialistCopay || ''}
                                                  onChange={e => handlePlanUpdate(plan.id!, 'specialistCopay', parseInt(e.target.value) || 0)}
                                                  placeholder="60"
                                                  className="text-base"
                                              />
                                          </div>

                                          {/* Generic Drug Co-pay */}
                                          <div className="space-y-1">
                                              <Label htmlFor={`drug-copay-${plan.id}`} className="font-medium text-gray-700">
                                                  Generic Drug Co-pay ($)
                                              </Label>
                                              <Input
                                                  id={`drug-copay-${plan.id}`}
                                                  type="number"
                                                  value={plan.genericDrugCopay || ''}
                                                  onChange={e => handlePlanUpdate(plan.id!, 'genericDrugCopay', parseInt(e.target.value) || 0)}
                                                  placeholder="10"
                                                  className="text-base"
                                              />
                                          </div>
                                      </>
                                  )}
                                  
                                  {/* Coverage/Details Summary Modification (Textarea) */}
                                  <div className="space-y-1 col-span-full">
                                      <Label htmlFor={`details-${plan.id}`} className="font-medium text-gray-700">
                                          Plan Details Summary
                                      </Label>
                                      <Textarea
                                          id={`details-${plan.id}`}
                                          value={plan.details || ''}
                                          onChange={e => handlePlanUpdate(plan.id!, 'details', e.target.value)}
                                          placeholder="Brief summary of coverage or benefits."
                                          rows={2}
                                          className="text-sm"
                                      />
                                  </div>
                              </div>
                          </div>
                      ))}
                  </CardContent>
                  <div className="flex justify-end space-x-2 p-4 border-t">
                      <Button variant="outline" onClick={() => setModifyingPackageId(null)}>Cancel</Button>
                      <Button onClick={handleSaveModification} className="bg-[#1d2333] hover:bg-indigo-700">Apply Changes</Button>
                  </div>
              </Card>
          </div>
      )}
    </div>
  );
}