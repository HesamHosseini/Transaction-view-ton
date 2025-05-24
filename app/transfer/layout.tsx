"use client";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import * as React from "react";

const manifestUrl = "https://ton-connect-test.vercel.app/tonconnect-manifest.json";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <TonConnectUIProvider
            manifestUrl={manifestUrl}
            actionsConfiguration={{
                twaReturnUrl: "https://t.me/your_tg_bot",
            }}
        >
            {children}
        </TonConnectUIProvider>
    );
}
