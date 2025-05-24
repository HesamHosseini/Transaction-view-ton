"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTonClient } from "@/hooks/useTonClient";
import { useTonConnect } from "@/hooks/useTonConnect";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Address } from "ton-core";

interface TransactionFormProps {
    setTxHash: (hash: string | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    loading: boolean;
}

export default function TransactionForm({ setTxHash, setLoading, setError, loading }: TransactionFormProps) {
    const { sender, connected } = useTonConnect();
    const { client } = useTonClient();

    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("0.01");

    const sendTransaction = async () => {
        if (!connected || !sender) {
            setError("Wallet not connected");
            return;
        }

        setLoading(true);
        setError(null);
        setTxHash(null);

        try {
            debugger;
            // Validate recipient address
            let recipientAddress;
            try {
                recipientAddress = Address.parse(recipient);
            } catch (e) {
                throw new Error("Invalid recipient address");
            }

            // Validate amount
            const amountValue = Number.parseFloat(amount);
            if (isNaN(amountValue) || amountValue <= 0) {
                throw new Error("Invalid amount");
            }

            // Convert TON to nanoTON (1 TON = 10^9 nanoTON)
            const amountNano = BigInt(Math.floor(amountValue * 1000000000));

            // Send the transaction
            const result = await sender.send({
                to: recipientAddress,
                value: amountNano,
                bounce: false,
            });
            console.log({ result });

            // Set the transaction hash
            setTxHash(result.boc);
        } catch (error: any) {
            console.error("Transaction error:", error);
            setError(error.message || "Failed to send transaction");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                    id="recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Enter TON address"
                    disabled={loading}
                />
                <p className="text-xs text-muted-foreground">Default is a test address on TON testnet</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="amount">Amount (TON)</Label>
                <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.01"
                    min="0.001"
                    step="0.001"
                    disabled={loading}
                />
                <p className="text-xs text-muted-foreground">Minimum amount is 0.001 TON</p>
            </div>

            <Button onClick={sendTransaction} disabled={loading || !connected} className="w-full">
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Transaction...
                    </>
                ) : (
                    "Send Transaction"
                )}
            </Button>
        </div>
    );
}
