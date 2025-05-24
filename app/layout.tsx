import { Inter } from "next/font/google";
import "./globals.css";

export const metadata = {
    title: "TON Connect Test",
    description: "Test application for TON Connect integration",
    icons: {
        icon: "/favicon.ico",
    },
    themeColor: "#ffffff",
    manifest: "/manifest.json",
    openGraph: {
        title: "TON Connect Test",
        description: "Test application for TON Connect integration",
        images: ["/favicon.ico"],
    },
    "ton:name": "TON Connect Test",
    "ton:icon": "https://ton-connect-test.vercel.app/favicon.ico",
    "ton:manifest_url": "https://ton-connect-test.vercel.app/manifest.json",
};
const inter = Inter({ subsets: ["latin"] });

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
