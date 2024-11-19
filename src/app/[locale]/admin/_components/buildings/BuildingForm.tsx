
"use client"
import React, { useState } from "react";
import { Upload, X, Plus } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { BuildingTypes } from "@/types/types";

interface BuildingFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  setError: (error: string | null) => void;
  companyId: string;
  existingBuilding?: BuildingTypes;
}

const BuildingForm: React.FC<BuildingFormProps> = ({
  onCancel,
  onSuccess,
  setError,
  companyId,
  existingBuilding
}) => {
  const [editForm, setEditForm] = useState({
    name: existingBuilding?.name || "",
    address: existingBuilding?.address || "",
    desktop_paths: existingBuilding?.desktop_paths || {},
    mobile_paths: existingBuilding?.mobile_paths || {},
    desktop_image: null as File | null,
    mobile_image: null as File | null,
  });

  const [pathInput, setPathInput] = useState({
    desktop: { floor: "", path: "" },
    mobile: { floor: "", path: "" },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPath = (type: 'desktop' | 'mobile') => {
    const { floor, path } = pathInput[type];
    if (!floor || !path) {
      setError(`Please enter both floor and path for ${type}`);
      return;
    }

    setEditForm(prev => ({
      ...prev,
      [`${type}_paths`]: {
        ...prev[`${type}_paths`],
        [floor]: path
      }
    }));

    // Reset path input
    setPathInput(prev => ({
      ...prev,
      [type]: { floor: "", path: "" }
    }));
  };

  const handleRemovePath = (type: 'desktop' | 'mobile', floor: string) => {
    setEditForm(prev => {
      const updatedPaths = { ...prev[`${type}_paths`] };
      delete updatedPaths[floor];
      return {
        ...prev,
        [`${type}_paths`]: updatedPaths
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (file) {
      setEditForm(prev => ({
        ...prev,
        [`${type}_image`]: file
      }));
    }
  };

  const validateForm = () => {
    if (!editForm.name?.trim() || !editForm.address?.trim()) {
      setError("Name and address are required");
      return false;
    }
    if (Object.keys(editForm.mobile_paths).length === 0) {
      setError("At least one mobile path is required");
      return false;
    }
    if (Object.keys(editForm.desktop_paths).length === 0) {
      setError("At least one desktop path is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('address', editForm.address);
      formData.append('company_id', companyId);
      formData.append('desktop_paths', JSON.stringify(editForm.desktop_paths));
      formData.append('mobile_paths', JSON.stringify(editForm.mobile_paths));

      if (editForm.desktop_image) {
        formData.append('desktop_image', editForm.desktop_image);
      }
      if (editForm.mobile_image) {
        formData.append('mobile_image', editForm.mobile_image);
      }

      if (existingBuilding) {
        await axiosInstance.put(`/buildings/${existingBuilding.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axiosInstance.post('/create-building', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
   
      onSuccess();
    } catch (error) {
      setError(existingBuilding ? "Error updating building" : "Error creating building");
      console.error(existingBuilding ? "Error updating building:" : "Error creating building:", error);
    }
  };

  console.log("!23123", editForm.name)

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Building Name</label>
          <input
            type="text"
            name="name"
            value={editForm.name}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            placeholder="Enter building name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={editForm.address}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            placeholder="Enter building address"
          />
        </div>

        {/* Desktop Paths Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Desktop Paths</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Floor"
              value={pathInput.desktop.floor}
              onChange={(e) => setPathInput(prev => ({
                ...prev,
                desktop: { ...prev.desktop, floor: e.target.value }
              }))}
              className="w-1/4 border border-gray-300 rounded-md py-2 px-3"
            />
            <input
              type="text"
              placeholder="Path"
              value={pathInput.desktop.path}
              onChange={(e) => setPathInput(prev => ({
                ...prev,
                desktop: { ...prev.desktop, path: e.target.value }
              }))}
              className="w-3/4 border border-gray-300 rounded-md py-2 px-3"
            />
            <button
              onClick={() => handleAddPath('desktop')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-1">
            {Object.entries(editForm.desktop_paths).map(([floor, path]) => (
              <div key={floor} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span>Floor {floor}: {path}</span>
                <button 
                  onClick={() => handleRemovePath('desktop', floor)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Paths Section (Similar to Desktop Paths) */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Mobile Paths</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Floor"
              value={pathInput.mobile.floor}
              onChange={(e) => setPathInput(prev => ({
                ...prev,
                mobile: { ...prev.mobile, floor: e.target.value }
              }))}
              className="w-1/4 border border-gray-300 rounded-md py-2 px-3"
            />
            <input
              type="text"
              placeholder="Path"
              value={pathInput.mobile.path}
              onChange={(e) => setPathInput(prev => ({
                ...prev,
                mobile: { ...prev.mobile, path: e.target.value }
              }))}
              className="w-3/4 border border-gray-300 rounded-md py-2 px-3"
            />
            <button
              onClick={() => handleAddPath('mobile')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-1">
            {Object.entries(editForm.mobile_paths).map(([floor, path]) => (
              <div key={floor} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span>Floor {floor}: {path}</span>
                <button 
                  onClick={() => handleRemovePath('mobile', floor)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Image Upload Sections */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Desktop Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'desktop')}
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'mobile')}
              className="mt-1 block w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {existingBuilding ? "Update Building" : "Create Building"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BuildingForm;