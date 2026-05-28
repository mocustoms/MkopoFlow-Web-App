import { Button } from "@heroui/react";
import { SettingsTextField } from "../components/settings/settings-fields";
import { joinCompanySchema } from "@mkopoflow/shared";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout, AuthLink } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/LanguageContext";
import { useAppToast } from "../hooks/useAppToast";
import { authPost } from "../lib/api";

export function JoinCompanyPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const { t } = useTranslation();
  const [companySlug, setCompanySlug] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const appToast = useAppToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = joinCompanySchema.safeParse({
      companySlug,
      name,
      email,
      password,
    });
    if (!parsed.success) {
      appToast.error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      return;
    }

    setLoading(true);
    try {
      const auth = await authPost("/api/v1/auth/join-company", parsed.data);
      setAuth(auth);
      navigate("/", { replace: true });
    } catch (err) {
      appToast.error(err instanceof Error ? err.message : t("auth.registrationFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={t("auth.joinCompany")}
      subtitle={t("auth.joinCompanySubtitle")}
      footer={
        <p className="fiscal-label text-center text-sm">
          {t("auth.startingNewCompany")}{" "}
          <AuthLink to="/create-account">{t("auth.createAccount")}</AuthLink>
        </p>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <SettingsTextField
          id="companySlug"
          label={t("auth.companyCode")}
          placeholder={t("auth.companyCodePlaceholder")}
          value={companySlug}
          onChange={(e) => setCompanySlug(e.target.value)}
          autoCapitalize="none"
        />
        <SettingsTextField
          id="name"
          label={t("auth.fullName")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <SettingsTextField
          id="email"
          label={t("common.email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <SettingsTextField
          id="password"
          label={t("common.password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="primary" fullWidth isDisabled={loading}>
          {loading ? t("auth.joining") : t("auth.joinCompanyButton")}
        </Button>
      </form>
    </AuthLayout>
  );
}
