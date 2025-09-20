'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Edit, DollarSign, Shield, Heart, Eye, Activity } from 'lucide-react';
import { Package, InsurancePlan, Client } from '@/lib/types';
import { generateAllPackages } from '@/lib/packages';

interface PackageSelectionProps {
  client: Client;
  initialPackages?: Package[];
  onSubmit: (packages: Package[]) => void;
  onBack: () => void;
}

export function PackageSelection({ client, initialPackages, onSubmit, onBack }: PackageSelectionProps) {
  const [availablePackages] = useState<Package[]>(generateAllPackages());
  const [selectedPackageIds, setSelectedPackageIds] = useState<Set<string>>(new Set());
  const [customizedPackages, setCustomizedPackages] = useState<Map<string, Package>>(new Map());
  const [editingPlan, setEditingPlan] = useState<{ packageId: string; planId: string } | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<InsurancePlan>>({});

  useEffect(() => {
    if (initialPackages && initialPackages.length > 0) {
      const initialIds = new Set(
        initialPackages.map(pkg => {
          const matchingPkg = availablePackages.find(ap => ap.name === pkg.name);
          return matchingPkg?.id ?? pkg.id; // always string
        })
      );
      setSelectedPackageIds(initialIds);

      const customizations = new Map<string, Package>();
      initialPackages.forEach(pkg => {
        const matchingPkg = availablePackages.find(ap => ap.name === pkg.name);
        if (matchingPkg) {
          customizations.set(matchingPkg.id, pkg);
        }
      });
      setCustomizedPackages(customizations);
    }
  }, [initialPackages, availablePackages]);

  const handlePackageToggle = (packageId: string, checked: boolean) => {
    const newSelected = new Set(selectedPackageIds);
    if (checked) {
      newSelected.add(packageId);
    } else {
      newSelected.delete(packageId);
      const newCustomized = new Map(customizedPackages);
      newCustomized.delete(packageId);
      setCustomizedPackages(newCustomized);
    }
    setSelectedPackageIds(newSelected);
  };

  const getPackageToDisplay = (packageId: string): Package => {
    return customizedPackages.get(packageId) || availablePackages.find(p => p.id === packageId)!;
  };

  const handleEditPlan = (packageId: string, planId: string) => {
    const pkg = getPackageToDisplay(packageId);
    const plan = pkg.plans.find(pl => pl.id === planId);
    if (plan) {
      setEditFormData(plan);
      setEditingPlan({ packageId, planId });
    }
  };

  const handleSavePlanEdit = () => {
    if (!editingPlan) return;

    const originalPackage = availablePackages.find(p => p.id === editingPlan.packageId);
    if (!originalPackage) return;

    const currentPackage = customizedPackages.get(editingPlan.packageId) || originalPackage;

    const updatedPlans = currentPackage.plans.map(plan =>
      plan.id === editingPlan.planId ? { ...plan, ...editFormData } : plan
    );

    const totalMonthlyPremium = updatedPlans.reduce((sum, plan) => sum + plan.monthlyPremium, 0);

    const updatedPackage: Package = { ...currentPackage, plans: updatedPlans, totalMonthlyPremium };
    const newCustomizations = new Map(customizedPackages);
    newCustomizations.set(editingPlan.packageId, updatedPackage);
    setCustomizedPackages(newCustomizations);

    setEditingPlan(null);
    setEditFormData({});
  };

  const handleSubmit = () => {
    if (selectedPackageIds.size === 0) {
      alert('Please select at least one package before continuing.');
      return;
    }

    const selectedPackages = Array.from(selectedPackageIds).map(id => getPackageToDisplay(id));
    onSubmit(selectedPackages);
  };

  const getPlanIcon = (type: InsurancePlan['type']) => {
    switch (type) {
      case 'health': return <Shield className="w-4 h-4" />;
      case 'dental': return <Activity className="w-4 h-4" />;
      case 'vision': return <Eye className="w-4 h-4" />;
      case 'life': return <Heart className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const totalSelectedValue = Array.from(selectedPackageIds).reduce(
    (sum, id) => sum + getPackageToDisplay(id).totalMonthlyPremium,
    0
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ... UI remains the same as your code above ... */}

      {availablePackages.map((pkg) => {
        const isSelected = selectedPackageIds.has(pkg.id);
        const displayPackage = getPackageToDisplay(pkg.id);

        return (
          <Card key={pkg.id} className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}>
            {/* ... card header ... */}
            {isSelected && (
              <CardContent className="pt-0">
                {displayPackage.plans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        {getPlanIcon(plan.type)}
                        <h5 className="font-medium">{plan.name}</h5>
                        <Badge variant="outline">{plan.provider}</Badge>
                      </div>
                      {plan.id && pkg.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPlan(pkg.id!, plan.id!)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    {/* ... plan details ... */}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
