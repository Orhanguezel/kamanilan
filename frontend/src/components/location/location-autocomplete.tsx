"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MapPin, Loader2 } from "lucide-react";
import { env } from "@/env.mjs";

export interface ResolvedLocation {
  city: string;
  district: string;
  address: string;
  lat: number | null;
  lng: number | null;
}

interface Props {
  onChange: (loc: ResolvedLocation) => void;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string;
}

/**
 * Google Places (New) Autocomplete. When a user picks a place:
 *   - address:  formatted_address
 *   - city:     administrative_area_level_1 (e.g. Kırşehir)
 *   - district: administrative_area_level_2 OR locality (Kaman, Mucur)
 *   - lat/lng:  geometry.location
 *
 * Country is restricted to TR. Key is read from NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 */
export function LocationAutocomplete({
  onChange,
  placeholder = "Konum ara (örn. Kaman, Kırşehir)",
  disabled,
  defaultValue = "",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Google Maps anahtarı yapılandırılmamış.");
      setLoading(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let autocomplete: any;

    setOptions({
      key: apiKey,
      v: "weekly",
      language: "tr",
      region: "TR",
    });

    importLibrary("places")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((places: any) => {
        if (!inputRef.current) return;

        autocomplete = new places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "tr" },
          fields: ["address_components", "formatted_address", "geometry", "name"],
          types: ["geocode"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete?.getPlace();
          if (!place) return;

          const components: Array<{ types: string[]; long_name: string }> =
            place.address_components ?? [];
          const pick = (type: string) =>
            components.find((c) => c.types.includes(type))?.long_name ?? "";

          const city =
            pick("administrative_area_level_1") || pick("administrative_area_level_2") || "";
          const district =
            pick("administrative_area_level_2") || pick("locality") || pick("sublocality") || "";
          const address = place.formatted_address ?? place.name ?? "";
          const loc = place.geometry?.location;
          const lat = loc && typeof loc.lat === "function" ? loc.lat() : null;
          const lng = loc && typeof loc.lng === "function" ? loc.lng() : null;

          onChange({ city, district, address, lat, lng });
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error("Google Places load failed", err);
        setError("Konum servisi yüklenemedi.");
        setLoading(false);
      });

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = (window as any).google;
      if (autocomplete && g?.maps?.event) {
        g.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [onChange]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-walnut">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
      </div>
      <input
        ref={inputRef}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled || loading || !!error}
        className="w-full bg-white border-2 border-line rounded-2xl h-12 pl-12 pr-5 text-sm font-medium outline-none focus:border-saffron transition-colors disabled:opacity-60"
      />
      {error && (
        <p className="mt-2 text-[11px] font-mono text-danger ml-1">{error}</p>
      )}
    </div>
  );
}
