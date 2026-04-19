// src/app/odeme/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { t } from "@/lib/t";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CreditCard,
  Plus,
  Check,
  ShoppingBag,
  Info,
  ChevronRight,
  Loader2,
  ArrowRight
} from "lucide-react";
import {
  useAddressesQuery,
  useCreateAddressMutation,
  usePaymentGatewaysQuery,
  useCreateOrderMutation,
  useInitIyzicoMutation
} from "@/modules/checkout/checkout.service";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LocationAutocomplete } from "@/components/location/location-autocomplete";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedGatewaySlug, setSelectedGatewaySlug] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Address form states for auto-fill
  const [addrForm, setAddrForm] = useState({
    title: "",
    full_name: "",
    phone: "",
    email: "",
    address_line: "",
    city: "",
    district: "",
    postal_code: "",
  });

  const updateAddrField = (field: string, value: string) => {
    setAddrForm(prev => ({ ...prev, [field]: value }));
  };

  // Queries
  const { data: addresses, isLoading: isLoadingAddresses } = useAddressesQuery();
  const { data: gateways, isLoading: isLoadingGateways } = usePaymentGatewaysQuery();

  // Mutations
  const createAddress = useCreateAddressMutation();
  const createOrder = useCreateOrderMutation();
  const initIyzico = useInitIyzicoMutation();

  const handleLocationPick = useCallback((loc: any) => {
    setAddrForm(prev => ({
      ...prev,
      city: loc.city || prev.city,
      district: loc.district || prev.district,
      address_line: loc.address || prev.address_line,
    }));
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isAddressModalOpen) {
      setAddrForm({
        title: "",
        full_name: "",
        phone: "",
        email: "",
        address_line: "",
        city: "",
        district: "",
        postal_code: "",
      });
    }
  }, [isAddressModalOpen]);

  // Redirect unauthenticated users after mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/giris?redirect=/odeme");
    }
  }, [isAuthenticated, router]);

  // Auto-select default address once loaded
  const effectiveAddressId = selectedAddressId ?? (
    addresses && addresses.length > 0
      ? (addresses.find(a => a.is_default === 1) ?? addresses[0]).id
      : null
  );

  // Auto-select first gateway once loaded
  const effectiveGatewaySlug = selectedGatewaySlug ?? (
    gateways && gateways.length > 0 ? gateways[0].slug : null
  );

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) return null;

  // Guard: filter out stale cart items where listing failed to load
  const validItems = items.filter(i => !!i.listing);

  if (validItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <ShoppingBag className="h-16 w-16 text-gray-300" />
        <h1 className="text-2xl font-bold">{t("cart.empty")}</h1>
        <Button onClick={() => router.push("/")}>{t("cart.continue_shopping")}</Button>
      </div>
    );
  }

  const subtotal = validItems.reduce((acc, item) => acc + (parseFloat(item.listing.price || "0") * item.quantity), 0);
  const total = subtotal; // Assuming free shipping for now

  const handleCreateAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createAddress.mutateAsync({ ...addrForm, is_default: 1 });
      setIsAddressModalOpen(false);
      toast.success(t("checkout.address_form.save"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handlePlaceOrder = async () => {
    if (!effectiveAddressId) {
      toast.error(t("checkout.error_no_address"));
      return;
    }
    if (!effectiveGatewaySlug) {
      toast.error(t("checkout.error_no_gateway"));
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderRes = await createOrder.mutateAsync({
        shipping_address_id: effectiveAddressId,
        payment_gateway_slug: effectiveGatewaySlug,
        order_notes: orderNotes,
        items: validItems.map(i => ({
          property_id: i.listing.id,
          quantity: i.quantity,
        })),
      });

      if (effectiveGatewaySlug === "iyzico") {
        const initRes = await initIyzico.mutateAsync(orderRes.order_id);
        if (initRes.checkout_url) {
           router.push(initRes.checkout_url);
        } else {
           toast.error(t("common.error"));
           setIsPlacingOrder(false);
        }
      } else {
        // For Bank Transfer or other manual gateways
        router.push(`/siparis/basarili?order_id=${orderRes.order_id}&method=${effectiveGatewaySlug}`);
        clearCart();
      }
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(errMsg || t("common.error"));
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="bg-cream/30 min-h-screen">
      <div className="container mx-auto px-4 py-12 lg:py-20 max-w-7xl">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-saffron/30" />
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-saffron-2">Güvenli Ödeme</span>
          </div>
          <h1 className="font-fraunces text-4xl md:text-5xl font-medium tracking-tight text-ink">{t("checkout.title")}</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-20 items-start">
          {/* Left Column: Addresses & Payment */}
          <div className="space-y-12">
            {/* 1. Address Section */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-black/5 pb-6">
                <h2 className="font-fraunces text-2xl font-medium flex items-center gap-3 text-ink">
                  <MapPin className="h-5 w-5 text-saffron" />
                  {t("checkout.shipping_address")}
                </h2>
                <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="btn-editorial bg-transparent border-saffron/30 text-walnut px-6 py-2 h-auto text-[10px]">
                      <Plus className="h-3 w-3" />
                      {t("checkout.add_new_address")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent 
                    className="sm:max-w-2xl bg-paper border-black/5 rounded-none p-0 overflow-hidden"
                    onInteractOutside={(e) => {
                      const target = e.target as HTMLElement;
                      if (target?.closest?.('.pac-container')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <DialogHeader className="p-8 pb-0">
                      <DialogTitle className="font-fraunces text-2xl text-ink">{t("checkout.add_new_address")}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateAddress} className="space-y-6 p-8 font-manrope">
                      
                      {/* Google Autocomplete Field */}
                      <div className="space-y-2">
                        <Label className="text-[11px] uppercase tracking-wider font-bold text-saffron-2">Adresi Haritada Bul</Label>
                        <LocationAutocomplete 
                           onChange={handleLocationPick}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-black/5">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-[11px] uppercase tracking-wider font-bold text-walnut opacity-60">{t("checkout.address_form.title")}</Label>
                          <Input id="title" value={addrForm.title} onChange={(e) => updateAddrField("title", e.target.value)} placeholder="Ev, İş vb." required className="rounded-none border-black/10 focus:border-saffron focus:ring-0" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="full_name" className="text-[11px] uppercase tracking-wider font-bold text-walnut opacity-60">{t("checkout.address_form.full_name")}</Label>
                          <Input id="full_name" value={addrForm.full_name} onChange={(e) => updateAddrField("full_name", e.target.value)} required className="rounded-none border-black/10 focus:border-saffron focus:ring-0" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-[11px] uppercase tracking-wider font-bold text-walnut opacity-60">{t("checkout.address_form.phone")}</Label>
                          <Input id="phone" value={addrForm.phone} onChange={(e) => updateAddrField("phone", e.target.value)} required className="rounded-none border-black/10 focus:border-saffron focus:ring-0" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-[11px] uppercase tracking-wider font-bold text-walnut opacity-60">{t("checkout.address_form.email")}</Label>
                          <Input id="email" type="email" value={addrForm.email} onChange={(e) => updateAddrField("email", e.target.value)} className="rounded-none border-black/10 focus:border-saffron focus:ring-0" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address_line" className="text-[11px] uppercase tracking-wider font-bold text-walnut opacity-60">{t("checkout.address_form.address_line")}</Label>
                        <Textarea id="address_line" value={addrForm.address_line} onChange={(e) => updateAddrField("address_line", e.target.value)} required className="rounded-none border-black/10 focus:border-saffron focus:ring-0 min-h-[80px]" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-[11px] uppercase tracking-wider font-bold text-walnut opacity-60">{t("checkout.address_form.city")}</Label>
                          <Input id="city" value={addrForm.city} onChange={(e) => updateAddrField("city", e.target.value)} required className="rounded-none border-black/10 focus:border-saffron focus:ring-0" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="district" className="text-[11px] uppercase tracking-wider font-bold text-walnut opacity-60">{t("checkout.address_form.district")}</Label>
                          <Input id="district" value={addrForm.district} onChange={(e) => updateAddrField("district", e.target.value)} required className="rounded-none border-black/10 focus:border-saffron focus:ring-0" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postal_code" className="text-[11px] uppercase tracking-wider font-bold text-walnut opacity-60">{t("checkout.address_form.postal_code")}</Label>
                          <Input id="postal_code" value={addrForm.postal_code} onChange={(e) => updateAddrField("postal_code", e.target.value)} className="rounded-none border-black/10 focus:border-saffron focus:ring-0" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="btn-editorial bg-ink text-white w-full py-6 text-xs" disabled={createAddress.isPending}>
                          {createAddress.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin text-saffron" />}
                          <span>{t("checkout.address_form.save")}</span>
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {isLoadingAddresses ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map(i => <div key={i} className="h-40 w-full animate-pulse bg-ivory/50 border border-black/5" />)}
                </div>
              ) : addresses && addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map(addr => (
                    <div 
                      key={addr.id}
                      className={`group relative p-6 transition-all duration-500 cursor-pointer border ${effectiveAddressId === addr.id ? 'bg-paper shadow-2xl scale-[1.02] border-saffron z-10' : 'bg-white/40 border-black/5 hover:border-saffron/30 hover:bg-paper/50'}`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-fraunces text-lg font-medium text-ink flex items-center gap-3">
                          {addr.title}
                          {addr.is_default === 1 && (
                             <span className="font-mono text-[8px] uppercase tracking-widest text-saffron-2 bg-saffron/10 px-2 py-0.5">Varsayılan</span>
                          )}
                        </h3>
                        {effectiveAddressId === addr.id && <Check className="h-4 w-4 text-saffron" />}
                      </div>
                      <div className="space-y-1 text-walnut/70 text-sm font-manrope">
                        <p className="font-bold text-ink">{addr.full_name}</p>
                        <p className="line-clamp-2 italic">{addr.address_line}</p>
                        <p>{addr.district}, {addr.city}</p>
                        <p className="font-mono text-[11px] mt-4 pt-4 border-t border-black/5">{addr.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 border border-dashed border-black/10 flex flex-col items-center justify-center text-walnut/30 gap-4 bg-white/10 italic">
                  <MapPin className="h-10 w-10 opacity-20" />
                  <p className="font-fraunces">{t("checkout.no_addresses")}</p>
                </div>
              )}
            </section>

            {/* 2. Payment Method Section */}
            <section className="space-y-8">
              <h2 className="font-fraunces text-2xl font-medium flex items-center gap-3 pt-8 text-ink border-b border-black/5 pb-6">
                <CreditCard className="h-5 w-5 text-saffron" />
                {t("checkout.payment_method")}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {isLoadingGateways ? (
                   Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 w-full animate-pulse bg-ivory/50 border border-black/5" />)
                ) : gateways?.map(gw => (
                  <div 
                    key={gw.id}
                    className={`group p-5 transition-all duration-500 cursor-pointer border flex items-center gap-6 ${effectiveGatewaySlug === gw.slug ? 'bg-paper shadow-xl scale-[1.01] border-saffron' : 'bg-white/40 border-black/5 hover:bg-paper/30'}`}
                    onClick={() => setSelectedGatewaySlug(gw.slug)}
                  >
                    <div className={`h-12 w-12 flex items-center justify-center transition-colors ${effectiveGatewaySlug === gw.slug ? 'bg-ink text-saffron' : 'bg-ivory text-walnut border border-black/5'}`}>
                      {gw.slug === 'iyzico' ? <CreditCard className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-fraunces text-lg text-ink">{gw.name}</h3>
                      <p className="text-xs text-walnut/60 font-manrope mt-0.5">
                        {gw.slug === 'iyzico' ? t("checkout.iyzico_desc") : t("checkout.bank_transfer_desc")}
                      </p>
                    </div>
                    {effectiveGatewaySlug === gw.slug && (
                      <div className="h-6 w-6 rounded-full bg-saffron text-ink flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 font-bold" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Order Notes */}
            <section className="space-y-6 pt-8">
              <h2 className="font-fraunces text-2xl font-medium text-ink flex items-center gap-3 border-b border-black/5 pb-6">
                 {t("checkout.notes")}
              </h2>
              <Textarea 
                placeholder={t("checkout.notes_placeholder")}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="bg-white/50 border-black/10 rounded-none focus:border-saffron focus:ring-0 min-h-[140px] font-manrope italic p-6"
              />
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="lg:sticky lg:top-24">
            <div className="bg-ink text-parchment p-8 lg:p-10 shadow-3xl relative overflow-hidden group">
              {/* Decorative grain/gradient */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,147,26,0.15),transparent_60%)] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-saffron via-saffron-2 to-saffron" />
              
              <h2 className="font-fraunces text-2xl border-b border-white/10 pb-6 mb-8 relative z-10">{t("checkout.order_summary")}</h2>
              
              <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2 relative z-10">
                {validItems.map(item => (
                  <div key={item.listing.id} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2 leading-snug">{item.listing.title}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-wheat/40 mt-1.5">MİKTAR: {item.quantity}</p>
                    </div>
                    <p className="font-fraunces text-sm font-bold text-saffron shrink-0">
                      {(parseFloat(item.listing.price || "0") * item.quantity).toLocaleString('tr-TR')} {t("common.currency")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-8 space-y-4 relative z-10">
                <div className="flex justify-between text-[11px] font-mono tracking-wider opacity-60">
                  <span>{t("cart.subtotal")}</span>
                  <span>{subtotal.toLocaleString('tr-TR')} {t("common.currency")}</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono tracking-wider">
                  <span className="opacity-60">{t("cart.shipping")}</span>
                  <span className="text-saffron uppercase font-bold tracking-widest text-[9px]">{t("cart.free_shipping")}</span>
                </div>
                
                <div className="pt-6 mt-4 border-t border-white/5 flex justify-between items-baseline">
                  <span className="font-fraunces text-lg opacity-80">{t("cart.total")}</span>
                  <span className="font-fraunces text-4xl text-saffron tracking-tight">
                    {total.toLocaleString('tr-TR')}
                    <span className="text-lg ml-1 opacity-60">{t("common.currency")}</span>
                  </span>
                </div>
              </div>

              <Button 
                className="btn-editorial bg-saffron text-ink hover:bg-white hover:text-ink w-full mt-10 py-8 text-xs justify-center relative z-10" 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !effectiveAddressId || !effectiveGatewaySlug}
              >
                {isPlacingOrder ? (
                   <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span className="flex items-center gap-3">
                      {t("checkout.place_order")}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-3 mt-8 text-[9px] text-parchment/30 uppercase tracking-[0.2em] font-mono font-bold">
                <div className="h-px w-6 bg-white/10" />
                <span className="flex items-center gap-2">
                   <Check className="h-3 w-3 text-saffron" />
                   {t("cart.secure_payment")}
                </span>
                <div className="h-px w-6 bg-white/10" />
              </div>
            </div>

            {/* Support section */}
            <div className="mt-8 p-6 border border-black/5 bg-paper/50 italic text-walnut/60 text-xs font-manrope">
               Bize ihtiyacınız mı var? +90 386 712 0000 numaralı telefondan veya sağ alttaki destek panelinden bize her an ulaşabilirsiniz.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
