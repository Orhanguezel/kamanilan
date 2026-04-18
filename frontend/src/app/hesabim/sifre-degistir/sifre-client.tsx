"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/auth-store";
import { useChangePasswordMutation } from "@/modules/profile/profile.service";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/modules/profile/profile.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToken } from "@/lib/use-token";
import { ROUTES } from "@/config/routes";

interface Props {
  translations: Record<string, string>;
}

export function SifreClient({ translations: tr }: Props) {
  const logout = useAuthStore((s) => s.logout);
  const { removeToken } = useToken();
  const router = useRouter();
  const mutation = useChangePasswordMutation();

  const form = useForm<ChangePasswordFormData>({
    // @ts-ignore
    // @ts-ignore
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { old_password: "", new_password: "", new_password_confirmation: "" },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    mutation.mutate(
      { password: data.new_password },
      {
        onSuccess: () => {
          removeToken();
          logout();
          router.push(ROUTES.LOGIN);
        },
      }
    );
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="mb-6 text-lg font-semibold">{tr.change_password}</h2>

      {mutation.isSuccess && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
          {tr.password_changed}
        </div>
      )}
      {mutation.isError && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {tr.error}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <div className="space-y-1.5">
          <Label htmlFor="old_password">{tr.old_password}</Label>
          <Input id="old_password" type="password" {...form.register("old_password")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new_password">{tr.new_password}</Label>
          <Input id="new_password" type="password" {...form.register("new_password")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new_password_confirmation">{tr.confirm_password}</Label>
          <Input
            id="new_password_confirmation"
            type="password"
            {...form.register("new_password_confirmation")}
          />
          {form.formState.errors.new_password_confirmation && (
            <p className="text-xs text-destructive">{tr.passwords_not_match}</p>
          )}
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tr.loading}
            </>
          ) : (
            tr.change_password
          )}
        </Button>
      </form>
    </div>
  );
}
