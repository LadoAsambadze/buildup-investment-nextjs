"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axiosInstance from "@/utils/axiosInstance";
import { BuildingTypes } from "@/types/types";
import BuildingForm from "@/components/BuildingForm";
import ErrorAlert from "@/components/ErrorAlert";

export default function EditBuildingPage() {
  const [building, setBuilding] = useState<BuildingTypes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const buildingId = params.id as string;

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const response = await axiosInstance.get<BuildingTypes>(`/buildings/${buildingId}`);
        setBuilding(response.data);
      } catch (err) {
        setError("Failed to fetch building details");
      }
    };

    fetchBuilding();
  }, [buildingId]);

  const handleUpdate = async (formData: FormData) => {
    try {
      await axiosInstance.put(`/buildings/${buildingId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      router.push('/buildings');
    } catch (err) {
      setError("Failed to update building");
    }
  };

  if (!building) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Building</h1>
      {error && <ErrorAlert message={error} />}
      <BuildingForm 
        initialData={building}
        onCancel={() => router.push('/buildings')}
        onSubmit={handleUpdate}
        isEditMode={true}
      />
    </div>
  );
}