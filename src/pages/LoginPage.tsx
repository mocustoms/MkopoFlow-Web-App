import { Button } from "@heroui/react";
import { SettingsTextField } from "../components/settings/settings-fields";
import { loginSchema } from "@mkopoflow/shared";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout, AuthLink } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/LanguageContext";
import { useAppToast } from "../hooks/useAppToast";
import { authPost } from "../lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const { t } = useTranslation();
  const appToast = useAppToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      appToast.error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      return;
    }

    setLoading(true);
    try {
      const auth = await authPost("/api/v1/auth/login", parsed.data);
      setAuth(auth);
      navigate(auth.needsCompanyRegistration ? "/register-company" : "/", { replace: true });
    } catch (err) {
      appToast.error(err instanceof Error ? err.message : t("auth.signInFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={t("auth.signIn")}
      subtitle={t("auth.welcomeBack")}
      footer={
        <>
          <p className="fiscal-label text-center text-sm">
            {t("auth.newHere")} <AuthLink to="/create-account">{t("auth.createAccount")}</AuthLink>
          </p>
          <p className="fiscal-label text-center text-sm">
            {t("auth.joiningTeam")}{" "}
            <AuthLink to="/join-company">{t("auth.joinWithCode")}</AuthLink>
          </p>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <SettingsTextField
          id="email"
          label={t("common.email")}
          type="email"
          placeholder="you@example.com"
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
          autoComplete="current-password"
        />
        <Button type="submit" variant="primary" fullWidth isDisabled={loading}>
          {loading ? t("auth.signingIn") : t("auth.signIn")}
        </Button>
      </form>
    </AuthLayout>
  );
}
