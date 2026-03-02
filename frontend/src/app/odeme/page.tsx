// src/app/odeme/page.tsx
"use client";

import React, { useState, useEffect } from "react";
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
  Loader2
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
import { toast } from "sonner"; // Assuming sonner as it's common with shadcn

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedGatewaySlug, setSelectedGatewaySlug] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Queries
  const { data: addresses, isLoading: isLoadingAddresses } = useAddressesQuery();
  const { data: gateways, isLoading: isLoadingGateways } = usePaymentGatewaysQuery();

  // Mutations
  const createAddress = useCreateAddressMutation();
  const createOrder = useCreateOrderMutation();
  const initIyzico = useInitIyzicoMutation();

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
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address_line: formData.get("address_line") as string,
      city: formData.get("city") as string,
      district: formData.get("district") as string,
      postal_code: formData.get("postal_code") as string,
      is_default: 1,
    };

    try {
      await createAddress.mutateAsync(data);
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">{t("checkout.title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Addresses & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Address Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                {t("checkout.shipping_address")}
              </h2>
              <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("checkout.add_new_address")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t("checkout.add_new_address")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateAddress} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">{t("checkout.address_form.title")}</Label>
                        <Input id="title" name="title" placeholder="Ev, İş vb." required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="full_name">{t("checkout.address_form.full_name")}</Label>
                        <Input id="full_name" name="full_name" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t("checkout.address_form.phone")}</Label>
                        <Input id="phone" name="phone" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("checkout.address_form.email")}</Label>
                        <Input id="email" name="email" type="email" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address_line">{t("checkout.address_form.address_line")}</Label>
                      <Textarea id="address_line" name="address_line" required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">{t("checkout.address_form.city")}</Label>
                        <Input id="city" name="city" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">{t("checkout.address_form.district")}</Label>
                        <Input id="district" name="district" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postal_code">{t("checkout.address_form.postal_code")}</Label>
                        <Input id="postal_code" name="postal_code" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full" disabled={createAddress.isPending}>
                        {createAddress.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("checkout.address_form.save")}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingAddresses ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[1, 2].map(i => <div key={i} className="h-32 w-64 rounded-xl bg-gray-100 animate-pulse shrink-0" />)}
              </div>
            ) : addresses && addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <Card 
                    key={addr.id}
                    className={`p-4 cursor-pointer transition-all border-2 ${effectiveAddressId === addr.id ? 'border-primary ring-1 ring-primary' : 'border-transparent bg-gray-50'}`}
                    onClick={() => setSelectedAddressId(addr.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold flex items-center gap-2">
                        {addr.title}
                        {addr.is_default === 1 && (
                           <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">
                             Varsayılan
                           </span>
                        )}
                      </h3>
                      {effectiveAddressId === addr.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{addr.full_name}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{addr.address_line}</p>
                    <p className="text-xs text-gray-500 mt-1">{addr.district}, {addr.city}</p>
                    <p className="text-xs text-gray-400 mt-2">{addr.phone}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 border-dashed flex flex-col items-center justify-center text-gray-400 gap-2">
                <MapPin className="h-8 w-8" />
                <p>{t("checkout.no_addresses")}</p>
              </Card>
            )}
          </section>

          {/* 2. Payment Method Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 pt-4">
              <CreditCard className="h-5 w-5 text-gray-500" />
              {t("checkout.payment_method")}
            </h2>
            {isLoadingGateways ? (
               <div className="space-y-4">
                 {[1, 2].map(i => <div key={i} className="h-16 w-full rounded-xl bg-gray-100 animate-pulse" />)}
               </div>
            ) : gateways?.map(gw => (
              <Card 
                key={gw.id}
                className={`p-4 cursor-pointer transition-all border-2 ${effectiveGatewaySlug === gw.slug ? 'border-primary ring-1 ring-primary' : 'border-transparent bg-gray-50'}`}
                onClick={() => setSelectedGatewaySlug(gw.slug)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${effectiveGatewaySlug === gw.slug ? 'bg-primary text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
                    {gw.slug === 'iyzico' ? <CreditCard className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{gw.name}</h3>
                    <p className="text-xs text-gray-500">
                      {gw.slug === 'iyzico' ? t("checkout.iyzico_desc") : t("checkout.bank_transfer_desc")}
                    </p>
                  </div>
                  {effectiveGatewaySlug === gw.slug && <Check className="h-5 w-5 text-primary" />}
                </div>
              </Card>
            ))}
          </section>

          {/* 3. Order Notes */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold pt-4">{t("checkout.notes")}</h2>
            <Textarea 
              placeholder={t("checkout.notes_placeholder")}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="bg-gray-50 border-transparent focus:bg-white min-h-[100px]"
            />
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24 border-none bg-gray-900 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <h2 className="text-xl font-bold mb-6 relative z-10">{t("checkout.order_summary")}</h2>
            
            <div className="space-y-4 mb-6 relative z-10">
              {validItems.map(item => (
                <div key={item.listing.id} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{item.listing.title}</p>
                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold">
                    {(parseFloat(item.listing.price || "0") * item.quantity).toLocaleString('tr-TR')} {t("common.currency")}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3 relative z-10">
              <div className="flex justify-between text-sm text-gray-400">
                <span>{t("cart.subtotal")}</span>
                <span>{subtotal.toLocaleString('tr-TR')} {t("common.currency")}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>{t("cart.shipping")}</span>
                <span className="text-green-400">{t("cart.free_shipping")}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2">
                <span>{t("cart.total")}</span>
                <span className="text-primary">{total.toLocaleString('tr-TR')} {t("common.currency")}</span>
              </div>
            </div>

            <Button 
              className="w-full mt-8 py-6 text-lg font-bold group relative overflow-hidden" 
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || !effectiveAddressId || !effectiveGatewaySlug}
            >
              {isPlacingOrder ? (
                 <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">{t("checkout.place_order")}</span>
                  <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-gray-500 uppercase tracking-widest font-medium">
              <Info className="h-3 w-3" />
              {t("cart.secure_payment")}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
