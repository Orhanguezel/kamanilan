import type { Metadata } from "next";
import { t } from "@/lib/t";
import { RegisterClient } from "./register-client";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: t("seo.register_title"),
    description: t("seo.register_description"),
    alternates: {
      canonical: "/kayit",
    },
  };
}

export default async function RegisterPage() {
  return (
    <RegisterClient
      translations={{
        home: t("common.home"),
        register_title: t("auth.register_title"),
        first_name: t("auth.first_name"),
        last_name: t("auth.last_name"),
        email: t("auth.email"),
        phone: t("auth.phone"),
        password: t("auth.password"),
        confirm_password: t("auth.confirm_password"),
        already_have_account: t("auth.already_have_account"),
        login: t("common.login"),
        register: t("common.register"),
        register_error: t("auth.register_error"),
        loading: t("common.loading"),
        or: t("auth.or"),
        google: t("auth.google"),
        facebook: t("auth.facebook"),
        social_error: t("auth.social_error"),
        agree_terms: t("auth.agree_terms"),
        login_with_otp: t("auth.login_with_otp"),
        otp_title: t("auth.otp_title"),
        otp_subtitle: t("auth.otp_subtitle"),
        otp_code: t("auth.otp_code"),
        send_otp: t("auth.send_otp"),
        resend_otp: t("auth.resend_otp"),
        verify_otp: t("auth.verify_otp"),
        otp_error: t("auth.otp_error"),
        otp_sent: t("auth.otp_sent"),
      }}
    />
  );
}
