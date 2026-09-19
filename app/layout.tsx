import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "CreateSoul AI",
  description: "Where ideas become real.",
  applicationName: "CreateSoul AI",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "CreateSoul AI",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#070713",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}