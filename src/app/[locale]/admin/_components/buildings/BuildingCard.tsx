import React from "react";
import { BuildingTypes } from "@/types/types";

interface BuildingCardProps {
  building: BuildingTypes;
  onFloorTypesClick: () => void;
  onApartmentsClick: () => void;
}

const renderPaths = (paths: Record<string, string>) => (
  <div className="space-y-1">
    {Object.entries(paths).map(([floor, path]) => (
      <div key={floor} className="text-sm">
        <span className="font-medium">Floor {floor}:</span>
        <span className="ml-2 text-gray-600">{path}</span>
      </div>
    ))}
  </div>
);

const BuildingCard: React.FC<BuildingCardProps> = ({ 
  building, 
  onFloorTypesClick, 
  onApartmentsClick 
}) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{building.name}</h3>
            <p className="text-gray-600">{building.address}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onFloorTypesClick}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded"
            >
              Floor Types
            </button>
            <button
              onClick={onApartmentsClick}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded"
            >
              Apartments
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Desktop View</h4>
            {building.desktop_image ? (
              <div className="relative aspect-video">
                <img
                  src={`http://localhost:3000/${building.desktop_image}`}
                  alt={`${building.name} - Desktop View`}
                  className="rounded object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="bg-gray-100 rounded aspect-video flex items-center justify-center">
                <span className="text-gray-500">No desktop image</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Mobile View</h4>
            {building.mobile_image ? (
              <div className="relative aspect-video">
                <img
                  src={`http://localhost:3000/${building.mobile_image}`}
                  alt={`${building.name} - Mobile View`}
                  className="rounded object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="bg-gray-100 rounded aspect-video flex items-center justify-center">
                <span className="text-gray-500">No mobile image</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Desktop Paths</h4>
            {building.desktop_paths && Object.keys(building.desktop_paths).length > 0 ? (
              renderPaths(building.desktop_paths)
            ) : (
              <p className="text-gray-500">No desktop paths</p>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Mobile Paths</h4>
            {building.mobile_paths && Object.keys(building.mobile_paths).length > 0 ? (
              renderPaths(building.mobile_paths)
            ) : (
              <p className="text-gray-500">No mobile paths</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingCard;