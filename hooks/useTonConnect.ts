"use client";

import { useTonConnectUI } from "@tonconnect/ui-react";
import type { Sender, SenderArguments } from "ton-core";

export function useTonConnect(): {
    sender: Sender;
    connected: boolean;
    wallet: string | null;
} {
    const [tonConnectUI] = useTonConnectUI();

    return {
        sender: {
            send: async (args: SenderArguments) => {
                // This method handles sending transactions through the connected wallet
                return tonConnectUI.sendTransaction({
                    messages: [
                        {
                            address: args.to.toString(),
                            amount: args.value.toString(),
                            payload: args.body?.toBoc().toString("base64"),
                        },
                    ],
                    validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
                });
            },
        },
        connected: tonConnectUI?.connected ?? false,
        wallet: tonConnectUI?.account?.address || null,
    };
}
