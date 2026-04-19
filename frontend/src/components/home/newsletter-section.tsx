"use client";

import { useState } from "react";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";
import { t } from "@/lib/t";

interface Props {
  config?: any;
}

export function NewsletterSection({ config }: Props) {
  const [email, setEmail]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section className="py-12 md:py-16 bg-ivory relative overflow-hidden">
      {/* Editorial Decorative Background */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-saffron opacity-[0.03] skew-x-[-12deg] translate-x-12" />
      
      <div className="container relative px-4">
        <div className="max-w-4xl mx-auto bg-ink rounded-[40px] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12 shadow-3xl">
          
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 mb-6">
               <div className="h-1 w-8 bg-saffron" />
               <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-saffron">Haber Bülteni</span>
            </div>

            <h2 className="font-fraunces text-3xl md:text-5xl font-medium tracking-tight text-paper mb-6 leading-tight">
              {config?.label || "Bölgedeki Fırsatları Kaçırmayın"}
            </h2>
            <p className="text-parchment opacity-60 text-sm md:text-base leading-relaxed font-manrope">
              Yeni ilanlardan, özel hasat dönemlerinden ve Kaman'daki önemli gelişmelerden ilk siz haberdar olun.
            </p>
          </div>

          <div className="w-full lg:w-[400px]">
            {submitted ? (
              <div className="bg-saffron rounded-full py-4 px-8 flex items-center justify-center gap-3 animate-in zoom-in-95 duration-500">
                <CheckCircle className="h-5 w-5 text-ink" />
                <span className="text-ink font-bold text-sm uppercase tracking-widest">Abonelik Tamamlandı</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative group">
                <input
                  type="email"
                  placeholder="E-posta adresiniz..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-5 px-8 text-paper placeholder:text-white/20 focus:outline-none focus:border-saffron focus:bg-white/10 transition-all text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-2 h-[52px] w-[52px] rounded-full bg-saffron text-ink flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-current border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <ArrowRight className="h-6 w-6" />
                  )}
                </button>
              </form>
            )}
            <p className="mt-4 text-[10px] font-mono text-center text-white/30 tracking-widest uppercase italic">
              * Dilediğiniz zaman abonelikten çıkabilirsiniz
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
