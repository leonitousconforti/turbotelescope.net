import "@/styles/globals.css";

import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { ReactNode } from "react";
import { Providers } from "./providers";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

const calSans = localFont({
    src: "../assets/cal-sans-semibold.woff2",
    weight: "600",
    display: "swap",
    variable: "--font-cal-sans",
});

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" className={`relative ${inter.variable} ${calSans.variable}`}>
            <body className="relative overflow-x-hidden antialiased font-light bg-white dark:bg-[#09090B] text-zinc-700 dark:text-zinc-300">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
