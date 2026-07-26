import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "FlowAI — n8n Workflow Automation Hub",
  description: "Crie, monitore e automatize fluxos de trabalho no n8n usando IA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="antialiased bg-slate-950 text-slate-100 font-sans">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
