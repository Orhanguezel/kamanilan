"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/config/routes";

type SellerAccess = { id: string; name: string };

export function SelfServiceRequest() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrated = useAuthStore((state) => state.hasHydrated);
  const [sellers, setSellers] = useState<SellerAccess[]>([]);
  const [sellerId, setSellerId] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!authenticated) return;
    void fetch("/api/v1/ads/banners/self-service", { credentials: "include" })
      .then(async (response) => response.ok ? response.json() as Promise<{ firms?: SellerAccess[] }> : { firms: [] })
      .then((payload) => {
        const next = payload.firms ?? [];
        setSellers(next);
        setSellerId((current) => current || next[0]?.id || "");
      });
  }, [authenticated]);

  if (!hydrated) return <div className="h-32 animate-pulse rounded-3xl bg-muted" />;
  if (!authenticated) {
    return (
      <div className="rounded-[32px] border border-line bg-paper p-8 text-center">
        <h3 className="font-fraunces text-2xl text-ink">Mağazanız için reklam talebi oluşturun</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm text-text-3">Self-servis talep formunu kullanmak için mağaza hesabınızla giriş yapın.</p>
        <Link href={ROUTES.LOGIN} className="btn-editorial mt-6"><span>Giriş Yap</span></Link>
      </div>
    );
  }

  if (!sellers.length) {
    return <div className="rounded-[32px] border border-line bg-paper p-8 text-center text-sm text-text-3">Aktif mağazanız bulunamadı. Reklam talebi için iletişim formunu kullanabilirsiniz.</div>;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    try {
      const response = await fetch("/api/v1/ads/banners/self-service/requests", {
        method: "POST", credentials: "include", headers: { "content-type": "application/json" },
        body: JSON.stringify({ sellerId, requestType: "new_slot", requesterNote: note, payload: { source: "reklam-ver" } }),
      });
      if (!response.ok) throw new Error("Talep gönderilemedi");
      setNote("");
      toast.success("Reklam talebiniz incelemeye alındı");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Talep gönderilemedi");
    } finally { setSending(false); }
  }

  return (
    <form onSubmit={submit} className="rounded-[32px] border border-line bg-paper p-8 shadow-editorial-2">
      <h3 className="font-fraunces text-2xl text-ink">Yeni reklam alanı talebi</h3>
      <div className="mt-6 grid gap-5">
        <label className="grid gap-2 text-sm font-semibold">Mağaza
          <select value={sellerId} onChange={(event) => setSellerId(event.target.value)} className="h-12 rounded-xl border border-line bg-white px-4">
            {sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.name}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">Talep notu
          <textarea required minLength={10} maxLength={2000} value={note} onChange={(event) => setNote(event.target.value)} className="min-h-32 rounded-xl border border-line bg-white p-4" placeholder="Hedeflediğiniz sayfa, tarih ve kampanya amacını yazın." />
        </label>
        <button disabled={sending} className="btn-editorial w-fit disabled:opacity-50"><span><Send className="h-4 w-4" />{sending ? "Gönderiliyor…" : "Talebi Gönder"}</span></button>
      </div>
    </form>
  );
}
