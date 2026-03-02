import type { Metadata } from "next";
import { t } from "@/lib/t";
import { ForgotPasswordClient } from "./forgot-password-client";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: t("seo.forgot_password_title"),
    description: t("seo.forgot_password_description"),
    alternates: {
      canonical: "/sifremi-unuttum",
    },
  };
}

export default async function ForgotPasswordPage() {
  return (
    <ForgotPasswordClient
      translations={{
        forgot_password: t("auth.forgot_password"),
        forgot_password_subtitle: t("auth.forgot_password_subtitle"),
        email: t("auth.email"),
        send_reset_link: t("auth.send_reset_link"),
        back_to_login: t("auth.back_to_login"),
        reset_email_sent: t("auth.reset_email_sent"),
        verify_token: t("auth.verify_token"),
        verify_token_subtitle: t("auth.verify_token_subtitle"),
        token_placeholder: t("auth.token_placeholder"),
        verify: t("auth.verify"),
        new_password: t("auth.new_password"),
        confirm_password: t("auth.confirm_password"),
        reset_password: t("auth.reset_password"),
        reset_password_subtitle: t("auth.reset_password_subtitle"),
        password_reset_success: t("auth.password_reset_success"),
        login: t("common.login"),
        loading: t("common.loading"),
        error: t("common.error"),
      }}
    />
  );
}
