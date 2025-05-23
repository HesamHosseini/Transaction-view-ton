"use client";

import TransactionForm from "@/components/transaction-form";
import TransactionResult from "@/components/transaction-result";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTonConnect } from "@/hooks/useTonConnect";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useState } from "react";

export default function Home() {
    const { connected, wallet, sender } = useTonConnect();
    const [txHash, setTxHash] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    console.log(connected, wallet, sender);
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">TON Testnet Transaction Sender</CardTitle>
                    <CardDescription>Connect your wallet and send test TON coins on the testnet</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-6">
                        <TonConnectButton />

                        {connected ? (
                            <TransactionForm setTxHash={setTxHash} setLoading={setLoading} setError={setError} loading={loading} />
                        ) : (
                            <p className="text-center text-muted-foreground">Please connect your wallet to send a transaction</p>
                        )}

                        {(txHash || error) && <TransactionResult txHash={txHash} error={error} />}
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
