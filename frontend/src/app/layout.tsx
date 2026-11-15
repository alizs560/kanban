import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LOOM",
  description: "LOOM project board.",
  icons: {
    icon: "/brand/loom-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased" data-theme="dark">
      <body className="min-h-full locale-fa">
        <script
          dangerouslySetInnerHTML={{
            __html: "document.body.removeAttribute('location')",
          }}
        />
        {children}
      </body>
    </html>
  );
}
