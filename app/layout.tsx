import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "CreatorFlow AI",
  description: "Create. Publish. Grow.",
  applicationName: "CreatorFlow AI",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "CreatorFlow AI",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#070b14",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
