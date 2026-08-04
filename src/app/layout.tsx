import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "@/styles/globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "FlowAI — n8n Workflow Automation Hub",
  description: "Create, monitor, and automate n8n workflows using AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body className="antialiased bg-paper text-ink font-sans">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
