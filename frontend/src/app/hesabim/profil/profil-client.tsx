"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/auth-store";
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
} from "@/modules/profile/profile.service";
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from "@/modules/profile/profile.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToken } from "@/lib/use-token";
import { ROUTES } from "@/config/routes";

interface Props {
  translations: Record<string, string>;
}

export function ProfilClient({ translations: tr }: Props) {
  const authUser = useAuthStore((s) => s.user as any);
  const logout = useAuthStore((s) => s.logout);
  const { removeToken } = useToken();
  const router = useRouter();
  const { data: profile } = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fullName = profile?.full_name || (authUser?.full_name ?? authUser?.name ?? "");
  const [firstNameDefault, ...lastNameParts] = String(fullName).trim().split(/\s+/).filter(Boolean);
  const lastNameDefault = lastNameParts.join(" ");

  const form = useForm<UpdateProfileFormData>({
    // @ts-ignore
    // @ts-ignore
    resolver: zodResolver(updateProfileSchema),
    values: {
      first_name: firstNameDefault || "",
      last_name: lastNameDefault || "",
      phone: profile?.phone || "",
      birth_day: "",
      gender: undefined,
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    updateProfileMutation.mutate({
      full_name: [data.first_name, data.last_name].filter(Boolean).join(" ").trim(),
      phone: data.phone || undefined,
    });
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => {
        removeToken();
        logout();
        router.push(ROUTES.HOME);
      },
    });
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="mb-6 text-lg font-semibold">{tr.profile}</h2>

      {updateProfileMutation.isSuccess && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
          {tr.profile_updated}
        </div>
      )}
      {updateProfileMutation.isError && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {tr.error}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="first_name">{tr.first_name}</Label>
            <Input id="first_name" {...form.register("first_name")} />
            {form.formState.errors.first_name && (
              <p className="text-xs text-destructive">{form.formState.errors.first_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="last_name">{tr.last_name}</Label>
            <Input id="last_name" {...form.register("last_name")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{tr.email}</Label>
          <Input
            id="email"
            type="email"
            value={authUser?.email || ""}
            disabled
            className="bg-muted"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone">{tr.phone}</Label>
            <Input id="phone" type="tel" {...form.register("phone")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="birth_day">{tr.birth_day}</Label>
            <Input id="birth_day" type="date" {...form.register("birth_day")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="gender">{tr.gender}</Label>
          <select
            id="gender"
            {...form.register("gender")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">—</option>
            <option value="male">{tr.gender_male}</option>
            <option value="female">{tr.gender_female}</option>
            <option value="others">{tr.gender_others}</option>
          </select>
        </div>

        <Button type="submit" disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tr.loading}
            </>
          ) : (
            tr.save
          )}
        </Button>
      </form>

      <hr className="my-6" />

      <div>
        <Button
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive/10"
          onClick={() => setShowDeleteDialog(true)}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          {tr.delete_account}
        </Button>
      </div>

      {/* Delete account dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <h3 className="text-lg font-semibold">{tr.delete_account}</h3>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">{tr.delete_account_message}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                {tr.delete_no}
              </Button>
              <Button
                variant="destructive"
                disabled={deleteAccountMutation.isPending}
                onClick={handleDeleteAccount}
              >
                {deleteAccountMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {tr.delete_yes}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
