/** Placeholder metrics until loan/customer APIs exist — aligned with project.md modules. */

export type DashboardStats = {
  customers: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  loans: {
    active: number;
    disbursedThisMonth: number;
    outstandingPrincipal: number;
    pendingApplications: number;
  };
  financial: {
    interestEarned: number;
    penaltiesCollected: number;
    expensesThisMonth: number;
    netProfit: number;
  };
  collections: {
    dueToday: number;
    overdue: number;
    recoveryRate: number;
    expectedVsActual: number;
  };
  portfolioHealth: {
    current: number;
    watch: number;
    subStandard: number;
    doubtful: number;
    loss: number;
  };
  pendingReviews: {
    newCustomers: number;
    loansAwaitingApproval: number;
    overdueFollowUps: number;
  };
  systemActivity: {
    activeLoanOfficers: number;
    repaymentsToday: number;
    systemHealth: number;
  };
};

export function getDashboardStats(): DashboardStats {
  return {
    customers: { total: 248, active: 231, newThisMonth: 18 },
    loans: {
      active: 186,
      disbursedThisMonth: 42,
      outstandingPrincipal: 24_500_000,
      pendingApplications: 12,
    },
    financial: {
      interestEarned: 3_840_000,
      penaltiesCollected: 128_500,
      expensesThisMonth: 245_000,
      netProfit: 3_723_500,
    },
    collections: {
      dueToday: 23,
      overdue: 14,
      recoveryRate: 94.2,
      expectedVsActual: 91.8,
    },
    portfolioHealth: {
      current: 152,
      watch: 18,
      subStandard: 9,
      doubtful: 5,
      loss: 2,
    },
    pendingReviews: {
      newCustomers: 8,
      loansAwaitingApproval: 12,
      overdueFollowUps: 14,
    },
    systemActivity: {
      activeLoanOfficers: 4,
      repaymentsToday: 31,
      systemHealth: 99.8,
    },
  };
}
