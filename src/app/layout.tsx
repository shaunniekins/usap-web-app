import type { Metadata } from "next";
import "./globals.css";

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
        <main className="min-h-screen flex flex-col items-center bg-theme font-sub">
          {children}
        </main>
      </body>
    </html>
  );
}
