"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { t } from "@/lib/t";
import { Button } from "@/components/ui/button";
import { useCartSync, useUpdateCartItemMutation, useDeleteCartItemMutation } from "@/modules/cart/cart.service";
import { useAuthStore } from "@/stores/auth-store";
import { motion, AnimatePresence } from "framer-motion";

function formatPrice(price: string | null, currency: string): string {
  if (!price || price === "0") return t("listing.free");
  const num = parseFloat(price);
  if (isNaN(num)) return t("listing.free");
  return `${num.toLocaleString("tr-TR")} ${currency === "TRY" ? "₺" : currency}`;
}

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem: removeLocal, updateQuantity: updateLocal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  const { mutate: updateRemote } = useUpdateCartItemMutation();
  const { mutate: deleteRemote } = useDeleteCartItemMutation();

  // Sync with backend if logged in
  useCartSync();

  const totalAmount = items.reduce((acc, item) => {
    return acc + (parseFloat(item.listing?.price || "0") * item.quantity);
  }, 0);

  const handleUpdateQuantity = (propertyId: string, diff: number) => {
    const item = items.find((i) => i.id === propertyId);
    if (!item) return;

    const newQty = item.quantity + diff;
    if (newQty < 1) return;

    updateLocal(propertyId, newQty);
    if (isAuthenticated) {
      updateRemote({ id: propertyId, quantity: newQty });
    }
  };

  const handleRemove = (propertyId: string) => {
    removeLocal(propertyId);
    if (isAuthenticated) {
      deleteRemote(propertyId);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <ShoppingBag className="h-24 w-24 text-slate-300 relative z-10" />
          </div>
        </motion.div>
        <h1 className="text-4xl font-black text-slate-900 mb-4">{t("cart.empty")}</h1>
        <p className="text-slate-500 mb-10 max-w-md mx-auto">{t("cart.empty_text")}</p>
        <Link href="/">
          <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold">
            {t("cart.continue_shopping")}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">
              {t("cart.title")}
            </h1>
            <p className="text-slate-500 font-medium">
              {t("cart.items_in_cart", { count: items.length })}
            </p>
          </div>
          <Button 
            variant="ghost" 
            className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold"
            onClick={clearCart}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("cart.clear_cart")}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.filter(i => i.listing).map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex gap-6 group hover:shadow-md transition-all"
                >
                  <div className="relative h-32 w-32 shrink-0 rounded-2xl overflow-hidden bg-slate-50">
                    {item.listing.images?.[0] ? (
                      <Image
                        src={item.listing.images[0]}
                        alt={item.listing.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-10 w-10 text-slate-200" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link href={`/ilan/${item.listing.slug}`}>
                          <h3 className="text-xl font-bold text-slate-900 hover:text-primary transition-colors line-clamp-1">
                            {item.listing.title}
                          </h3>
                        </Link>
                        <button 
                          onClick={() => handleRemove(item.listing.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                        {item.listing.categories?.name}
                      </p>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                        <button
                          onClick={() => handleUpdateQuantity(item.listing.id, -1)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all font-bold"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-black text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.listing.id, 1)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all font-bold"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {formatPrice(item.listing.price, item.listing.currency || "TRY")}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full -ml-16 -mb-16 blur-3xl" />

              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
                {t("cart.summary")}
              </h2>
              
              <div className="space-y-5">
                <div className="flex justify-between items-center text-slate-500 font-medium">
                  <span>{t("cart.subtotal")} ({t("cart.item_count", { count: items.length })})</span>
                  <span className="text-slate-900">{totalAmount.toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>{t("cart.shipping")}</span>
                  </div>
                  <span className="text-teal-600 font-bold">{t("cart.free_shipping")}</span>
                </div>

                <div className="h-px bg-slate-100 my-6" />

                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">{t("cart.total_amount")}</span>
                    <div className="text-4xl font-black text-slate-900 leading-none mt-1">
                      {totalAmount.toLocaleString("tr-TR")}<span className="text-xl ml-1">₺</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full mt-8 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all group" 
                  size="lg"
                  onClick={() => router.push("/odeme")}
                >
                  {t("cart.checkout")}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-teal-600 font-bold text-sm bg-teal-50 py-3 rounded-xl border border-teal-100/50">
                <ShieldCheck className="h-4 w-4" />
                <span>{t("cart.secure_payment")}</span>
              </div>
            </div>
            
            <Link href="/" className="mt-6 flex items-center justify-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors">
              <ShoppingBag className="h-4 w-4" />
              {t("cart.continue_shopping")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
