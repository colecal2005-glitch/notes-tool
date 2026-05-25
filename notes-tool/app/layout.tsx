import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Notes Tool — Turn any Substack post into 3 great Notes",
  description: "Paste your post, get 3 Notes in different formats, copy the ones you'd actually publish. $10 for 25 generations.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <header className="absolute top-0 right-0 z-10 p-4">
          {user ? (
            <Link href="/account" className="text-xs text-white/35 hover:text-white/70 transition-colors">
              Account
            </Link>
          ) : (
            <Link href="/login" className="text-xs text-white/35 hover:text-white/70 transition-colors">
              Sign in
            </Link>
          )}
        </header>
        {children}
      </body>
    </html>
  );
}
