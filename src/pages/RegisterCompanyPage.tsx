import { Button } from "@heroui/react";
import { SettingsTextField } from "../components/settings/settings-fields";
import { registerCompanySchema } from "@mkopoflow/shared";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/LanguageContext";
import { useAppToast } from "../hooks/useAppToast";
import { authPostWithToken } from "../lib/api";

function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function RegisterCompanyPage() {
  const navigate = useNavigate();
  const { auth, setAuth, logout } = useAuth();
  const { t } = useTranslation();
  const [companyName, setCompanyName] = useState("");
  const [companySlug, setCompanySlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const appToast = useAppToast();
  const [loading, setLoading] = useState(false);

  function handleCompanyNameChange(value: string) {
    setCompanyName(value);
    if (!slugTouched) {
      setCompanySlug(slugFromName(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth?.token) {
      appToast.error(t("auth.sessionExpired"));
      return;
    }

    const parsed = registerCompanySchema.safeParse({ companyName, companySlug });
    if (!parsed.success) {
      appToast.error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      return;
    }

    setLoading(true);
    try {
      const result = await authPostWithToken(
        "/api/v1/auth/register-company",
        parsed.data,
        auth.token,
      );
      setAuth(result);
      navigate("/", { replace: true });
    } catch (err) {
      appToast.error(err instanceof Error ? err.message : t("auth.registrationFailedCompany"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={t("auth.registerCompany")}
      subtitle={t("auth.registerCompanySubtitle", { email: auth?.user.email ?? "" })}
      footer={
        <Button variant="ghost" size="sm" onPress={() => logout()}>
          {t("common.signOut")}
        </Button>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <SettingsTextField
          id="companyName"
          label={t("auth.companyName")}
          placeholder={t("auth.companyNamePlaceholder")}
          value={companyName}
          onChange={(e) => handleCompanyNameChange(e.target.value)}
        />
        <SettingsTextField
          id="companySlug"
          label={t("auth.companyCode")}
          placeholder={t("auth.companyCodePlaceholder")}
          value={companySlug}
          onChange={(e) => {
            setSlugTouched(true);
            setCompanySlug(e.target.value);
          }}
        />
        <Button type="submit" variant="primary" fullWidth isDisabled={loading}>
          {loading ? t("auth.settingUp") : t("auth.completeSetup")}
        </Button>
      </form>
    </AuthLayout>
  );
}
