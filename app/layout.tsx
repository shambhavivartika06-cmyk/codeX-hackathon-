import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediMatrix | Scan. Tap. Know when to see a doctor.",
  description:
    "Empathetic health tracking, medication reminders, daily wellness scores, and AI-assisted health guidance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-800 antialiased selection:bg-sky-100 selection:text-sky-900">
        {children}
      </body>
    </html>
  );
}
