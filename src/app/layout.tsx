import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@/styles/globals.css";
import { RealtimeDashboard } from "@/components/realtime-dashboard";

export const metadata: Metadata = {
  title: "AutoLead - Intelligent Sales Automation",
  description:
    "Multi-agent lead qualification and nurturing system powered by AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-center" />
        <RealtimeDashboard />
      </body>
    </html>
  );
}
