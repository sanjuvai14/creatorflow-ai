import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CreatorFlow AI",
  description: "Create. Publish. Grow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}