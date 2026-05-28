import type {
  AutocodeModule,
  AutocodeRuleInput,
  ChartOfAccountInput,
  ClassificationRuleInput,
  CompanySettingsInput,
  FinancialYearInput,
  CurrencyInput,
  CustomerCategoryInput,
  ExpenseCategoryInput,
  InterestSettingsInput,
  LoanTypeInput,
  NotificationSettingsInput,
  PenaltySettingsInput,
  RolePermissionEntryInput,
  TenantRoleInput,
} from "@mkopoflow/shared";
import { apiDelete, apiGet, apiPostAuth, apiPut } from "./api";

const BASE = "/api/v1/settings";

export type CompanySettings = CompanySettingsInput & {
  slug: string;
  defaultCurrencyLabel: string;
};

export type FinancialYear = FinancialYearInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type TenantCurrency = CurrencyInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseCategory = ExpenseCategoryInput & {
  id: string;
  code: string;
  expenseAccountLabel: string;
  liabilityAccountLabel: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerCategory = CustomerCategoryInput & {
  id: string;
  receivableAccountLabel: string;
  liabilityAccountLabel: string;
  createdAt: string;
  updatedAt: string;
};

export type InterestSettings = InterestSettingsInput;

export type LoanType = LoanTypeInput & {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

export type PenaltySettings = PenaltySettingsInput;

export type ClassificationRule = ClassificationRuleInput & { id: string };

export type NotificationSettings = NotificationSettingsInput;

export type ChartOfAccount = ChartOfAccountInput & {
  id: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AutocodeRule = AutocodeRuleInput & {
  id: string;
  module: AutocodeModule;
  preview: string;
  updatedAt: string;
};

export type UserBranchRef = {
  id: string;
  code: string;
  name: string;
};

export type TenantRole = TenantRoleInput & {
  id: string;
  isSystem: boolean;
  permissions: RolePermissionEntryInput[];
  createdAt: string;
  updatedAt: string;
};

export type TenantUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  tenantRoleId: string | null;
  tenantRole: { id: string; code: string; name: string } | null;
  branchIds: string[];
  branches: UserBranchRef[];
};

export const settingsApi = {
  company: {
    get: (token: string) => apiGet<CompanySettings>(`${BASE}/company`, token),
    update: (token: string, body: CompanySettingsInput) =>
      apiPut<CompanySettings>(`${BASE}/company`, token, body),
  },
  financialYear: {
    list: (token: string) => apiGet<FinancialYear[]>(`${BASE}/financial-year`, token),
    create: (token: string, body: FinancialYearInput) =>
      apiPostAuth<FinancialYear>(`${BASE}/financial-year`, token, body),
    update: (token: string, id: string, body: FinancialYearInput) =>
      apiPut<FinancialYear>(`${BASE}/financial-year/${id}`, token, body),
    remove: (token: string, id: string) => apiDelete(`${BASE}/financial-year/${id}`, token),
  },
  currencies: {
    list: (token: string) => apiGet<TenantCurrency[]>(`${BASE}/currencies`, token),
    create: (token: string, body: CurrencyInput) =>
      apiPostAuth<TenantCurrency>(`${BASE}/currencies`, token, body),
    update: (token: string, id: string, body: CurrencyInput) =>
      apiPut<TenantCurrency>(`${BASE}/currencies/${id}`, token, body),
    remove: (token: string, id: string) => apiDelete(`${BASE}/currencies/${id}`, token),
  },
  customerCategories: {
    list: (token: string) => apiGet<CustomerCategory[]>(`${BASE}/customer-categories`, token),
    create: (token: string, body: CustomerCategoryInput) =>
      apiPostAuth<CustomerCategory>(`${BASE}/customer-categories`, token, body),
    update: (token: string, id: string, body: CustomerCategoryInput) =>
      apiPut<CustomerCategory>(`${BASE}/customer-categories/${id}`, token, body),
    remove: (token: string, id: string) =>
      apiDelete(`${BASE}/customer-categories/${id}`, token),
  },
  expenseCategories: {
    list: (token: string) => apiGet<ExpenseCategory[]>(`${BASE}/expense-categories`, token),
    create: (token: string, body: ExpenseCategoryInput) =>
      apiPostAuth<ExpenseCategory>(`${BASE}/expense-categories`, token, body),
    update: (token: string, id: string, body: ExpenseCategoryInput) =>
      apiPut<ExpenseCategory>(`${BASE}/expense-categories/${id}`, token, body),
    remove: (token: string, id: string) =>
      apiDelete(`${BASE}/expense-categories/${id}`, token),
  },
  interest: {
    get: (token: string) => apiGet<InterestSettings>(`${BASE}/interest`, token),
    update: (token: string, body: InterestSettingsInput) =>
      apiPut<InterestSettings>(`${BASE}/interest`, token, body),
  },
  loanTypes: {
    list: (token: string) => apiGet<LoanType[]>(`${BASE}/loan-types`, token),
    create: (token: string, body: LoanTypeInput) =>
      apiPostAuth<LoanType>(`${BASE}/loan-types`, token, body),
    update: (token: string, id: string, body: LoanTypeInput) =>
      apiPut<LoanType>(`${BASE}/loan-types/${id}`, token, body),
    remove: (token: string, id: string) => apiDelete(`${BASE}/loan-types/${id}`, token),
  },
  penalties: {
    get: (token: string) => apiGet<PenaltySettings>(`${BASE}/penalties`, token),
    update: (token: string, body: PenaltySettingsInput) =>
      apiPut<PenaltySettings>(`${BASE}/penalties`, token, body),
  },
  classification: {
    list: (token: string) => apiGet<ClassificationRule[]>(`${BASE}/classification`, token),
    replace: (token: string, body: ClassificationRuleInput[]) =>
      apiPut<ClassificationRule[]>(`${BASE}/classification`, token, body),
  },
  notifications: {
    get: (token: string) => apiGet<NotificationSettings>(`${BASE}/notifications`, token),
    update: (token: string, body: NotificationSettingsInput) =>
      apiPut<NotificationSettings>(`${BASE}/notifications`, token, body),
  },
  chartOfAccounts: {
    list: (token: string) => apiGet<ChartOfAccount[]>(`${BASE}/chart-of-accounts`, token),
    create: (token: string, body: ChartOfAccountInput) =>
      apiPostAuth<ChartOfAccount>(`${BASE}/chart-of-accounts`, token, body),
    update: (token: string, id: string, body: ChartOfAccountInput) =>
      apiPut<ChartOfAccount>(`${BASE}/chart-of-accounts/${id}`, token, body),
  },
  autocode: {
    list: (token: string) => apiGet<AutocodeRule[]>(`${BASE}/autocode`, token),
    update: (token: string, module: AutocodeModule, body: AutocodeRuleInput) =>
      apiPut<AutocodeRule>(`${BASE}/autocode/${module}`, token, body),
  },
  roles: {
    list: (token: string) => apiGet<TenantRole[]>(`${BASE}/roles`, token),
    get: (token: string, id: string) => apiGet<TenantRole>(`${BASE}/roles/${id}`, token),
    create: (token: string, body: TenantRoleInput) =>
      apiPostAuth<TenantRole>(`${BASE}/roles`, token, body),
    update: (token: string, id: string, body: TenantRoleInput) =>
      apiPut<TenantRole>(`${BASE}/roles/${id}`, token, body),
    remove: (token: string, id: string) => apiDelete(`${BASE}/roles/${id}`, token),
  },
  users: {
    list: (token: string) => apiGet<TenantUser[]>(`${BASE}/users`, token),
    updateBranches: (token: string, userId: string, branchIds: string[]) =>
      apiPut<TenantUser>(`${BASE}/users/${userId}/branches`, token, { branchIds }),
    updateRole: (token: string, userId: string, tenantRoleId: string | null) =>
      apiPut<TenantUser>(`${BASE}/users/${userId}/role`, token, { tenantRoleId }),
  },
};
