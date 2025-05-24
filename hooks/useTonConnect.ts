import { useTonAddress, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import type { Sender, SenderArguments } from "ton-core";

export function useTonConnect(): {
    sender: Sender;
    connected: boolean;
    wallet: string | null;
    sendTransaction: (args: SenderArguments) => Promise<string>;
} {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const address = useTonAddress();

    const sendTransaction = async (args: SenderArguments): Promise<string> => {
        console.log("🚀 Starting transaction send process...");
        console.log("Transaction args:", {
            to: args.to.toString(),
            value: args.value.toString(),
            bounce: args.bounce,
        });

        try {
            const result = await tonConnectUI.sendTransaction({
                messages: [
                    {
                        address: args.to.toString(),
                        amount: args.value.toString(),
                        payload: args.body?.toBoc().toString("base64"),
                    },
                ],
                validUntil: Date.now() + 5 * 60 * 1000,
            });

            console.log("✅ Transaction sent to wallet, result:", result);
            return result.boc;
        } catch (error: any) {
            console.error("❌ Transaction failed:", error);

            if (error.message?.includes("User rejects the action")) {
                throw new Error("Transaction was cancelled by user");
            } else if (error.message?.includes("Insufficient funds")) {
                throw new Error("Insufficient funds in wallet");
            } else if (error.message?.includes("Network error")) {
                throw new Error("Network connection error. Please try again.");
            } else if (error.message?.includes("Wallet not connected")) {
                throw new Error("Wallet connection lost. Please reconnect your wallet.");
            } else {
                throw new Error(error.message || "Transaction failed. Please try again.");
            }
        }
    };

    return {
        sender: {
            send: async (args: SenderArguments) => {
                await sendTransaction(args);
            },
        },
        connected: wallet !== null,
        wallet: address || null,
        sendTransaction,
    };
}
