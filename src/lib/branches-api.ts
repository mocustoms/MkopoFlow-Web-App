import type { BranchInput } from "@mkopoflow/shared";
import { apiDelete, apiGet, apiPostAuth, apiPut } from "./api";

const BASE = "/api/v1/branches";

export type Branch = BranchInput & {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

export const branchesApi = {
  list: (token: string) => apiGet<Branch[]>(BASE, token),
  create: (token: string, body: BranchInput) => apiPostAuth<Branch>(BASE, token, body),
  update: (token: string, id: string, body: BranchInput) =>
    apiPut<Branch>(`${BASE}/${id}`, token, body),
  remove: (token: string, id: string) => apiDelete(`${BASE}/${id}`, token),
};
