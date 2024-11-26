import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Camera } from "lucide-react";

interface Apartment {
  floor_plan_id: number;
  flat_id: number;
  flat_number: number;
  status: string;
  square_meters: number;
  image?: string;
}

interface Floor {
  floor: number;
  apartments: Apartment[];
}

interface FloorPlan {
  floor_plan_id: number;
  name: string;
  apartments: Floor[];
}

interface ApartmentsListProps {
  buildingId: number;
}

const ApartmentsList = ({ buildingId }: ApartmentsListProps) => {
  const [apartmentsData, setApartmentsData] = useState<FloorPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null
  );

  // State for update form
  const [squareMeters, setSquareMeters] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const getApartments = async () => {
      try {
        const response = await axiosInstance.get(`/apartments/${buildingId}`);
        const apartmentData = response.data.apartments;
        setApartmentsData(apartmentData);
      } catch (error) {
        setError("Error fetching apartments.");
      }
    };

    if (buildingId) {
      getApartments();
    }
  }, [buildingId]);

  const openUpdateDialog = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setSquareMeters(apartment.square_meters.toString());
    setImageFile(null);
    setUpdateError(null);
    setSuccessMessage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    if (!selectedApartment) return;

    // Validate input
    if (!squareMeters) {
      setUpdateError("Square meters is required.");
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Append required fields
      formData.append(
        "floor_plan_id",
        selectedApartment.floor_plan_id.toString()
      );
      formData.append("flat_id", selectedApartment.flat_id.toString());
      formData.append("square_meters", squareMeters);

      // Append image if selected
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Send update request
      const response = await axiosInstance.put(
        "/update-shared-properties",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response);

      // Update local state
      setSuccessMessage("Apartment updated successfully!");

      // Update the state to reflect the changes
      const updatedApartment = response.data.updatedApartments[0];

      const updatedData = apartmentsData.map((floorPlan) => ({
        ...floorPlan,
        apartments: floorPlan.apartments.map((floor) => ({
          ...floor,
          apartments: floor.apartments.map((apt) =>
            apt.flat_id === updatedApartment.flat_id
              ? { ...apt, ...updatedApartment }
              : apt
          ),
        })),
      }));

      setApartmentsData(updatedData);

      // Reset form state
      setSelectedApartment(null);
      setSquareMeters("");
      setImageFile(null);
    } catch (error: any) {
      console.log(error);
      setUpdateError(
        error.response?.data?.error ||
          "An error occurred while updating the apartment."
      );
    }
  };

  console.log(apartmentsData);

  return (
    <div className="p-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {apartmentsData.map((floorPlan) => (
        <div key={floorPlan.floor_plan_id} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{floorPlan.name}</h2>

          {floorPlan.apartments.map((floor) => (
            <div key={floor.floor} className="mb-6">
              <h3 className="text-xl mb-2">Floor {floor.floor}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {floor.apartments.map((apartment) => (
                  <div
                    key={apartment.flat_id}
                    className="p-4 border rounded shadow relative"
                  >
                    {apartment.image && (
                      <img
                        src={`http://localhost:3000${apartment.image}`}
                        alt={`Apartment ${apartment.flat_number}`}
                        className="w-full h-40 object-cover mb-4 rounded"
                      />
                    )}
                    <h4 className="font-semibold">
                      Apartment {apartment.flat_number}
                    </h4>
                    <p>Status: {apartment.status}</p>
                    <p>Square Meters: {apartment.square_meters}</p>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => openUpdateDialog(apartment)}
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Update Apartment {apartment.flat_number}
                          </DialogTitle>
                        </DialogHeader>

                        {updateError && (
                          <Alert variant="destructive">
                            <AlertDescription>{updateError}</AlertDescription>
                          </Alert>
                        )}

                        {successMessage && (
                          <Alert variant="default">
                            <AlertDescription>
                              {successMessage}
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-4">
                          <div>
                            <label className="block mb-2">Square Meters</label>
                            <Input
                              type="number"
                              value={squareMeters}
                              onChange={(e) => setSquareMeters(e.target.value)}
                              placeholder="Enter square meters"
                            />
                          </div>

                          <div>
                            <label className="block mb-2">
                              Apartment Image
                            </label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                            {imageFile && (
                              <p className="text-sm text-gray-500 mt-2">
                                {imageFile.name}
                              </p>
                            )}
                          </div>

                          <Button onClick={handleUpdate} className="w-full">
                            Update Apartment
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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
