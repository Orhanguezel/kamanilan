"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from 'next/link';
import { ROUTES } from "@/config/routes";
import {
  useForgotPasswordMutation,
  useVerifyTokenMutation,
  useResetPasswordMutation,
} from "@/modules/auth/auth.service";
import {
  forgotPasswordSchema,
  verifyTokenSchema,
  resetPasswordSchema,
  type ForgotPasswordFormValues,
  type VerifyTokenFormValues,
  type ResetPasswordFormValues,
} from "@/modules/auth/auth.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck } from "lucide-react";

interface Props {
  translations: {
    forgot_password: string;
    forgot_password_subtitle: string;
    email: string;
    send_reset_link: string;
    back_to_login: string;
    reset_email_sent: string;
    verify_token: string;
    verify_token_subtitle: string;
    token_placeholder: string;
    verify: string;
    new_password: string;
    confirm_password: string;
    reset_password: string;
    reset_password_subtitle: string;
    password_reset_success: string;
    login: string;
    loading: string;
    error: string;
  };
}

type Step = "email" | "verify" | "reset" | "success";

export function ForgotPasswordClient({ translations: t }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const forgotMutation = useForgotPasswordMutation();
  const verifyMutation = useVerifyTokenMutation();
  const resetMutation = useResetPasswordMutation();

  // Step 1: Email form
  const emailForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // Step 2: Token form
  const tokenForm = useForm<VerifyTokenFormValues>({
    resolver: zodResolver(verifyTokenSchema),
    defaultValues: { token: "" },
  });

  // Step 3: Reset form
  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      token: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onEmailSubmit = (data: ForgotPasswordFormValues) => {
    forgotMutation.mutate(data, {
      onSuccess: () => {
        setEmail(data.email);
        setStep("verify");
      },
    });
  };

  const onVerifySubmit = (data: VerifyTokenFormValues) => {
    verifyMutation.mutate(data, {
      onSuccess: () => {
        setToken(data.token);
        resetForm.setValue("email", email);
        resetForm.setValue("token", data.token);
        setStep("reset");
      },
    });
  };

  const onResetSubmit = (data: ResetPasswordFormValues) => {
    resetMutation.mutate(
      {
        token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      },
      {
        onSuccess: () => {
          setStep("success");
        },
      }
    );
  };

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          {/* Step 1: Enter Email */}
          {step === "email" && (
            <>
              <div className="mb-6 text-center">
                <Mail className="mx-auto mb-3 h-10 w-10 text-primary" />
                <h1 className="text-2xl font-bold">{t.forgot_password}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.forgot_password_subtitle}
                </p>
              </div>

              {forgotMutation.isError && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {(forgotMutation.error as any)?.response?.data?.message ||
                    t.error}
                </div>
              )}

              <form
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    autoComplete="email"
                    {...emailForm.register("email")}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={forgotMutation.isPending}
                >
                  {forgotMutation.isPending ? t.loading : t.send_reset_link}
                </Button>
              </form>
            </>
          )}

          {/* Step 2: Verify Token */}
          {step === "verify" && (
            <>
              <div className="mb-6 text-center">
                <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-primary" />
                <h1 className="text-2xl font-bold">{t.verify_token}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.verify_token_subtitle}
                </p>
              </div>

              {verifyMutation.isError && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {(verifyMutation.error as any)?.response?.data?.message ||
                    t.error}
                </div>
              )}

              <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                {t.reset_email_sent}
              </div>

              <form
                onSubmit={tokenForm.handleSubmit(onVerifySubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="token">{t.verify_token}</Label>
                  <Input
                    id="token"
                    placeholder={t.token_placeholder}
                    {...tokenForm.register("token")}
                  />
                  {tokenForm.formState.errors.token && (
                    <p className="text-sm text-destructive">
                      {tokenForm.formState.errors.token.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? t.loading : t.verify}
                </Button>
              </form>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === "reset" && (
            <>
              <div className="mb-6 text-center">
                <KeyRound className="mx-auto mb-3 h-10 w-10 text-primary" />
                <h1 className="text-2xl font-bold">{t.reset_password}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.reset_password_subtitle}
                </p>
              </div>

              {resetMutation.isError && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {(resetMutation.error as any)?.response?.data?.message ||
                    t.error}
                </div>
              )}

              <form
                onSubmit={resetForm.handleSubmit(onResetSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="new_password">{t.new_password}</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...resetForm.register("password")}
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
                  {resetForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {resetForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_new_password">
                    {t.confirm_password}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm_new_password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...resetForm.register("password_confirmation")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {resetForm.formState.errors.password_confirmation && (
                    <p className="text-sm text-destructive">
                      {resetForm.formState.errors.password_confirmation.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={resetMutation.isPending}
                >
                  {resetMutation.isPending ? t.loading : t.reset_password}
                </Button>
              </form>
            </>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="text-center">
              <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-green-600" />
              <h1 className="text-2xl font-bold">{t.reset_password}</h1>
              <p className="mt-4 text-muted-foreground">
                {t.password_reset_success}
              </p>
              <Button asChild className="mt-6 w-full">
                <Link href={ROUTES.LOGIN}>{t.login}</Link>
              </Button>
            </div>
          )}

          {/* Back to login link */}
          {step !== "success" && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link
                href={ROUTES.LOGIN}
                className="font-medium text-primary hover:underline"
              >
                {t.back_to_login}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
