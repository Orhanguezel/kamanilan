"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from 'next/link';
import { ROUTES } from "@/config/routes";
import { useRegisterMutation } from "@/modules/auth/auth.service";
import {
  useOtpLoginSendMutation,
  useOtpLoginResendMutation,
  useOtpLoginVerifyMutation,
} from "@/modules/auth/auth.service";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/modules/auth/auth.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Eye, EyeOff, User, Mail, Lock, Phone, ChevronRight } from "lucide-react";
import { useThemeConfig } from "@/modules/theme/use-theme-config";
import { useSiteInfoQuery } from "@/modules/site/site.action";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  translations: {
    home: string;
    register_title: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    confirm_password: string;
    already_have_account: string;
    login: string;
    register: string;
    register_error: string;
    loading: string;
    or: string;
    google: string;
    facebook: string;
    social_error: string;
    agree_terms: string;
    login_with_otp: string;
    otp_title: string;
    otp_subtitle: string;
    otp_code: string;
    send_otp: string;
    resend_otp: string;
    verify_otp: string;
    otp_error: string;
    otp_sent: string;
  };
}

export function RegisterClient({ translations: t }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const registerMutation = useRegisterMutation();
  const otpSendMutation = useOtpLoginSendMutation();
  const otpResendMutation = useOtpLoginResendMutation();
  const otpVerifyMutation = useOtpLoginVerifyMutation();
  const { registerConfig } = useThemeConfig();
  const { siteInfo } = useSiteInfoQuery();
  const isOtpEnabled =
    siteInfo?.com_user_login_otp === "on" ||
    siteInfo?.otp_login_enabled_disable === "on";
  const showGoogle = siteInfo?.com_google_login_enabled === "on";
  const showFacebook = siteInfo?.com_facebook_login_enabled === "on";
  const showSocialButtons = showGoogle || showFacebook;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  const openOtpDialog = () => {
    const candidateEmail = watch("email") || "";
    setOtpEmail(candidateEmail);
    setOtpCode("");
    setOtpSent(false);
    setOtpOpen(true);
  };

  const sendOtp = () => {
    if (!otpEmail.trim()) return;
    otpSendMutation.mutate(
      { email: otpEmail.trim() },
      { onSuccess: () => setOtpSent(true) }
    );
  };

  const resendOtp = () => {
    if (!otpEmail.trim()) return;
    otpResendMutation.mutate({ email: otpEmail.trim() });
  };

  const verifyOtp = () => {
    if (!otpEmail.trim() || !otpCode.trim()) return;
    otpVerifyMutation.mutate(
      { email: otpEmail.trim(), otp: otpCode.trim() },
      { onSuccess: () => setOtpOpen(false) }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:py-10">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-foreground">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-primary">{registerConfig.title || t.register_title}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_560px]">
        <div className="hidden md:block" />

        <div>
          <div className="rounded-lg border bg-card p-7 shadow-sm">
            <h1 className="mb-2 text-center text-[44px] font-semibold leading-none tracking-tight text-foreground md:text-[46px]">
              {registerConfig.title || t.register_title}
            </h1>
            {(registerConfig.subtitle || registerConfig.description) && (
              <p className="mb-5 text-center text-sm text-muted-foreground">
                {registerConfig.subtitle}
              </p>
            )}
            {registerConfig.imageUrl && (
              <div className="mb-5 overflow-hidden rounded-md border">
                <Image
                  src={registerConfig.imageUrl}
                  alt={registerConfig.title || t.register_title}
                  width={520}
                  height={180}
                  className="h-auto w-full object-cover"
                />
              </div>
            )}

            {registerMutation.isError && (
              <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {(registerMutation.error as any)?.response?.data?.message ||
                  t.register_error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">{t.first_name}</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="first_name"
                      placeholder={t.first_name}
                      autoComplete="given-name"
                      className="pl-10"
                      {...register("first_name")}
                    />
                  </div>
                  {errors.first_name && (
                    <p className="text-sm text-destructive">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">{t.last_name}</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="last_name"
                      placeholder={t.last_name}
                      autoComplete="family-name"
                      className="pl-10"
                      {...register("last_name")}
                    />
                  </div>
                  {errors.last_name && (
                    <p className="text-sm text-destructive">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.email}
                    autoComplete="email"
                    className="pl-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t.phone}</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    autoComplete="tel"
                    className="pl-10"
                    {...register("phone")}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t.password}
                    autoComplete="new-password"
                    className="pl-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">
                  {t.confirm_password}
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t.confirm_password}
                    autoComplete="new-password"
                    className="pl-10"
                    {...register("password_confirmation")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-sm text-destructive">
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>

              {registerConfig.termsPageUrl && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agree_terms"
                    checked={agreedTerms}
                    onCheckedChange={(checked) => setAgreedTerms(checked === true)}
                  />
                  <Label htmlFor="agree_terms" className="text-sm font-normal">
                    {t.agree_terms.split(/{|}/).length > 1 ? (
                      <>
                        {t.agree_terms.split(/{|}/)[0]}
                        <Link
                          href={registerConfig.termsPageUrl}
                          className="text-primary hover:underline"
                          target="_blank"
                        >
                          {registerConfig.termsPageTitle || t.agree_terms.split(/{|}/)[1]}
                        </Link>
                        {t.agree_terms.split(/{|}/)[2] || ""}
                      </>
                    ) : (
                      <span>
                        {t.agree_terms}
                      </span>
                    )}
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending || (registerConfig.termsPageUrl ? !agreedTerms : false)}
              >
                {registerMutation.isPending ? t.loading : t.register}
              </Button>
            </form>

            {isOtpEnabled && (
              <>
                <div className="my-3 text-center text-muted-foreground">{t.or}</div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={openOtpDialog}
                >
                  {t.login_with_otp}
                </Button>
              </>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t.already_have_account}{" "}
              <Link
                href={ROUTES.LOGIN}
                className="font-medium text-primary hover:underline"
              >
                {t.login}
              </Link>
            </p>

            {showSocialButtons && (
              <Suspense>
                <SocialLoginButtons
                  translations={{
                    or: t.or,
                    google: t.google,
                    facebook: t.facebook,
                    social_error: t.social_error,
                  }}
                  showGoogle={showGoogle}
                  showFacebook={showFacebook}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>

      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.otp_title}</DialogTitle>
            <DialogDescription>{t.otp_subtitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="otp_email">{t.email}</Label>
              <Input
                id="otp_email"
                type="email"
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                placeholder={t.email}
              />
            </div>

            {otpSent && (
              <div className="space-y-1.5">
                <Label htmlFor="otp_code">{t.otp_code}</Label>
                <Input
                  id="otp_code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder={t.otp_code}
                />
              </div>
            )}

            {(otpSendMutation.isError ||
              otpResendMutation.isError ||
              otpVerifyMutation.isError) && (
              <p className="text-sm text-destructive">{t.otp_error}</p>
            )}

            {!otpSent ? (
              <Button
                type="button"
                className="w-full"
                onClick={sendOtp}
                disabled={otpSendMutation.isPending || !otpEmail.trim()}
              >
                {otpSendMutation.isPending ? t.loading : t.send_otp}
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  type="button"
                  className="w-full"
                  onClick={verifyOtp}
                  disabled={otpVerifyMutation.isPending || !otpCode.trim()}
                >
                  {otpVerifyMutation.isPending ? t.loading : t.verify_otp}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={resendOtp}
                  disabled={otpResendMutation.isPending}
                >
                  {otpResendMutation.isPending ? t.loading : t.resend_otp}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {t.otp_sent}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
