export const PERMISSION_ACTIONS = [
  "add",
  "edit",
  "view",
  "delete",
  "printExcel",
  "printPdf",
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export type PermissionModuleNode = {
  key: string;
  labelKey: string;
  children?: PermissionModuleNode[];
};

/** Application modules and sub-modules for the role permission matrix. */
export const permissionModuleTree: PermissionModuleNode[] = [
  { key: "dashboard", labelKey: "permissions.modules.dashboard" },
  {
    key: "customers",
    labelKey: "permissions.modules.customers",
    children: [
      { key: "customers.list", labelKey: "permissions.modules.customersList" },
      { key: "customers.groups", labelKey: "permissions.modules.customerGroups" },
    ],
  },
  {
    key: "financing",
    labelKey: "permissions.modules.financing",
    children: [
      { key: "financing.chartOfAccounts", labelKey: "financing.nav.chartOfAccounts" },
    ],
  },
  {
    key: "settings",
    labelKey: "permissions.modules.settings",
    children: [
      { key: "settings.company", labelKey: "settings.nav.company" },
      { key: "settings.currencies", labelKey: "settings.nav.currencies" },
      { key: "settings.financialYear", labelKey: "settings.nav.financialYear" },
      { key: "settings.expenseCategories", labelKey: "settings.nav.expenseCategories" },
      { key: "settings.autocode", labelKey: "settings.nav.autocode" },
      { key: "settings.interest", labelKey: "settings.nav.interest" },
      { key: "settings.loans", labelKey: "settings.nav.loans" },
      { key: "settings.penalties", labelKey: "settings.nav.penalties" },
      { key: "settings.classification", labelKey: "settings.nav.classification" },
      { key: "settings.notifications", labelKey: "settings.nav.notifications" },
      { key: "settings.branches", labelKey: "settings.nav.branches" },
      { key: "settings.users", labelKey: "settings.nav.users" },
      { key: "settings.roles", labelKey: "settings.nav.roles" },
    ],
  },
];

export type PermissionFlags = {
  canAdd: boolean;
  canEdit: boolean;
  canView: boolean;
  canDelete: boolean;
  canPrintExcel: boolean;
  canPrintPdf: boolean;
};

export const emptyPermissionFlags = (): PermissionFlags => ({
  canAdd: false,
  canEdit: false,
  canView: false,
  canDelete: false,
  canPrintExcel: false,
  canPrintPdf: false,
});

export function getLeafResourceKeys(nodes: PermissionModuleNode[] = permissionModuleTree): string[] {
  const keys: string[] = [];
  for (const node of nodes) {
    if (node.children?.length) {
      keys.push(...getLeafResourceKeys(node.children));
    } else {
      keys.push(node.key);
    }
  }
  return keys;
}

function findModuleNode(
  nodeKey: string,
  nodes: PermissionModuleNode[] = permissionModuleTree,
): PermissionModuleNode | undefined {
  for (const node of nodes) {
    if (node.key === nodeKey) return node;
    if (node.children?.length) {
      const found = findModuleNode(nodeKey, node.children);
      if (found) return found;
    }
  }
  return undefined;
}

/** Leaf resource keys under a module or sub-module node (includes the node itself when it is a leaf). */
export function getDescendantLeafKeys(
  nodeKey: string,
  nodes: PermissionModuleNode[] = permissionModuleTree,
): string[] {
  const node = findModuleNode(nodeKey, nodes);
  if (!node) return [];
  if (!node.children?.length) return [node.key];
  return getLeafResourceKeys(node.children);
}

export function isValidResourceKey(key: string): boolean {
  return getLeafResourceKeys().includes(key);
}

export type PermissionMatrixRow = {
  key: string;
  labelKey: string;
  depth: number;
  hasChildren: boolean;
  isLeaf: boolean;
};

export function buildPermissionMatrixRows(
  expandedKeys: Set<string>,
  nodes: PermissionModuleNode[] = permissionModuleTree,
  depth = 0,
): PermissionMatrixRow[] {
  const rows: PermissionMatrixRow[] = [];
  for (const node of nodes) {
    const hasChildren = Boolean(node.children?.length);
    const isLeaf = !hasChildren;
    rows.push({ key: node.key, labelKey: node.labelKey, depth, hasChildren, isLeaf });
    if (hasChildren && expandedKeys.has(node.key)) {
      rows.push(...buildPermissionMatrixRows(expandedKeys, node.children, depth + 1));
    }
  }
  return rows;
}

export function allPermissionFlagsTrue(): PermissionFlags {
  return {
    canAdd: true,
    canEdit: true,
    canView: true,
    canDelete: true,
    canPrintExcel: true,
    canPrintPdf: true,
  };
}

export function viewerPermissionFlags(): PermissionFlags {
  return {
    canAdd: false,
    canEdit: false,
    canView: true,
    canDelete: false,
    canPrintExcel: true,
    canPrintPdf: true,
  };
}

export function loanOfficerPermissionFlags(): PermissionFlags {
  return {
    canAdd: true,
    canEdit: true,
    canView: true,
    canDelete: false,
    canPrintExcel: true,
    canPrintPdf: true,
  };
}
