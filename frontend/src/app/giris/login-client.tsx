"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from 'next/link';
import { ROUTES } from "@/config/routes";
import { useLoginMutation } from "@/modules/auth/auth.service";
import {
  useOtpLoginResendMutation,
  useOtpLoginSendMutation,
  useOtpLoginVerifyMutation,
} from "@/modules/auth/auth.service";
import { loginSchema, type LoginFormValues } from "@/modules/auth/auth.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Eye, EyeOff, Mail, Lock, ChevronRight } from "lucide-react";
import { useThemeConfig } from "@/modules/theme/use-theme-config";
import Image from "next/image";
import { useSiteInfoQuery } from "@/modules/site/site.action";
import { env } from "@/env.mjs";
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
    login_title: string;
    email: string;
    password: string;
    forgot_password: string;
    dont_have_account: string;
    register: string;
    login: string;
    remember_me: string;
    login_error: string;
    loading: string;
    or: string;
    google: string;
    facebook: string;
    social_error: string;
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

export function LoginClient({ translations: t }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const loginMutation = useLoginMutation();
  const otpSendMutation = useOtpLoginSendMutation();
  const otpResendMutation = useOtpLoginResendMutation();
  const otpVerifyMutation = useOtpLoginVerifyMutation();
  const { loginConfig } = useThemeConfig();
  const { siteInfo } = useSiteInfoQuery();
  const isOtpEnabled =
    siteInfo?.com_user_login_otp === "on" ||
    siteInfo?.otp_login_enabled_disable === "on";
  const showGoogle =
    Boolean(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) &&
    siteInfo?.com_google_login_enabled !== "off";
  const showFacebook =
    Boolean(env.NEXT_PUBLIC_FACEBOOK_APP_ID) &&
    siteInfo?.com_facebook_login_enabled !== "off";
  const showSocialButtons = showGoogle || showFacebook;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormValues>({
    // @ts-ignore
    // @ts-ignore
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
  });

  const rememberMe = watch("remember_me");

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
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
      {
        onSuccess: () => {
          setOtpSent(true);
        },
      }
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
      {
        onSuccess: () => {
          setOtpOpen(false);
        },
      }
    );
  };

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side: Flat Illustration */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-white items-center justify-center p-20 border-r border-black/5">
          <div className="relative w-full h-full max-h-[600px] max-w-[600px]">
            <Image
              src="/images/auth/login.png"
              alt="Giriş Yap"
              fill
              className="object-contain transition-transform duration-700 hover:scale-105"
              priority
            />
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 lg:bg-[hsl(var(--col-paper))]">
          <div className="w-full max-w-[480px]">
            <nav className="mb-12 flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[hsl(var(--col-ink))] opacity-30">
              <Link href={ROUTES.HOME} className="hover:text-ink">{t.home}</Link>
              <ChevronRight className="h-3 w-3" />
              <span>GİRİŞ YAP</span>
            </nav>

            <div className="mb-12 space-y-4">
              <h1 className="font-fraunces text-5xl lg:text-6xl font-medium tracking-tight text-ink leading-none">
                {loginConfig.title || t.login_title}
              </h1>
              <p className="text-[hsl(var(--col-walnut))] opacity-60 font-manrope">
                Kaman ve çevresindeki en güncel ilanlara erişmek için hesabınıza dönün.
              </p>
            </div>

            {loginMutation.isError && (
              <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {t.login_error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t.password}</Label>
                <Link
                  href={ROUTES.FORGOT_PASSWORD}
                  className="text-sm text-primary hover:underline"
                >
                  {t.forgot_password}
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember_me"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setValue("remember_me", checked === true)
                }
              />
              <Label htmlFor="remember_me" className="text-sm font-normal">
                {t.remember_me}
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? t.loading : t.login}
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
              {t.dont_have_account}{" "}
              <Link
                href={ROUTES.REGISTER}
                className="font-medium text-primary hover:underline"
              >
                {t.register}
              </Link>
            </p>

          </div>
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
    </>
  );
}
