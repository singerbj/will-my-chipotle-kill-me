import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const inter = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Will my Chipotle kill me?",
  description:
    "A very useful application to determine whether or not Al Pastor chicken is on the Chipotle menu - which contains deadly amounts of pineapple.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
