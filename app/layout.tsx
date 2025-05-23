"use client";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { Inter } from "next/font/google";
import * as React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// TON Connect manifest URL
const manifestUrl = "https://raw.githubusercontent.com/ton-community/ton-connect-manifest/main/tonconnect-manifest.json";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <TonConnectUIProvider manifestUrl={manifestUrl}>{children}</TonConnectUIProvider>
            </body>
        </html>
    );
}
