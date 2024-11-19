"use client";
import axiosInstance from "@/utils/axiosInstance";
import { useState, useEffect } from "react";

const Test = () => {
  const [buildingList, setBuildingList] = useState(undefined);

  // Function to fetch building data
  const getBuildings = async () => {
    try {
      const response = await axiosInstance.get(`/buildings/10`);
      setBuildingList(response.data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
    }
  };

  useEffect(() => {
    getBuildings();
  }, []); // The effect will run once on mount

  console.log(buildingList);

  // Coordinates for image map
  const coordinates = [
    { coords: "99,899,95,840,307,824,719,842,712,906", shape: "poly", id: "area-1" },
    // Add more areas as needed
  ];

  // Function to convert coordinates to a format usable by CSS clip-path
  const getClipPathPolygon = (coords) => {
    const points = coords.split(',').map(coord => `${coord}px`).join(',');
    return `polygon(${points})`;
  };

  return (
    <main className="w-[1000px] relative ">
      {buildingList && buildingList.desktop_image && (
        <>
          <img
            src={`http://localhost:3000/${buildingList.desktop_image}`}
            alt="Building"
            className="relative"
          />
          {coordinates.map((area, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                clipPath: getClipPathPolygon(area.coords),
                backgroundColor: 'rgba(173, 216, 230, 0)', // Initial state (invisible)
                pointerEvents: 'none',
                zIndex: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(173, 216, 230, 0.6)'; // Light blue on hover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(173, 216, 230, 0)'; // Revert back
              }}
            />
          ))}
        </>
      )}
    </main>
  );
};

export default Test;
