"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string;
  label?: string;
  breadcrumbs: Breadcrumb[];
  imageUrl?: string | null;
  className?: string;
}

export function PageHeader({
  title,
  description,
  label,
  breadcrumbs,
  imageUrl,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`relative overflow-hidden ${imageUrl ? 'h-[60vh] md:h-[70vh] min-h-[500px]' : 'bg-ink py-16 lg:py-24'} ${className}`}>
      {imageUrl ? (
        <>
          <img src={imageUrl} alt={typeof title === "string" ? title : "Header"} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        </>
      ) : (
        <>
          {/* Newspaper decorative stripes */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-saffron opacity-5 skew-x-[-15deg] translate-x-24" />
          <div className="absolute top-0 right-0 w-1/4 h-full bg-white opacity-5 skew-x-[-15deg] translate-x-32" />
        </>
      )}

      <div className="container relative z-10 h-full flex flex-col justify-end">
        <motion.nav 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40"
        >
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-3">
              {i > 0 && <span className="opacity-20">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-saffron transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-white">{crumb.label}</span>
              )}
            </span>
          ))}
        </motion.nav>

        <div className="flex flex-col items-start translate-y-2">
          {label && (
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-1 rounded-full bg-saffron" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-saffron">{label}</span>
            </div>
          )}
          
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="font-fraunces text-4xl lg:text-8xl font-medium tracking-tight text-white leading-[0.9] max-w-4xl"
          >
            {title}
          </motion.h1>

          {description && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 text-parchment/60 text-sm md:text-lg max-w-2xl leading-relaxed font-manrope"
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-white/5" />
    </div>
  );
}
