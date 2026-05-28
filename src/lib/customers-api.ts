import type { CustomerInput } from "@mkopoflow/shared";
import { apiDelete, apiGet, apiPostAuth, apiPut } from "./api";

const BASE = "/api/v1/customers";

export type Customer = CustomerInput & {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

export const customersApi = {
  list: (token: string) => apiGet<Customer[]>(BASE, token),
  create: (token: string, body: CustomerInput) => apiPostAuth<Customer>(BASE, token, body),
  update: (token: string, id: string, body: CustomerInput) =>
    apiPut<Customer>(`${BASE}/${id}`, token, body),
  remove: (token: string, id: string) => apiDelete(`${BASE}/${id}`, token),
};
