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

    // OneSignal app is bound to https://www.kamanilan.com in the OneSignal
    // dashboard. On localhost/dev it throws "Can only be used on: ..." and
    // floods the console — skip entirely off-prod.
    const host = window.location.hostname;
    const isProdHost = host === "www.kamanilan.com" || host === "kamanilan.com";
    if (!isProdHost) return;

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
