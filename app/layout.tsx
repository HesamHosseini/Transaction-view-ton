"use client";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { Inter } from "next/font/google";
import Head from "next/head";
import * as React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// TON Connect configuration
const manifestUrl = "https://ton-connect-test.vercel.app/tonconnect-manifest.json";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <Head>
                <title>TON Connect Test</title>
                <meta name="description" content="Test application for TON Connect integration" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/favicon.ico" />
                <meta name="theme-color" content="#ffffff" />
                <meta property="ton:name" content="TON Connect Test" />
                <meta property="ton:icon" content="https://ton-connect-test.vercel.app/favicon.ico" />
                <meta property="ton:manifest_url" content={manifestUrl} />
            </Head>
            <body className={inter.className}>
                <TonConnectUIProvider
                    manifestUrl={manifestUrl}
                    actionsConfiguration={{
                        twaReturnUrl: "https://t.me/your_tg_bot",
                    }}
                >
                    {children}
                </TonConnectUIProvider>
            </body>
        </html>
    );
}
