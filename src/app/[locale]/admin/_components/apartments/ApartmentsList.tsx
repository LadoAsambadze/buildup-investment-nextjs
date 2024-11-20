import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";

interface ApartmentsListProps {
  buildingId: number;
}

const ApartmentsList = ({ buildingId }: ApartmentsListProps) => {
  const [apartmentsData, setApartmentsData] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getApartments = async () => {
      try {
        const response = await axiosInstance.get(`/apartments/${buildingId}`);
        const apartmentData = response.data.apartments;
        console.log(response);
        setApartmentsData(apartmentData);
      } catch (error) {
        setError("Error fetching apartments.");
      }
    };

    if (buildingId) {
      getApartments();
    }
  }, [buildingId]);

  return (
    <div className="p-4">
      {error && <p className="text-red-600">{error}</p>}
      {apartmentsData.map((floorPlan: any) => (
        <div key={floorPlan.floor_plan_id} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{floorPlan.name}</h2>
          {floorPlan.apartments.map((floor: any) => (
            <div key={floor.floor} className="mb-6">
              <h3 className="text-xl mb-2">Floor {floor.floor}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {floor.apartments.map((apartment: any) => (
                  <div
                    key={apartment.flat_id}
                    className="p-4 border rounded shadow"
                  >
                    <h4 className="font-semibold">
                      Apartment {apartment.flat_number}
                    </h4>
                    <p>Status: {apartment.status}</p>
                    <p>Square Meters: {apartment.square_meters}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ApartmentsList;
