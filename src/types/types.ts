import { paths } from "./api";

export type CompaniesResponse =
  paths["/companies"]["get"]["responses"]["200"]["content"]["application/json"];

export type CreateCompanyRequest =
  paths["/create-company"]["post"]["requestBody"]["content"]["application/json"];

  
export type CompanyTypes = {
  companies: CompaniesResponse;
};
