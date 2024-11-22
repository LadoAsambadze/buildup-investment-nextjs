import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axiosInstance from "@/utils/axiosInstance";

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
  desktop_image_url?: string;
  mobile_image_url?: string;
}

interface FloorPlanFormProps {
  buildingId: number;
  onSuccess: () => void;
  onCancel: () => void;
  editPlan?: FloorPlan | null;
}

const FloorPlanForm = ({
  buildingId,
  onSuccess,
  onCancel,
  editPlan,
}: FloorPlanFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    building_id: buildingId,
    floor_range_start: "",
    floor_range_end: "",
    starting_apartment_number: "",
    apartments_per_floor: "",
    desktop_paths: {} as Record<string, string>,
    mobile_paths: {} as Record<string, string>,
    desktop_image: null as File | null,
    mobile_image: null as File | null,
  });

  const [pathInput, setPathInput] = useState({
    desktop: { floor: "", path: "" },
    mobile: { floor: "", path: "" },
  });

  // Initialize form with edit data if available
  useEffect(() => {
    if (editPlan) {
      setFormData({
        name: editPlan.name,
        building_id: editPlan.building_id,
        floor_range_start: editPlan.floor_range_start,
        floor_range_end: editPlan.floor_range_end,
        starting_apartment_number: editPlan.starting_apartment_number,
        apartments_per_floor: editPlan.apartments_per_floor,
        desktop_paths: editPlan.desktop_paths,
        mobile_paths: editPlan.mobile_paths,
        desktop_image: null,
        mobile_image: null,
      });
    }
  }, [editPlan]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      const files = e.target.files;
      if (files && files[0]) {
        setFormData((prev) => ({
          ...prev,
          [name]: files[0],
        }));
      }
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? parseInt(value) : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddPath = (type: "desktop" | "mobile") => {
    const { floor, path } = pathInput[type];
    if (!floor || !path) {
      setError(`Please enter both floor and path for ${type}`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [`${type}_paths`]: {
        ...prev[`${type}_paths`],
        [floor]: path,
      },
    }));

    setPathInput((prev) => ({
      ...prev,
      [type]: { floor: "", path: "" },
    }));
  };

  const handleRemovePath = (type: "desktop" | "mobile", floor: string) => {
    setFormData((prev) => {
      const paths = { ...prev[`${type}_paths`] };
      delete paths[floor];
      return {
        ...prev,
        [`${type}_paths`]: paths,
      };
    });
  };

  const validateForm = () => {
    if (!formData.name?.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.floor_range_start || !formData.floor_range_end) {
      setError("Floor range is required");
      return false;
    }
    if (!formData.starting_apartment_number || !formData.apartments_per_floor) {
      setError("Apartment numbers configuration is required");
      return false;
    }
    if (Object.keys(formData.desktop_paths).length === 0) {
      setError("At least one desktop path is required");
      return false;
    }
    if (Object.keys(formData.mobile_paths).length === 0) {
      setError("At least one mobile path is required");
      return false;
    }
    if (!editPlan && (!formData.desktop_image || !formData.mobile_image)) {
      setError("Both desktop and mobile images are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key.includes("paths")) {
        form.append(key, JSON.stringify(value));
      } else if (value instanceof File) {
        form.append(key, value);
      } else {
        form.append(key, String(value));
      }
    });

    try {
      if (editPlan) {
        await axiosInstance.put(`/floor-plans/${editPlan.id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/floor-plans", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error saving floor plan");
    }
  };

  const renderPathList = (type: "desktop" | "mobile") => (
    <div className="space-y-1">
      {Object.entries(formData[`${type}_paths`]).map(([floor, path]) => (
        <div
          key={floor}
          className="flex justify-between items-center bg-gray-50 p-2 rounded"
        >
          <span>
            Floor {floor}: {path}
          </span>
          <button
            type="button"
            onClick={() => handleRemovePath(type, floor)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {editPlan ? "Edit Floor Plan" : "Create New Floor Plan"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Floor Plan Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Floor Range Start
              </label>
              <input
                type="number"
                name="floor_range_start"
                value={formData.floor_range_start}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Floor Range End
              </label>
              <input
                type="number"
                name="floor_range_end"
                value={formData.floor_range_end}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Starting Apartment Number
              </label>
              <input
                type="number"
                name="starting_apartment_number"
                value={formData.starting_apartment_number}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Apartments per Floor
              </label>
              <input
                type="number"
                name="apartments_per_floor"
                value={formData.apartments_per_floor}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Desktop Paths */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Desktop Paths
              </h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Floor"
                  value={pathInput.desktop.floor}
                  onChange={(e) =>
                    setPathInput((prev) => ({
                      ...prev,
                      desktop: { ...prev.desktop, floor: e.target.value },
                    }))
                  }
                  className="w-1/4 border border-gray-300 rounded-md p-2"
                />
                <input
                  type="text"
                  placeholder="Path"
                  value={pathInput.desktop.path}
                  onChange={(e) =>
                    setPathInput((prev) => ({
                      ...prev,
                      desktop: { ...prev.desktop, path: e.target.value },
                    }))
                  }
                  className="w-2/3 border border-gray-300 rounded-md p-2"
                />
                <button
                  type="button"
                  onClick={() => handleAddPath("desktop")}
                  className="bg-blue-500 text-white rounded-md px-3 hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {renderPathList("desktop")}
            </div>

            {/* Mobile Paths */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Mobile Paths
              </h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Floor"
                  value={pathInput.mobile.floor}
                  onChange={(e) =>
                    setPathInput((prev) => ({
                      ...prev,
                      mobile: { ...prev.mobile, floor: e.target.value },
                    }))
                  }
                  className="w-1/4 border border-gray-300 rounded-md p-2"
                />
                <input
                  type="text"
                  placeholder="Path"
                  value={pathInput.mobile.path}
                  onChange={(e) =>
                    setPathInput((prev) => ({
                      ...prev,
                      mobile: { ...prev.mobile, path: e.target.value },
                    }))
                  }
                  className="w-2/3 border border-gray-300 rounded-md p-2"
                />
                <button
                  type="button"
                  onClick={() => handleAddPath("mobile")}
                  className="bg-blue-500 text-white rounded-md px-3 hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {renderPathList("mobile")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Desktop Image {editPlan && "(Optional)"}
              </label>
              <input
                type="file"
                name="desktop_image"
                accept="image/*"
                onChange={handleInputChange}
                className="mt-1 block w-full"
              />
              {editPlan?.desktop_image_url && (
                <img
                  src={editPlan.desktop_image_url}
                  alt="Current desktop image"
                  className="mt-2 h-24 object-cover rounded"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mobile Image {editPlan && "(Optional)"}
              </label>
              <input
                type="file"
                name="mobile_image"
                accept="image/*"
                onChange={handleInputChange}
                className="mt-1 block w-full"
              />
              {editPlan?.mobile_image_url && (
                <img
                  src={editPlan.mobile_image_url}
                  alt="Current mobile image"
                  className="mt-2 h-24 object-cover rounded"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {editPlan ? "Update Floor Plan" : "Create Floor Plan"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FloorPlanForm;
