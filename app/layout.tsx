import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CreatorFlow AI",
  description: "Create. Publish. Grow.",
  applicationName: "CreatorFlow AI",
  manifest: "/manifest.webmanifest",
  themeColor: "#070b14",
  appleWebApp: {
    capable: true,
    title: "CreatorFlow AI",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
