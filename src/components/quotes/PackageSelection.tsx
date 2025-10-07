"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit,
  Shield,
  Heart,
  Eye,
  Activity,
  AlertTriangle,
  BriefcaseMedical,
} from "lucide-react";
import { Package, InsurancePlan, Client } from "@/lib/types";
import { generateAllPackages } from "@/lib/packages";

interface PackageSelectionProps {
  client: Client;
  initialPackages?: Package[];
  onSubmit: (packages: Package[]) => void;
  onBack: () => void;
}

export function PackageSelection({
  client,
  initialPackages,
  onSubmit,
  onBack,
}: PackageSelectionProps) {
  const [availablePackages] = useState<Package[]>(generateAllPackages());
  const [selectedPackageIds, setSelectedPackageIds] = useState<Set<string>>(
    new Set()
  );
  const [customizedPackages, setCustomizedPackages] = useState<
    Map<string, Package>
  >(new Map());
  const [editingPlan, setEditingPlan] = useState<{
    packageId: string;
    planId: string;
  } | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<InsurancePlan>>({});

  const carrierLogos: Record<string, string> = {
    Ameritas: "/logos/ameritas.png",
    Transamerica: "/logos/transamerica.png",
    "Manhattan Life": "/logos/manhattan-life.png",
    ACA: "/logos/aca.png",
    KonnectMD: "/logos/konnect.png",
    Breeze: "/logos/breeze.png",
    "United Healthcare": "/logos/uhc.png",
  };

  useEffect(() => {
    if (initialPackages && initialPackages.length > 0) {
      const initialIds = new Set(
        initialPackages.map(
          (pkg) =>
            availablePackages.find((ap) => ap.name === pkg.name)?.id ?? pkg.id
        )
      );
      setSelectedPackageIds(initialIds);

      const customizations = new Map<string, Package>();
      initialPackages.forEach((pkg) => {
        const matchingPkg = availablePackages.find((ap) => ap.name === pkg.name);
        if (matchingPkg) customizations.set(matchingPkg.id, pkg);
      });
      setCustomizedPackages(customizations);
    }
  }, [initialPackages, availablePackages]);

  const handlePackageToggle = (packageId: string, checked: boolean) => {
    const newSelected = new Set(selectedPackageIds);
    if (checked) newSelected.add(packageId);
    else {
      newSelected.delete(packageId);
      const newCustomizations = new Map(customizedPackages);
      newCustomizations.delete(packageId);
      setCustomizedPackages(newCustomizations);
    }
    setSelectedPackageIds(newSelected);
  };

  const getPackageToDisplay = (packageId: string): Package =>
    customizedPackages.get(packageId) ||
    availablePackages.find((p) => p.id === packageId)!;

  const handleEditPlan = (packageId: string, planId: string) => {
    const pkg = getPackageToDisplay(packageId);
    const plan = pkg.plans.find((pl) => pl.id === planId);
    if (plan) {
      setEditFormData(plan);
      setEditingPlan({ packageId, planId });
    }
  };

  const handleSavePlanEdit = () => {
    if (!editingPlan) return;
    const originalPackage = availablePackages.find(
      (p) => p.id === editingPlan.packageId
    );
    if (!originalPackage) return;

    const currentPackage =
      customizedPackages.get(editingPlan.packageId) || originalPackage;
    const updatedPlans = currentPackage.plans.map((plan) =>
      plan.id === editingPlan.planId ? { ...plan, ...editFormData } : plan
    );

    const totalMonthlyPremium = updatedPlans.reduce(
      (sum, plan) => sum + (plan.monthlyPremium ?? 0),
      0
    );
    const updatedPackage: Package = {
      ...currentPackage,
      plans: updatedPlans,
      totalMonthlyPremium,
    };

    const newCustomizations = new Map(customizedPackages);
    newCustomizations.set(editingPlan.packageId, updatedPackage);
    setCustomizedPackages(newCustomizations);

    setEditingPlan(null);
    setEditFormData({});
  };

  const handleSubmit = () => {
    if (selectedPackageIds.size === 0) {
      alert("Please select at least one package before continuing.");
      return;
    }
    const selectedPackages = Array.from(selectedPackageIds).map((id) =>
      getPackageToDisplay(id)
    );
    onSubmit(selectedPackages);
  };

  // ✅ Updated: No colored icons, uniform style
  const getPlanIcon = (type: InsurancePlan["type"]) => {
    switch (type) {
      case "health":
        return <Shield className="w-4 h-4" />;
      case "catastrophic":
        return <AlertTriangle className="w-4 h-4" />;
      case "dental":
        return <Activity className="w-4 h-4" />;
      case "vision":
        return <Eye className="w-4 h-4" />;
      case "life":
        return <Heart className="w-4 h-4" />;
      case "disability":
        return <BriefcaseMedical className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const totalSelectedValue = Array.from(selectedPackageIds).reduce(
    (sum, id) => sum + getPackageToDisplay(id).totalMonthlyPremium,
    0
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Package Selection</h2>
        <p className="text-gray-600 mt-2">
          Choose insurance packages for {client.name}
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Instructions:</strong> Check the boxes to select packages
            and customize plans as needed.
          </p>
        </div>
      </div>

      {/* Package List */}
      <div className="grid gap-6">
        {availablePackages.map((pkg) => {
          const isSelected = selectedPackageIds.has(pkg.id);
          const displayPackage = getPackageToDisplay(pkg.id);

          return (
            <Card
              key={pkg.id}
              className={`transition-all duration-200 ${
                isSelected ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handlePackageToggle(pkg.id, !!checked)
                      }
                      className="scale-125"
                    />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {pkg.name}
                        {pkg.name === "Silver" && (
                          <Badge variant="secondary">Recommended</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {pkg.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${displayPackage.totalMonthlyPremium.toLocaleString()}/mo
                    </div>
                    <p className="text-sm text-gray-500">
                      ${(displayPackage.totalMonthlyPremium * 12).toLocaleString()}
                      /year
                    </p>
                  </div>
                </div>
              </CardHeader>

              {isSelected && (
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      Included Plans:{" "}
                      <Badge variant="outline">
                        {displayPackage.plans.length} plans
                      </Badge>
                    </h4>

                    {displayPackage.plans.map((plan) => (
                      <div
                        key={plan.id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {carrierLogos[plan.provider] ? (
                              <Image
                                src={carrierLogos[plan.provider]}
                                alt={plan.provider}
                                width={24}
                                height={24}
                                className="object-contain"
                              />
                            ) : (
                              getPlanIcon(plan.type)
                            )}
                            <h5 className="font-medium">{plan.name}</h5>
                            <span className="text-gray-500">
                              {plan.provider}
                            </span>
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

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Monthly Premium</p>
                            <p className="font-medium">
                              ${plan.monthlyPremium}/mo
                            </p>
                          </div>
                          {plan.coverage && (
                            <div>
                              <p className="text-gray-600">Coverage</p>
                              <p className="font-medium">{plan.coverage}</p>
                            </div>
                          )}
                          {plan.effectiveDate && (
                            <div>
                              <p className="text-gray-600">Effective Date</p>
                              <p className="font-medium">
                                {plan.effectiveDate}
                              </p>
                            </div>
                          )}
                        </div>

                        {plan.details && (
                          <p className="text-sm text-gray-600 mt-2">
                            {plan.details}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-hidden">
            <CardHeader>
              <CardTitle>Edit Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto max-h-[70vh] pr-2">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input
                  value={editFormData.name ?? ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Monthly Premium</Label>
                <Input
                  type="number"
                  value={editFormData.monthlyPremium ?? ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      monthlyPremium: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Coverage Description</Label>
                <Input
                  value={editFormData.coverage ?? ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      coverage: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={editFormData.effectiveDate ?? ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      effectiveDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Details</Label>
                <Textarea
                  value={editFormData.details ?? ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      details: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
            </CardContent>
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingPlan(null);
                  setEditFormData({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSavePlanEdit}>Save Changes</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Summary */}
      {selectedPackageIds.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quote Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Selected Packages:</span>
                <span>{selectedPackageIds.size}</span>
              </div>
              <div className="flex justify-between items-center font-medium">
                <span>Total Monthly Premium:</span>
                <span className="text-xl text-green-600">
                  ${totalSelectedValue.toLocaleString()}/mo
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total Annual Premium:</span>
                <span>${(totalSelectedValue * 12).toLocaleString()}/year</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit}>Continue</Button>
      </div>
    </div>
  );
}
