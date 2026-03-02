// src/app/siparis/basarili/page.tsx
"use client";

import React, { useEffect, Suspense } from "react";
import { t } from "@/lib/t";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();
  
  const orderId = searchParams.get("order_id");
  const method = searchParams.get("method");

  useEffect(() => {
    // Clear cart on successful order landing
    clearCart();
  }, [clearCart]);

  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="mb-8 flex justify-center"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
          <CheckCircle2 className="h-24 w-24 text-green-500 relative z-10" />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-extrabold tracking-tight">{t("checkout.success_title")}</h1>
        <p className="text-lg text-gray-500 max-w-md mx-auto">
          {t("checkout.success_message", { number: orderId || "..." })}
        </p>
        
        {method === 'bank_transfer' && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-700 mt-6 max-w-sm mx-auto">
            <p className="font-bold mb-2">Banka Havalesi Bilgileri</p>
            <p>Ziraat Bankası - Orhan Güzel</p>
            <p className="mt-1 font-mono">TR00 0000 0000 0000 0000 0000 00</p>
            <p className="mt-2 text-[11px] opacity-80">Lütfen sipariş numaranızı açıklama kısmına eklemeyi unutmayın.</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-10">
          <Button 
            className="rounded-full px-8 py-6 text-lg h-auto"
            onClick={() => router.push("/")}
          >
            <Home className="mr-2 h-5 w-5" />
            {t("checkout.success_back_home")}
          </Button>
          <Button 
            variant="outline"
            className="rounded-full px-8 py-6 text-lg h-auto"
            onClick={() => router.push("/hesabim/siparislerim")}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            {t("checkout.success_my_orders")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
