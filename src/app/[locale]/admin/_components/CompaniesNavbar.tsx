"use client";

import { useState } from "react";
import { Factory, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios, { AxiosError } from "axios";
import { CompanyTypes } from "@/types/types";
import { useCustomToast } from "@/components/shared/popups/ToastMessage";

const CompaniesNavbar = ({ companies }: CompanyTypes) => {
  const [companiesData, setCompaniesData] = useState(companies);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [editingCompany, setEditingCompany] = useState(null);
  const [editName, setEditName] = useState("");
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const handleAddCompany = async () => {
    try {
      const newCompany = { name: newCompanyName.trim() };
      const response = await axios.post(
        "http://localhost:3000/api/create-company",
        newCompany
      );

      if (response.data.status === "SUCCESS") {
        setCompaniesData((prevCompaniesData) => [
          ...prevCompaniesData,
          {
            id: response.data.id,
            name: newCompanyName.trim(),
          },
        ]);
        setNewCompanyName("");
        setIsAddingCompany(false);
        showSuccessToast("Success", "Company has been successfully added");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      switch (axiosError.response?.data?.error) {
        case "COMPANY_EXIST":
          showErrorToast("Exist", "Company Exist");
          break;

        case "VALIDATION_ERROR":
          showErrorToast("Error", "Failed to add company");
          break;
        default:
          showErrorToast("Error", "Failed to add company");
      }
    }
  };

  const handleEditCompany = (companyId) => {
    const company = companies.find((c) => c.id === companyId);
    setEditingCompany(companyId);
    setEditName(company.name);
  };

  const handleUpdateCompany = () => {
    if (editName.trim()) {
      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company.id === editingCompany
            ? { ...company, name: editName.trim() }
            : company
        )
      );
      setEditingCompany(null);
      setEditName("");
    }
  };
  const handleDeleteCompany = async (companyId: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/companies/${companyId}`
      );

      setCompaniesData((prevCompaniesData) =>
        prevCompaniesData.filter((company) => company.id !== companyId)
      );
      showSuccessToast("Success", "Company has been successfully deleted");
    } catch (error) {
      showErrorToast("Error", "An error occurred while deleting the company");
    }
  };

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg mb-4">Companies</h2>
        {isAddingCompany ? (
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Company name"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                className="w-1/2"
                onClick={handleAddCompany}
                disabled={!newCompanyName.trim()}
              >
                Add
              </Button>
              <Button
                className="w-1/2"
                variant="outline"
                onClick={() => {
                  setIsAddingCompany(false);
                  setNewCompanyName("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => setIsAddingCompany(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {companiesData.map((item, index) => (
          <div
            key={index} // Use item.id for unique keys
            className="group flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            {editingCompany === item.id ? (
              <div className="flex items-center gap-2 w-full bg-white shadow-sm rounded-md p-2 border">
                <Factory className="h-4 w-4 text-gray-500 ml-1" />
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-green-50"
                    onClick={handleUpdateCompany}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-red-50"
                    onClick={() => setEditingCompany(null)}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 w-full">
                  <Factory className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-gray-200"
                    onClick={() => handleEditCompany(item.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-red-50"
                    onClick={() => handleDeleteCompany(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompaniesNavbar;
