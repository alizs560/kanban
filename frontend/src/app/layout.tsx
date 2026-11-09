import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Vazirmatn } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-vazir",
});

export const metadata: Metadata = {
  title: "LOOM",
  description: "LOOM project board.",
  icons: {
    icon: "/brand/loom-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr" className={`${jakarta.variable} ${vazir.variable} h-full antialiased`}>
      <body className="min-h-full">
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
