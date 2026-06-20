import type { Metadata } from "next";
import {
  Inter,
  Playfair_Display,
  Lora,
  Outfit,
  Roboto_Mono,
} from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Kişisel",
  description: "Your personalized daily newspaper.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${lora.variable} ${outfit.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
