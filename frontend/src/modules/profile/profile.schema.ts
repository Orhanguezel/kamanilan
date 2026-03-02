import { z } from "zod/v4";

export const updateProfileSchema = z.object({
  first_name: z.string().min(1).max(255),
  last_name: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  birth_day: z.string().optional(),
  gender: z.enum(["male", "female", "others"]).optional(),
});

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1),
    new_password: z.string().min(8).max(32),
    new_password_confirmation: z.string().min(8).max(32),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    path: ["new_password_confirmation"],
  });

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
