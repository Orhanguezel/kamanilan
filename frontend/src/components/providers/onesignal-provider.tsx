"use client";

import { useEffect, useState } from "react";
import OneSignal from "react-onesignal";
import { useAuthStore } from "@/stores/auth-store";

declare global {
  interface Window {
    __onesignalInitialized?: boolean;
  }
}

const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

export function OneSignalProvider() {
  const user = useAuthStore((state) => state.user);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!appId || typeof window === "undefined") return;

    let cancelled = false;
    const currentAppId = appId;

    async function boot() {
      if (window.__onesignalInitialized) {
        if (!cancelled) setIsReady(true);
        return;
      }

      try {
        window.__onesignalInitialized = true;
        await OneSignal.init({
          appId: currentAppId,
          allowLocalhostAsSecureOrigin: process.env.NODE_ENV !== "production",
          serviceWorkerPath: "/OneSignalSDKWorker.js",
        });

        if (!cancelled) setIsReady(true);
      } catch (error) {
        window.__onesignalInitialized = false;
        console.error("OneSignal init failed", error);
      }
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!appId || !isReady) return;

    async function syncIdentity() {
      try {
        if (user?.id) {
          await OneSignal.login(user.id);
          return;
        }

        await OneSignal.logout();
      } catch (error) {
        console.error("OneSignal identity sync failed", error);
      }
    }

    void syncIdentity();
  }, [isReady, user?.id]);

  return null;
}
