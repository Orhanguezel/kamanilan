import { Suspense } from "react";
import type { Metadata } from "next";
import { t } from "@/lib/t";
import { LoginClient } from "./login-client";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: t("seo.login_title"),
    description: t("seo.login_description"),
    alternates: {
      canonical: "/giris",
    },
  };
}

export default async function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient
        translations={{
          home: t("common.home"),
          login_title: t("auth.login_title"),
          email: t("auth.email"),
          password: t("auth.password"),
          forgot_password: t("auth.forgot_password"),
          dont_have_account: t("auth.dont_have_account"),
          register: t("common.register"),
          login: t("common.login"),
          remember_me: t("auth.remember_me"),
          login_error: t("auth.login_error"),
          loading: t("common.loading"),
          or: t("auth.or"),
          google: t("auth.google"),
          facebook: t("auth.facebook"),
          social_error: t("auth.social_error"),
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
    </Suspense>
  );
}
