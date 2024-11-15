import CompaniesNavbar from "./_components/companies/CompanyNavBar";
import { Toaster } from "@/components/ui/toaster";
 
import axiosInstance from "@/utils/axiosInstance";
import { CompanyTypes } from "@/types/types";
import BuildingsList from "./_components/buildings/BuildingList";

async function getCompanies() {
  try {
    const response = await axiosInstance.get<CompanyTypes[]>("/companies");
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}

export default async function Page() {
  const companies = await getCompanies();

  return (
    <main className="w-full relative flex flex-row">
      <Toaster />
      <CompaniesNavbar companies={companies} />
      <BuildingsList />
    </main>
  );
}
