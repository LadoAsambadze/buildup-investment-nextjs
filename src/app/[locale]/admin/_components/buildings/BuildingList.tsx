"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Edit } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BuildingTypes } from "@/types/types";
import axiosInstance from "@/utils/axiosInstance";
import BuildingForm from "./BuildingForm";
import BuildingCard from "./BuildingCard";
import ErrorAlert from "./ErrorAlert";
import FloorTypeList from "../floortypes/FloorTypeList";

const BuildingsList = () => {
  const searchParams = useSearchParams();
  const company_id = searchParams.get("company_id");
  const floorTypes = searchParams.get("floorTypes");
  const [buildingList, setBuildingList] = useState<BuildingTypes[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BuildingTypes | null>(
    null
  );

  const pathname = usePathname();
  const router = useRouter();

  const getBuildings = useCallback(async () => {
    if (!company_id) return;
    try {
      const response = await axiosInstance.get<BuildingTypes[]>(
        `/buildings?company_id=${company_id}`
      );
      setBuildingList(response.data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
    }
  }, [company_id]);

  useEffect(() => {
    if (company_id) {
      getBuildings();
    }
  }, [company_id, getBuildings]);

  const addQueryHandler = (
    type: "floorTypes" | "apartments",
    building_id: number
  ) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    const otherType = type === "floorTypes" ? "apartments" : "floorTypes";
    currentParams.delete(otherType);
    currentParams.set(type, building_id.toString());
    const search = currentParams.toString();
    const query = search ? `?${search}` : "";
    const path = typeof pathname === "string" ? pathname : "";
    router.push(`${path}${query}`);
  };

  const handleEditBuilding = (building: BuildingTypes) => {
    setEditingBuilding(building);
    // Close the "Add Building" form if it's open
    setIsAdding(false);
  };

  // Render BuildingsList or FloorTypesList based on query params
  if (!company_id) {
    return (
      <div className="text-5xl w-full flex justify-center items-center">
        Build up Investment
      </div>
    );
  }

  // If floorTypes is in the query, render FloorTypesList
  if (floorTypes) {
    return <FloorTypeList buildingId={parseInt(floorTypes)} />;
  }

  // Otherwise, render BuildingsList
  return (
    <Card className="w-full p-6 rounded-none">
      <CardHeader>
        <CardTitle>Buildings</CardTitle>
        <button
          onClick={() => {
            setEditingBuilding(null);
            setIsAdding(true);
          }}
          className="flex items-center w-40 gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Building
        </button>
      </CardHeader>
      <CardContent>
        {error && <ErrorAlert message={error} />}

        <div className="space-y-4">
          {(isAdding || editingBuilding) && (
            <BuildingForm
              onCancel={() => {
                setIsAdding(false);
                setEditingBuilding(null);
              }}
              onSuccess={() => {
                setIsAdding(false);
                setEditingBuilding(null);
                getBuildings();
              }}
              setError={setError}
              companyId={company_id!}
              existingBuilding={editingBuilding || undefined}
            />
          )}

          {buildingList?.map((building) => (
            <div key={building.id} className="relative group">
              <BuildingCard
                building={building}
                onFloorTypesClick={() =>
                  addQueryHandler("floorTypes", building.id!)
                }
                onApartmentsClick={() =>
                  addQueryHandler("apartments", building.id!)
                }
              />
              <button
                onClick={() => handleEditBuilding(building)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingsList;
