"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Store } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  sellerApplicationSchema,
  type SellerApplicationInput,
} from "@/modules/seller-application/seller-application.schema";
import {
  useCreateSellerApplicationMutation,
  useSellerApplicationQuery,
} from "@/modules/seller-application/seller-application.service";
import { trackConversion } from "@/lib/conversion-tracking";

const statusLabels = {
  pending: "İnceleniyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
} as const;

export function SellerApplicationClient() {
  const application = useSellerApplicationQuery();
  const createApplication = useCreateSellerApplicationMutation();
  const form = useForm<SellerApplicationInput>({
    resolver: zodResolver(sellerApplicationSchema),
    defaultValues: { store_name: "", contact_phone: "", note: "" },
  });

  if (application.isLoading) {
    return <div className="container flex min-h-[50vh] items-center justify-center"><Loader2 className="size-7 animate-spin" /></div>;
  }

  if (application.data) {
    return (
      <section className="container max-w-3xl py-16">
        <div className="rounded-3xl border bg-card p-8 shadow-sm">
          <Store className="mb-5 size-10 text-saffron" />
          <h1 className="font-fraunces text-3xl text-ink">Mağaza başvurunuz</h1>
          <p className="mt-3 text-muted-foreground">{application.data.store_name}</p>
          <p className="mt-6 font-medium">Durum: {statusLabels[application.data.status]}</p>
          {application.data.review_note ? <p className="mt-3 text-sm">{application.data.review_note}</p> : null}
        </div>
      </section>
    );
  }

  return (
    <section className="container max-w-3xl py-16">
      <div className="rounded-3xl border bg-card p-8 shadow-sm">
        <Store className="mb-5 size-10 text-saffron" />
        <h1 className="font-fraunces text-3xl text-ink">Mağaza başvurusu</h1>
        <p className="mt-3 text-muted-foreground">Başvurunuz yönetici onayından sonra satıcı hesabına dönüştürülür.</p>
        <form
          className="mt-8 space-y-5"
          onSubmit={form.handleSubmit((input) => createApplication.mutate(input, {
            onSuccess: (created) => trackConversion("seller_application_submit", {
              application_id: created.id,
            }),
          }))}
        >
          <label className="block text-sm font-medium">Mağaza adı
            <input className="mt-2 h-12 w-full rounded-xl border bg-background px-4" {...form.register("store_name")} />
            {form.formState.errors.store_name ? <span className="mt-1 block text-xs text-destructive">{form.formState.errors.store_name.message}</span> : null}
          </label>
          <label className="block text-sm font-medium">Telefon
            <input className="mt-2 h-12 w-full rounded-xl border bg-background px-4" {...form.register("contact_phone")} />
            {form.formState.errors.contact_phone ? <span className="mt-1 block text-xs text-destructive">{form.formState.errors.contact_phone.message}</span> : null}
          </label>
          <label className="block text-sm font-medium">Başvuru notu
            <textarea className="mt-2 min-h-32 w-full rounded-xl border bg-background p-4" {...form.register("note")} />
          </label>
          {createApplication.isError ? <p className="text-sm text-destructive">Başvuru gönderilemedi. Lütfen tekrar deneyin.</p> : null}
          <Button className="w-full" type="submit" disabled={createApplication.isPending}>
            {createApplication.isPending ? "Gönderiliyor..." : "Başvuruyu gönder"}
          </Button>
        </form>
      </div>
    </section>
  );
}
