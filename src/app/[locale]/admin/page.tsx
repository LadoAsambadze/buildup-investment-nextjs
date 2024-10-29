import axios from "axios";
import CompaniesNavbar from "./_components/CompaniesNavbar";
import { Toaster } from "@/components/ui/toaster";

async function getCompanies() {
  try {
    const response = await axios.get("http://localhost:3000/api/companies");
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}

export default async function Page() {
  const companies = await getCompanies();

  return (
    <main className="w-full relative">
      <Toaster />
      <CompaniesNavbar companies={companies} />
    </main>
  );
}
