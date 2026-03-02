import Image from "next/image";
import { Clock, Mail, Phone, Settings } from "lucide-react";

interface MaintenanceData {
  com_maintenance_title: string;
  com_maintenance_description: string;
  com_maintenance_start_date: string | null;
  com_maintenance_end_date: string | null;
  com_maintenance_image: string | null;
  site_title: string;
  site_logo: string | null;
  site_email: string;
  site_phone: string;
}

interface Props {
  data: MaintenanceData;
  locale: string;
}

export function MaintenancePage({ data, locale }: Props) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const startDate = formatDate(data.com_maintenance_start_date);
  const endDate = formatDate(data.com_maintenance_end_date);
  const hasContact = data.site_email || data.site_phone;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      {/* Decorative gears */}
      <div className="pointer-events-none absolute right-[10%] top-[15%] opacity-[0.03]">
        <Settings className="h-72 w-72 animate-[spin_20s_linear_infinite] text-white" />
      </div>
      <div className="pointer-events-none absolute bottom-[10%] left-[5%] opacity-[0.03]">
        <Settings className="h-48 w-48 animate-[spin_15s_linear_infinite_reverse] text-white" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-lg">
        {/* Site logo */}
        <div className="mb-8 flex justify-center">
          {data.site_logo ? (
            <Image
              src={data.site_logo}
              alt={data.site_title}
              width={160}
              height={48}
              className="h-12 w-auto object-contain brightness-0 invert"
              priority
            />
          ) : (
            <span className="text-2xl font-bold text-white">
              {data.site_title}
            </span>
          )}
        </div>

        {/* Maintenance illustration */}
        <div className="mb-10 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-8 rounded-3xl bg-blue-500/10 blur-3xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.com_maintenance_image || "/images/maintenance.svg"}
              alt={data.com_maintenance_title}
              className="relative mx-auto h-auto w-full max-w-[300px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-5 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {data.com_maintenance_title}
        </h1>

        {/* Divider */}
        <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />

        {/* Description */}
        <p className="mb-8 text-center text-base leading-relaxed text-slate-400 sm:text-lg">
          {data.com_maintenance_description}
        </p>

        {/* Date info */}
        {(startDate || endDate) && (
          <div className="mb-8 flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
            <Clock className="h-5 w-5 shrink-0 text-blue-400" />
            <div className="text-sm text-slate-300">
              {startDate && endDate ? (
                <span>
                  {startDate}
                  <span className="mx-2 text-slate-500">&rarr;</span>
                  {endDate}
                </span>
              ) : endDate ? (
                <span>
                  {locale === "tr"
                    ? `Tahmini bitiş: ${endDate}`
                    : `Estimated end: ${endDate}`}
                </span>
              ) : (
                <span>
                  {locale === "tr"
                    ? `Başlangıç: ${startDate}`
                    : `Started: ${startDate}`}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Contact info */}
        {hasContact && (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
            {data.site_email && (
              <a
                href={`mailto:${data.site_email}`}
                className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-blue-400"
              >
                <Mail className="h-4 w-4" />
                {data.site_email}
              </a>
            )}
            {data.site_phone && (
              <a
                href={`tel:${data.site_phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-blue-400"
              >
                <Phone className="h-4 w-4" />
                {data.site_phone}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
