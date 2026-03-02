"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/auth-store";
import { useToken } from "@/lib/use-token";
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from "@/modules/profile/profile.service";
import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileFormData,
  type ChangePasswordFormData,
} from "@/modules/profile/profile.schema";
import { ROUTES } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Loader2 } from "lucide-react";

interface Props {
  translations: Record<string, string>;
}

export function AccountClient({ translations: tr }: Props) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authUser = useAuthStore((s) => s.user as any);
  const logout = useAuthStore((s) => s.logout);
  const { removeToken } = useToken();
  const { data: profileData } = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();

  const profile = profileData;
  const fullName = profile?.full_name || (authUser?.full_name ?? authUser?.name ?? "");
  const [firstNameDefault, ...lastNameParts] = String(fullName).trim().split(/\s+/).filter(Boolean);
  const lastNameDefault = lastNameParts.join(" ");

  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      first_name: firstNameDefault || "",
      last_name: lastNameDefault || "",
      phone: profile?.phone || "",
    },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { old_password: "", new_password: "", new_password_confirmation: "" },
  });

  if (!isAuthenticated) {
    router.push(ROUTES.LOGIN);
    return null;
  }

  const onProfileSubmit = (data: UpdateProfileFormData) => {
    updateProfileMutation.mutate({
      full_name: [data.first_name, data.last_name].filter(Boolean).join(" ").trim(),
      phone: data.phone || undefined,
    });
  };

  const onPasswordSubmit = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate({ password: data.new_password }, {
      onSuccess: () => {
        removeToken();
        logout();
        router.push(ROUTES.LOGIN);
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{tr.my_account}</h1>

      {/* Profile */}
      <section className="mb-6 rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{tr.profile}</h2>
        </div>

        {updateProfileMutation.isSuccess && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            {tr.profile_updated}
          </div>
        )}

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="first_name">{tr.name}</Label>
            <Input id="first_name" {...profileForm.register("first_name")} />
            {profileForm.formState.errors.first_name && (
              <p className="text-xs text-destructive">{profileForm.formState.errors.first_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="last_name">Soyad</Label>
            <Input id="last_name" {...profileForm.register("last_name")} />
            {profileForm.formState.errors.last_name && (
              <p className="text-xs text-destructive">{profileForm.formState.errors.last_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">{tr.email}</Label>
            <Input id="email" type="email" value={authUser?.email || ""} disabled className="bg-muted" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">{tr.phone}</Label>
            <Input id="phone" type="tel" {...profileForm.register("phone")} />
          </div>

          <Button type="submit" disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{tr.loading}</>
            ) : tr.save}
          </Button>
        </form>
      </section>

      {/* Password */}
      <section className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{tr.change_password}</h2>
        </div>

        {changePasswordMutation.isSuccess && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            {tr.password_changed}
          </div>
        )}

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="old_password">{tr.old_password}</Label>
            <Input id="old_password" type="password" {...passwordForm.register("old_password")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new_password">{tr.new_password}</Label>
            <Input id="new_password" type="password" {...passwordForm.register("new_password")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new_password_confirmation">{tr.confirm_password}</Label>
            <Input id="new_password_confirmation" type="password" {...passwordForm.register("new_password_confirmation")} />
            {passwordForm.formState.errors.new_password_confirmation && (
              <p className="text-xs text-destructive">{tr.passwords_not_match}</p>
            )}
          </div>

          <Button type="submit" disabled={changePasswordMutation.isPending}>
            {changePasswordMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{tr.loading}</>
            ) : tr.change_password}
          </Button>
        </form>
      </section>
    </div>
  );
}
