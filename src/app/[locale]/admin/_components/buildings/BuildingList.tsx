"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pencil, Trash2, X, Check, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BuildingTypes } from "@/types/types";
import FloorTypeList from "../floortypes/FloorTypeList";

type EditFormTypes = {
  name: string;
  address: string;
};

const BuildingsList = () => {
  const searchParams = useSearchParams();
  const company_id = searchParams.get("company_id");
  const floorTypesParam = searchParams.get("floorTypes");
  const [buildingList, setBuildingList] = useState<BuildingTypes[]>();
  const [editingId, setEditingId] = useState<number>();
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<EditFormTypes>({
    name: "",
    address: "",
  });

  const getBuildings = useCallback(async () => {
    if (!company_id) return;
    try {
      const response = await axios.get<BuildingTypes[]>(
        `http://localhost:3000/api/buildings?company_id=${company_id}`
      );
      setBuildingList(response.data);
      return response.data;
    } catch (error) {
      setError("Error fetching buildings");
      console.error("Error fetching buildings:", error);
      return [];
    }
  }, [company_id]);

  useEffect(() => {
    if (company_id) {
      getBuildings();
    }
  }, [company_id, getBuildings]);

  const validateForm = (form: EditFormTypes) => {
    if (!form.name?.trim() || !form.address?.trim()) {
      setError("Name and address are required");
      return false;
    }
    return true;
  };

  const startEditing = (building: BuildingTypes) => {
    setEditingId(building.id);
    setEditForm({
      name: building.name || "",
      address: building.address || "",
    });
    setError(null);
  };

  const cancelEditing = () => {
    setEditingId(undefined);
    setEditForm({ name: "", address: "" });
    setError(null);
  };

  const handleCreate = async () => {
    if (!validateForm(editForm)) return;

    try {
      await axios.post(`http://localhost:3000/api/create-building`, {
        ...editForm,
        company_id: parseInt(company_id!),
      });
      setIsAdding(false);
      setEditForm({ name: "", address: "" });
      getBuildings();
    } catch (error) {
      setError("Error creating building");
      console.error("Error creating building:", error);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!validateForm(editForm)) return;

    try {
      await axios.put(`http://localhost:3000/api/buildings/${id}`, {
        ...editForm,
        company_id: parseInt(company_id!),
      });
      setEditingId(undefined);
      setEditForm({ name: "", address: "" });
      getBuildings();
    } catch (error) {
      setError("Error updating building");
      console.error("Error updating building:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this building?")) {
      try {
        await axios.delete(`http://localhost:3000/api/buildings/${id}`);
        getBuildings();
      } catch (error) {
        setError("Error deleting building");
        console.error("Error deleting building:", error);
      }
    }
  };

  const pathname = usePathname();
  const router = useRouter();

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

  if (!company_id) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Buildings</h1>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditForm({ name: "", address: "" });
            setError(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Building
        </button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {isAdding && (
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Building name"
            />
            <input
              type="text"
              value={editForm.address}
              onChange={(e) =>
                setEditForm({ ...editForm, address: e.target.value })
              }
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Address"
            />
            <button
              onClick={handleCreate}
              className="p-2 text-green-600 hover:text-green-800"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditForm({ name: "", address: "" });
                setError(null);
              }}
              className="p-2 text-red-600 hover:text-red-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {buildingList?.map((building) => (
          <div
            key={building.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between p-4">
              {editingId === building.id ? (
                <div className="flex-1 flex gap-4">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Building name"
                  />
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Address"
                  />
                  <button
                    onClick={() => handleUpdate(building.id!)}
                    className="p-2 text-green-600 hover:text-green-800"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 flex gap-4">
                    <span className="font-medium">{building.name}</span>
                    <span className="text-gray-600">{building.address}</span>
                  </div>
                  <button
                    onClick={() => addQueryHandler("floorTypes", building.id!)}
                    className="px-3 py-1 text-blue-600 hover:text-blue-800"
                  >
                    Floor Types
                  </button>
                  <button
                    onClick={() => addQueryHandler("apartments", building.id!)}
                    className="px-3 py-1 text-blue-600 hover:text-blue-800"
                  >
                    Apartments
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(building)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(building.id!)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
            {floorTypesParam && parseInt(floorTypesParam) === building.id && (
              <div className="border-t border-gray-200 p-4">
                <FloorTypeList building_id={building.id!} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuildingsList;
