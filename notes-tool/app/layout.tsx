import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Note Factory — Turn any Substack post into 3 great Notes",
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
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-white text-neutral-900">
        <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="text-sm font-semibold text-neutral-900 tracking-tight">
              Note Factory
            </Link>
            {user ? (
              <Link href="/account" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                Account
              </Link>
            ) : (
              <Link href="/login" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                Sign in
              </Link>
            )}
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
