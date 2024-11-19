"use client"
import Image from "next/image";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

export default function Testing() {
  const [hoveredArea, setHoveredArea] = useState<number | null>(null);
  const [buildingData, setBuildingData] = useState<any | null>(null);

  const getBuildings = async () => {
    try {
      const response = await axiosInstance.get(`/buildings/1`);
      setBuildingData(response.data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
    }
  };

  useEffect(() => {
    getBuildings()
  }, []);

  // Helper function to convert coords string to points for polygon
  const coordsToPolygonPoints = (coords: string) => {
    const points = coords.split(',').map(Number);
    let result = '';
    for (let i = 0; i < points.length; i += 2) {
      result += `${points[i]}px ${points[i + 1]}px${i < points.length - 2 ? ',' : ''}`;
    }
    return result;
  };

  if (!buildingData) return null;

  // Create areas data from desktop paths
  const areasData = Object.entries(buildingData.desktop_paths)
    .filter(([key]) => key !== '[[Prototype]]')
    .map(([key, coords]) => ({
      id: parseInt(key),
      coords: coords as string
    }));

  return (
    <div className="relative inline-block">
      <img
        src={`http://localhost:3000/${buildingData.desktop_image}`}
        alt={buildingData.name}
        width={796}
        height={900}
        useMap="#image-map"
        className="max-w-full h-auto"
      />
      
      <map name="image-map">
        {areasData.map((area) => (
          <area
            key={area.id}
            target=""
            href=""
            coords={area.coords}
            shape="poly"
            onMouseEnter={() => setHoveredArea(area.id)}
            onMouseLeave={() => setHoveredArea(null)}
          />
        ))}
      </map>

      {hoveredArea && (
        areasData
          .filter((area) => area.id === hoveredArea)
          .map((area) => (
            <div
              key={area.id}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{
                backgroundColor: "rgba(173, 216, 230, 0.5)",
                clipPath: `polygon(${coordsToPolygonPoints(area.coords)})`,
              }}
            />
          ))
      )}
    </div>
  );
}