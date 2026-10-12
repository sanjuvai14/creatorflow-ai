"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import {
  AdMob,
  AdmobConsentStatus,
  BannerAdPosition,
  BannerAdSize,
} from "@capacitor-community/admob";

const TEST_BANNER_AD_ID = "ca-app-pub-3940256099942544/6300978111";

export default function NativeAdMobBanner() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let disposed = false;

    async function showFreeUserBanner() {
      const profileResponse = await fetch("/api/profile", { cache: "no-store" });
      if (!profileResponse.ok) return;
      const profile = await profileResponse.json();
      if (disposed || profile?.plan !== "free") return;

      let consent = await AdMob.requestConsentInfo();
      if (
        consent.isConsentFormAvailable &&
        consent.status === AdmobConsentStatus.REQUIRED
      ) {
        consent = await AdMob.showConsentForm();
      }
      if (disposed || !consent.canRequestAds) return;

      await AdMob.initialize();
      if (disposed) return;

      await AdMob.showBanner({
        adId: process.env.NEXT_PUBLIC_ADMOB_BANNER_ID?.trim() || TEST_BANNER_AD_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      });
      document.body.classList.add("native-admob-banner-active");
    }

    void showFreeUserBanner().catch(() => {
      // Ads must never block core app functionality.
    });

    return () => {
      disposed = true;
      document.body.classList.remove("native-admob-banner-active");
      void AdMob.hideBanner().catch(() => undefined);
    };
  }, []);

  return null;
}
