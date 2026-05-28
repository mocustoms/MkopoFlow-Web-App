import { Alert, Card, Description, ProgressBar } from "@heroui/react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiscalChip } from "../components/fiscal/FiscalChip";
import { MetricCard } from "../components/dashboard/MetricCard";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/LanguageContext";
import { getDashboardStats } from "../lib/dashboard-stats";
import { fiscal } from "../lib/fiscal";
import { formatKES, formatPercent } from "../lib/format";
import { DashboardLayout } from "../layouts/DashboardLayout";

const cardClass = "border border-border-fiscal shadow-none";

function ActivityBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: "success" | "accent" | "warning";
}) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm">
        <span className="fiscal-label">{label}</span>
        <span className={`${fiscal.figure} text-sm`}>{value.toLocaleString()}</span>
      </div>
      <ProgressBar value={percent} maxValue={100} color={color} size="sm">
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
    </div>
  );
}

function StatRow({
  label,
  count,
  variant,
  percent,
}: {
  label: string;
  count: number;
  variant: "success" | "alert" | "accent";
  percent: string;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border-fiscal py-2.5 text-sm last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="fiscal-label">{label}</span>
      <FiscalChip variant={variant}>
        {count} · {percent}
      </FiscalChip>
    </div>
  );
}

export function DashboardPage() {
  const { auth, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const stats = useMemo(() => getDashboardStats(), []);

  const companyName = auth?.tenant?.name ?? t("dashboard.yourCompany");
  const totalPortfolio =
    stats.portfolioHealth.current +
    stats.portfolioHealth.watch +
    stats.portfolioHealth.subStandard +
    stats.portfolioHealth.doubtful +
    stats.portfolioHealth.loss;

  function handleSignOut() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <DashboardLayout onSignOut={handleSignOut}>
      <div className="flex flex-col gap-4 sm:gap-6">
        <div>
          <h1 className="fiscal-heading text-xl sm:text-2xl">{t("dashboard.title")}</h1>
          <Description className="fiscal-label mt-1 text-sm sm:text-base">
            {t("dashboard.subtitle", { company: companyName })}
          </Description>
        </div>

        <Alert status="warning" className="border border-border-fiscal shadow-none">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title className="fiscal-heading text-sm">{t("dashboard.sampleDataTitle")}</Alert.Title>
            <Alert.Description className="fiscal-label">
              {t("dashboard.sampleDataDesc")}
            </Alert.Description>
          </Alert.Content>
        </Alert>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title={t("dashboard.customers")}
            rows={[
              {
                label: t("dashboard.totalRegistered"),
                value: stats.customers.total.toLocaleString(),
                highlight: "success",
              },
              {
                label: t("dashboard.activeBorrowers"),
                value: stats.customers.active.toLocaleString(),
                highlight: "success",
              },
              {
                label: t("dashboard.newThisMonth"),
                value: `+${stats.customers.newThisMonth}`,
                highlight: "success",
              },
            ]}
          />
          <MetricCard
            title={t("dashboard.loans")}
            rows={[
              {
                label: t("dashboard.activeLoans"),
                value: stats.loans.active.toLocaleString(),
                highlight: "success",
              },
              {
                label: t("dashboard.disbursedThisMonth"),
                value: stats.loans.disbursedThisMonth.toLocaleString(),
                highlight: "success",
              },
              {
                label: t("dashboard.outstandingPrincipal"),
                value: formatKES(stats.loans.outstandingPrincipal),
                highlight: "default",
              },
            ]}
          />
          <MetricCard
            title={t("dashboard.financialOverview")}
            rows={[
              {
                label: t("dashboard.interestEarned"),
                value: formatKES(stats.financial.interestEarned),
                highlight: "success",
              },
              {
                label: t("dashboard.expensesMonth"),
                value: formatKES(stats.financial.expensesThisMonth),
                highlight: "alert",
              },
              {
                label: t("dashboard.netProfit"),
                value: formatKES(stats.financial.netProfit),
                highlight: "success",
              },
            ]}
          />
          <MetricCard
            title={t("dashboard.collectionsToday")}
            rows={[
              {
                label: t("dashboard.dueToday"),
                value: stats.collections.dueToday.toLocaleString(),
                highlight: "alert",
              },
              {
                label: t("dashboard.overdue"),
                value: stats.collections.overdue.toLocaleString(),
                highlight: "alert",
              },
              {
                label: t("dashboard.recoveryRate"),
                value: formatPercent(stats.collections.recoveryRate),
                highlight: "success",
              },
            ]}
            footer={
              <Description className="fiscal-label">
                {t("dashboard.expectedVsActual", {
                  value: formatPercent(stats.collections.expectedVsActual),
                })}
              </Description>
            }
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className={cardClass}>
            <Card.Header className="border-b border-border-fiscal">
              <Card.Title className="fiscal-heading text-base">{t("dashboard.pendingReviews")}</Card.Title>
              <Card.Description className="fiscal-label">
                {t("dashboard.pendingReviewsDesc")}
              </Card.Description>
            </Card.Header>
            <Card.Content className="flex flex-col gap-0 px-4 py-2">
              <div className="flex items-center justify-between border-b border-border-fiscal py-3 text-sm">
                <span className="fiscal-label">{t("dashboard.newCustomerProfiles")}</span>
                <FiscalChip variant="accent">{stats.pendingReviews.newCustomers}</FiscalChip>
              </div>
              <div className="flex items-center justify-between border-b border-border-fiscal py-3 text-sm">
                <span className="fiscal-label">{t("dashboard.loansAwaitingApproval")}</span>
                <FiscalChip variant="alert">
                  {stats.pendingReviews.loansAwaitingApproval}
                </FiscalChip>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="fiscal-label">{t("dashboard.overdueFollowUps")}</span>
                <FiscalChip variant="alert">{stats.pendingReviews.overdueFollowUps}</FiscalChip>
              </div>
            </Card.Content>
          </Card>

          <Card className={cardClass}>
            <Card.Header className="border-b border-border-fiscal">
              <Card.Title className="fiscal-heading text-base">{t("dashboard.portfolioHealth")}</Card.Title>
              <Card.Description className="fiscal-label">
                {t("dashboard.portfolioHealthDesc")}
              </Card.Description>
            </Card.Header>
            <Card.Content className="px-4 py-2">
              <StatRow
                label={t("dashboard.classificationCurrent")}
                count={stats.portfolioHealth.current}
                variant="success"
                percent={formatPercent((stats.portfolioHealth.current / totalPortfolio) * 100)}
              />
              <StatRow
                label={t("dashboard.classificationWatch")}
                count={stats.portfolioHealth.watch}
                variant="accent"
                percent={formatPercent((stats.portfolioHealth.watch / totalPortfolio) * 100)}
              />
              <StatRow
                label={t("dashboard.classificationSubStandard")}
                count={stats.portfolioHealth.subStandard}
                variant="alert"
                percent={formatPercent(
                  (stats.portfolioHealth.subStandard / totalPortfolio) * 100,
                )}
              />
              <StatRow
                label={t("dashboard.classificationDoubtful")}
                count={stats.portfolioHealth.doubtful}
                variant="alert"
                percent={formatPercent((stats.portfolioHealth.doubtful / totalPortfolio) * 100)}
              />
              <StatRow
                label={t("dashboard.classificationLoss")}
                count={stats.portfolioHealth.loss}
                variant="alert"
                percent={formatPercent((stats.portfolioHealth.loss / totalPortfolio) * 100)}
              />
            </Card.Content>
          </Card>
        </div>

        <Card className={cardClass}>
          <Card.Header className="border-b border-border-fiscal">
            <Card.Title className="fiscal-heading text-base">{t("dashboard.todaysActivity")}</Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4 px-4 py-4">
            <ActivityBar
              label={t("dashboard.repaymentsRecorded")}
              value={stats.systemActivity.repaymentsToday}
              max={50}
              color="accent"
            />
            <ActivityBar
              label={t("dashboard.activeLoanOfficers")}
              value={stats.systemActivity.activeLoanOfficers}
              max={10}
              color="success"
            />
            <ActivityBar
              label={t("dashboard.loansDueToday")}
              value={stats.collections.dueToday}
              max={40}
              color="warning"
            />
          </Card.Content>
          <Card.Footer className="border-t border-border-fiscal">
            <Description className="fiscal-label">
              {t("dashboard.loansPendingReview", {
                count: stats.loans.pendingApplications,
              })}
            </Description>
          </Card.Footer>
        </Card>
      </div>
    </DashboardLayout>
  );
}
