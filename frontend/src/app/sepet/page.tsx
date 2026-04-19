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
    if (isAuthenticated) updateRemote({ id: propertyId, quantity: newQty });
  };

  const handleRemove = (propertyId: string) => {
    removeLocal(propertyId);
    if (isAuthenticated) deleteRemote(propertyId);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center font-manrope">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-12 flex justify-center"
        >
          <div className="relative h-32 w-32 rounded-full bg-ivory flex items-center justify-center border border-black/5">
            <ShoppingBag className="h-12 w-12 text-walnut/30" />
            <div className="absolute inset-0 border border-saffron/20 rounded-full animate-ping opacity-20" />
          </div>
        </motion.div>
        <h1 className="font-fraunces text-5xl text-ink mb-6 tracking-tight">{t("cart.empty")}</h1>
        <p className="text-walnut/60 mb-12 max-w-sm mx-auto leading-relaxed italic">{t("cart.empty_text")}</p>
        <Link href="/">
          <Button className="btn-editorial px-12 py-7 text-xs">
            {t("cart.continue_shopping")}
            <ArrowRight className="ml-2 h-4 w-4 arrow" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream/30 min-h-screen pb-32 font-manrope">
      <div className="container mx-auto px-4 py-16 lg:py-24 max-w-7xl">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-saffron" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-saffron-2">Alışveriş Çantanız</span>
            </div>
            <h1 className="font-fraunces text-5xl lg:text-6xl text-ink tracking-tighter">
              {t("cart.title")}
            </h1>
          </div>
          <Button 
            variant="ghost" 
            className="text-walnut/50 hover:text-red-500 hover:bg-red-50 font-mono text-[10px] tracking-widest uppercase transition-all"
            onClick={clearCart}
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            {t("cart.clear_cart")}
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 lg:gap-24 items-start">
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {items.filter(i => i.listing).map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-paper/40 border border-black/5 p-6 md:p-8 flex flex-col md:flex-row gap-8 group transition-all duration-500 hover:bg-paper shadow-sm hover:shadow-xl"
                >
                  <div className="relative h-44 w-full md:w-44 shrink-0 overflow-hidden bg-ivory">
                    {item.listing.images?.[0] ? (
                      <Image
                        src={item.listing.images[0]}
                        alt={item.listing.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <ShoppingBag className="h-12 w-12 text-walnut" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <Link href={`/ilan/${item.listing.slug}`}>
                          <h3 className="font-fraunces text-2xl text-ink group-hover:text-saffron-2 transition-colors leading-tight">
                            {item.listing.title}
                          </h3>
                        </Link>
                        <button 
                          onClick={() => handleRemove(item.listing.id)}
                          className="text-walnut/20 hover:text-red-500 transition-colors h-10 w-10 flex items-center justify-center border border-black/5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-walnut/40 mt-3">
                        {item.listing.categories?.name || "Koleksiyon"}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-between items-end gap-6 mt-8">
                      <div className="flex items-center gap-1 bg-ivory/50 p-1 border border-black/5">
                        <button
                          onClick={() => handleUpdateQuantity(item.listing.id, -1)}
                          className="h-10 w-10 flex items-center justify-center hover:bg-white hover:text-saffron-2 transition-all font-bold text-walnut"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-12 text-center font-fraunces text-lg text-ink">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.listing.id, 1)}
                          className="h-10 w-10 flex items-center justify-center hover:bg-white hover:text-saffron-2 transition-all font-bold text-walnut"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-3xl font-fraunces font-medium text-ink">
                        {formatPrice(item.listing.price, item.listing.currency || "TRY")}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="bg-paper p-10 lg:p-12 shadow-2xl relative border-t-2 border-ink">
              <h2 className="font-fraunces text-2xl text-ink mb-10 border-b border-black/5 pb-6">
                {t("cart.summary")}
              </h2>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center text-sm font-medium text-walnut/60">
                  <span>{t("cart.subtotal")}</span>
                  <span className="text-ink">{totalAmount.toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-walnut/60">
                    <Truck className="h-4 w-4" />
                    <span>{t("cart.shipping")}</span>
                  </div>
                  <span className="text-saffron-2 font-bold uppercase tracking-widest text-[10px]">{t("cart.free_shipping")}</span>
                </div>

                <div className="pt-10 mt-10 border-t border-black/5">
                  <div className="flex items-baseline justify-between mb-10">
                    <span className="font-fraunces text-lg text-walnut/50">{t("cart.total_amount")}</span>
                    <div className="text-5xl font-fraunces text-ink tracking-tighter">
                      {totalAmount.toLocaleString("tr-TR")}<span className="text-xl ml-1 font-sans opacity-40 italic">₺</span>
                    </div>
                  </div>

                  <Button 
                    className="btn-editorial w-full py-9 text-xs justify-center shadow-xl hover:shadow-2xl transition-all" 
                    onClick={() => router.push("/odeme")}
                  >
                    <span>{t("cart.checkout")}</span>
                    <ArrowRight className="ml-2 h-4 w-4 arrow" />
                  </Button>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-center gap-3 text-saffron-2 font-mono text-[9px] tracking-[0.2em] font-bold bg-saffron/5 py-4 uppercase border border-saffron/10">
                <ShieldCheck className="h-4 w-4" />
                <span>{t("cart.secure_payment")}</span>
              </div>
            </div>
            
            <Link 
              href="/" 
              className="mt-10 flex items-center justify-center gap-2 text-walnut/40 font-mono text-[10px] tracking-widest uppercase hover:text-saffron-2 transition-all group"
            >
              <ShoppingBag className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
              {t("cart.continue_shopping")}
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
