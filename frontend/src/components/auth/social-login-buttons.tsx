"use client";

import { useCallback } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useSocialLoginMutation } from "@/modules/auth/auth.service";
import { env } from "@/env.mjs";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface FacebookAuthResponse {
  accessToken: string;
}

interface FacebookLoginResponse {
  authResponse?: FacebookAuthResponse;
}

interface FacebookUserInfo {
  email?: string;
}

interface FacebookSDK {
  init: (config: {
    appId?: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }) => void;
  login: (
    cb: (response: FacebookLoginResponse) => void,
    opts: { scope: string }
  ) => void;
  api: (
    path: string,
    params: { fields: string },
    cb: (userInfo: FacebookUserInfo) => void
  ) => void;
}

declare global {
  interface Window {
    FB?: FacebookSDK;
  }
}

interface Props {
  translations: {
    or: string;
    google: string;
    facebook: string;
    social_error: string;
  };
  showGoogle?: boolean;
  showFacebook?: boolean;
}

interface InnerProps extends Props {
  canUseGoogle: boolean;
  canUseFacebook: boolean;
  onGoogleClick?: () => void;
}

function SocialLoginInner({
  translations: t,
  canUseGoogle,
  canUseFacebook,
  onGoogleClick,
}: InnerProps) {
  const socialLogin = useSocialLoginMutation();
  const facebookAppId = env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  const handleFacebookLogin = useCallback(() => {
    if (!canUseFacebook) return;

    // Load Facebook SDK dynamically
    const fbScript = document.getElementById("facebook-jssdk");
    if (!fbScript) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/tr_TR/sdk.js";
      script.async = true;
      script.defer = true;
      script.onload = () => initFacebookLogin();
      document.body.appendChild(script);
    } else {
      initFacebookLogin();
    }

    function initFacebookLogin() {
      const FB = window.FB;
      if (!FB) return;

      FB.init({
        appId: facebookAppId,
        cookie: true,
        xfbml: false,
        version: "v19.0",
      });

      FB.login(
        (response: FacebookLoginResponse) => {
          if (response.authResponse) {
            const accessToken = response.authResponse.accessToken;
            // Get user email from FB
            FB.api("/me", { fields: "email" }, (userInfo: FacebookUserInfo) => {
              if (userInfo.email) {
                socialLogin.mutate({
                  email: userInfo.email,
                  access_token: accessToken,
                  type: "facebook",
                });
              }
            });
          }
        },
        { scope: "email,public_profile" }
      );
    }
  }, [canUseFacebook, facebookAppId, socialLogin]);

  if (!canUseGoogle && !canUseFacebook) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">{t.or}</span>
        </div>
      </div>

      {socialLogin.isError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {t.social_error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {canUseGoogle && (
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full gap-2"
            onClick={onGoogleClick}
            disabled={socialLogin.isPending}
          >
            <Image
              src="/assets/icons/google.png"
              alt="Google"
              width={18}
              height={18}
              className="h-[18px] w-[18px]"
            />
            {t.google}
          </Button>
        )}

        {canUseFacebook && (
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full gap-2"
            onClick={handleFacebookLogin}
            disabled={socialLogin.isPending}
          >
            <Image
              src="/assets/icons/facebook.png"
              alt="Facebook"
              width={18}
              height={18}
              className="h-[18px] w-[18px]"
            />
            {t.facebook}
          </Button>
        )}
      </div>
    </div>
  );
}

function SocialLoginWithGoogle(props: Props) {
  const socialLogin = useSocialLoginMutation();
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (!tokenResponse.access_token) return;
      const userInfoResp = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }
      );
      const userInfo = await userInfoResp.json();
      if (userInfo?.email) {
        socialLogin.mutate({
          email: userInfo.email,
          access_token: tokenResponse.access_token,
          type: "google",
        });
      }
    },
    onError: () => {
      // Error handled by mutation
    },
    scope: "email profile",
  });

  return (
    <SocialLoginInner
      {...props}
      canUseGoogle={true}
      canUseFacebook={props.showFacebook ?? true}
      onGoogleClick={() => handleGoogleLogin()}
    />
  );
}

export function SocialLoginButtons(props: Props) {
  const googleClientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const canUseGoogle = props.showGoogle ?? true;
  const canUseFacebook = props.showFacebook ?? true;

  if (!canUseGoogle && !canUseFacebook) {
    return null;
  }

  // If Google client ID exists and Google is enabled, use OAuth provider
  if (googleClientId && canUseGoogle) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        <SocialLoginWithGoogle {...props} />
      </GoogleOAuthProvider>
    );
  }

  // Show buttons (Google visible but non-functional without client ID)
  return (
    <SocialLoginInner
      {...props}
      canUseGoogle={canUseGoogle}
      canUseFacebook={canUseFacebook}
    />
  );
}
