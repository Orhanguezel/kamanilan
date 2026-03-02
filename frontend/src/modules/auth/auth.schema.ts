import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  remember_me: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    first_name: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
    last_name: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
    email: z.email("Geçerli bir e-posta adresi giriniz"),
    phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
    password_confirmation: z.string().min(6, "Şifre tekrar en az 6 karakter olmalıdır"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Şifreler eşleşmiyor",
    path: ["password_confirmation"],
  });

export const forgotPasswordSchema = z.object({
  email: z.email("Geçerli bir e-posta adresi giriniz"),
});

export const verifyTokenSchema = z.object({
  token: z.string().min(1, "Token gereklidir"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    token: z.string().min(1, "Token gereklidir"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
    password_confirmation: z.string().min(6, "Şifre tekrar en az 6 karakter olmalıdır"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Şifreler eşleşmiyor",
    path: ["password_confirmation"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type VerifyTokenFormValues = z.infer<typeof verifyTokenSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
