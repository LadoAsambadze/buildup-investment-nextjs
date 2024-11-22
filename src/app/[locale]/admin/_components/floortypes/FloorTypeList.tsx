"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axiosInstance from "@/utils/axiosInstance";
import FloorPlanForm from "./FloorplanForm";
import Image from "next/image";

interface FloorPlan {
  id: number;
  name: string;
  building_id: number;
  floor_range_start: number;
  floor_range_end: number;
  starting_apartment_number: number;
  apartments_per_floor: number;
  desktop_paths: Record<string, string>;
  mobile_paths: Record<string, string>;
  desktop_image_url: string;
  mobile_image_url: string;
}

interface FloorPlanDashboardProps {
  buildingId: number;
}

const FloorPlanDashboard = ({ buildingId }: FloorPlanDashboardProps) => {
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<FloorPlan | null>(null);

  const fetchFloorPlans = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/floor-plans/${buildingId}`);
      setFloorPlans(response.data);
      setError(null);
      console.log(response);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error fetching floor plans");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFloorPlans();
  }, [buildingId]);

  const handleDelete = async (planId: number) => {
    if (!window.confirm("Are you sure you want to delete this floor plan?")) {
      console.log(planId);
      return;
    }

    try {
      await axiosInstance.delete(`/floor-plans/${planId}`);
      fetchFloorPlans(); // Refresh the list after deletion
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error deleting floor plan");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedPlan(null);
    fetchFloorPlans(); // Refresh list after adding/editing
  };

  if (showForm) {
    return (
      <FloorPlanForm
        buildingId={buildingId}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setSelectedPlan(null);
        }}
        editPlan={selectedPlan}
      />
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Floor Plans</CardTitle>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add New Floor Plan
        </button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">Loading floor plans...</div>
        ) : floorPlans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No floor plans found. Click the button above to create one.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {floorPlans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden">
                <div className="aspect-video relative overflow-hidden bg-gray-100">
                  <img
                    src={`http://localhost:3000/${plan.desktop_image}`}
                    alt={`Floor plan ${plan.name}`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{plan.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      Floors: {plan.floor_range_start} - {plan.floor_range_end}
                    </p>
                    <p>Apartments per floor: {plan.apartments_per_floor}</p>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowForm(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FloorPlanDashboard;
