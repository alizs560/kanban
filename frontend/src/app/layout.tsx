import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flowboard — Project board",
  description: "A calm, focused board for moving work forward.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
