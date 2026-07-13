import type { Metadata } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import Providers from "@/components/Providers";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import "./globals.css";

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Karat Club — Gold that keeps its own hours",
  description:
    "Hand-finished 18k jewelry cast in small runs. Members-first drops. Manila.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body>
        <Providers>
          <SmoothScroll>
            <Navbar />
            <main>{children}</main>
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}
