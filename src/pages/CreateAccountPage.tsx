import { Button } from "@heroui/react";
import { SettingsTextField } from "../components/settings/settings-fields";
import { registerAccountSchema } from "@mkopoflow/shared";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout, AuthLink } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/LanguageContext";
import { useAppToast } from "../hooks/useAppToast";
import { authPost } from "../lib/api";

export function CreateAccountPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const appToast = useAppToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = registerAccountSchema.safeParse({ name, phone, email, password });
    if (!parsed.success) {
      appToast.error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      return;
    }

    setLoading(true);
    try {
      const auth = await authPost("/api/v1/auth/register", parsed.data);
      setAuth(auth);
      navigate("/register-company", { replace: true });
    } catch (err) {
      appToast.error(err instanceof Error ? err.message : t("auth.registrationFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={t("auth.createAccountTitle")}
      subtitle={t("auth.createAccountSubtitle")}
      footer={
        <p className="fiscal-label text-center text-sm">
          {t("auth.alreadyHaveAccount")} <AuthLink to="/login">{t("auth.signIn")}</AuthLink>
        </p>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <SettingsTextField
          id="name"
          label={t("auth.fullName")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <SettingsTextField
          id="phone"
          label={t("common.phone")}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
        <SettingsTextField
          id="email"
          label={t("common.email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <SettingsTextField
          id="password"
          label={t("common.password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Button type="submit" variant="primary" fullWidth isDisabled={loading}>
          {loading ? t("auth.creatingAccount") : t("auth.continue")}
        </Button>
      </form>
    </AuthLayout>
  );
}
