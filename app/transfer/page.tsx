"use client";

import TransactionForm from "@/components/transaction-form";
import TransactionHistory from "@/components/transaction-history";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTonConnect } from "@/hooks/useTonConnect";
import { useTransactionStore } from "@/hooks/useTransactionStore";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useState } from "react";

export default function Home() {
    const tonConnect = useTonConnect();
    const { addTransaction } = useTransactionStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTransactionComplete = (txHash: string, amount: string, recipient: string) => {
        
        addTransaction({
            hash: txHash,
            amount: Number.parseFloat(amount),
            recipient,
            timestamp: Date.now(),
            status: "confirmed",
            from: tonConnect.wallet || "Unknown",
        });
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
            <Card className="w-full max-w-4xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">TON Testnet Transaction Manager</CardTitle>
                    <CardDescription>Connect your wallet and manage TON transactions on the testnet</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-6">
                        <TonConnectButton />

                        {tonConnect.connected ? (
                            <Tabs defaultValue="send" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="send">Send Transaction</TabsTrigger>
                                    <TabsTrigger value="history">Transaction History</TabsTrigger>
                                </TabsList>

                                <TabsContent value="send" className="mt-6">
                                    <TransactionForm
                                        setLoading={setLoading}
                                        setError={setError}
                                        loading={loading}
                                        onTransactionComplete={handleTransactionComplete}
                                    />
                                </TabsContent>

                                <TabsContent value="history" className="mt-6">
                                    <TransactionHistory />
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <p className="text-center text-muted-foreground">Please connect your wallet to access transaction features</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
