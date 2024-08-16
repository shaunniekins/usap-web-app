import type { Metadata } from "next";
import "./globals.css";
import { LoadingScreen } from "@/components/Loading";

export const metadata: Metadata = {
  title: "Usap",
  description: "Chat with random people",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-[100dvh] flex flex-col items-center bg-theme font-sub">
          <LoadingScreen>{children}</LoadingScreen>
        </main>
      </body>
    </html>
  );
}
