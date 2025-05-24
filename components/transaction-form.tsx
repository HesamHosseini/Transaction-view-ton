"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useTonClient } from "@/hooks/useTonClient";
import { useTonConnect } from "@/hooks/useTonConnect";
import { AlertTriangle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { Address } from "ton-core";

interface TransactionFormProps {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    loading: boolean;
    onTransactionComplete: (txHash: string, amount: string, recipient: string) => void;
}

export default function TransactionForm({ setLoading, setError, loading, onTransactionComplete }: TransactionFormProps) {
    const { sendTransaction, connected, wallet } = useTonConnect();
    const { getTransactionHash, waitForTransaction, estimateConfirmationTime, validateTransactionHash } = useTonClient();

    const [recipient, setRecipient] = useState("0QCCytZNNfaDihCt8CHdHslT-K4baG6zoPAd_qXyPejZOk-o");
    const [amount, setAmount] = useState("0.01");
    const [status, setStatus] = useState<string>("");
    const [txHash, setTxHash] = useState<string | null>(null);
    const [confirmationProgress, setConfirmationProgress] = useState(0);
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState<any>(null);

    const handleStatusUpdate = (statusMessage: string, attempt: number, maxAttempts: number) => {
        setStatus(statusMessage);
        const progress = Math.round((attempt / maxAttempts) * 100);
        setConfirmationProgress(progress);

        if (progress > 50 && !showTimeoutWarning) {
            setShowTimeoutWarning(true);
        }
    };

    const handleSendTransaction = async () => {
        if (!connected || !wallet) {
            setError("Wallet not connected");
            return;
        }

        setLoading(true);
        setError(null);
        setTxHash(null);
        setStatus("Preparing transaction...");
        setConfirmationProgress(0);
        setShowTimeoutWarning(false);
        setTransactionDetails(null);

        try {
            console.log("🚀 Starting transaction process...");

            let recipientAddress;
            try {
                recipientAddress = Address.parse(recipient);
                console.log("✅ Recipient address validated:", recipientAddress.toString());
            } catch (e) {
                throw new Error("Invalid recipient address format");
            }

            const amountValue = Number.parseFloat(amount);
            if (isNaN(amountValue) || amountValue <= 0) {
                throw new Error("Amount must be greater than 0");
            }

            if (amountValue < 0.001) {
                throw new Error("Minimum amount is 0.001 TON");
            }

            const amountNano = BigInt(Math.floor(amountValue * 1000000000));
            console.log("💰 Amount in nanoTON:", amountNano.toString());

            setStatus("Please confirm the transaction in your wallet...");

            const boc = await sendTransaction({
                to: recipientAddress,
                value: amountNano,
                bounce: false,
            });

            console.log("📦 Transaction BOC received:", boc);
            setStatus("Computing transaction hash...");

            const txHash = await getTransactionHash(boc);
            console.log("🔑 Transaction hash:", txHash);

            if (!validateTransactionHash(txHash)) {
                console.warn("⚠️ Transaction hash format seems unusual:", txHash);
            }

            setTxHash(txHash);

            const timeEstimate = estimateConfirmationTime();
            setStatus(`Waiting for blockchain confirmation (estimated ${timeEstimate.average}s)...`);

            const result = await waitForTransaction(wallet, txHash, handleStatusUpdate);

            if (result.confirmed) {
                setStatus("Transaction confirmed successfully!");
                setConfirmationProgress(100);
                setTransactionDetails(result.transaction);
                onTransactionComplete(txHash, amount, recipient);
                console.log("🎉 Transaction successfully completed with hash:", txHash);

                setTimeout(() => {
                    setStatus("");
                    setTxHash(null);
                    setConfirmationProgress(0);
                    setShowTimeoutWarning(false);
                    setTransactionDetails(null);
                }, 8000);
            } else {
                setStatus("Transaction sent but confirmation timed out");
                setConfirmationProgress(100);

                onTransactionComplete(txHash, amount, recipient);

                console.log("⚠️ Transaction confirmation timed out. Hash:", txHash);

                setError(
                    "Transaction was sent but confirmation timed out. " +
                        "This doesn't mean the transaction failed - it may still be processing. " +
                        "Check the transaction on TON Viewer to verify its status."
                );
            }
        } catch (error: any) {
            console.error("❌ Transaction error:", error);

            if (error.message?.includes("cancelled by user")) {
                setError("Transaction was cancelled. You can try again when ready.");
            } else if (error.message?.includes("Insufficient funds")) {
                setError("Insufficient funds in your wallet. Please add more TON and try again.");
            } else if (error.message?.includes("Invalid recipient address")) {
                setError("Please enter a valid TON address.");
            } else if (error.message?.includes("Network")) {
                setError("Network error. Please check your connection and try again.");
            } else if (error.message?.includes("Wallet connection lost")) {
                setError("Wallet disconnected. Please reconnect your wallet and try again.");
            } else if (error.message?.includes("Invalid BOC")) {
                setError("Transaction data error. Please try again.");
            } else {
                setError(error.message || "Transaction failed. Please try again.");
            }

            setStatus("");
            setConfirmationProgress(0);
            setShowTimeoutWarning(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            {status && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <p className="text-sm text-blue-800">{status}</p>
                    </div>

                    {confirmationProgress > 0 && (
                        <div className="space-y-2">
                            <Progress value={confirmationProgress} className="h-2" />
                            <p className="text-xs text-blue-600">Confirmation progress: {confirmationProgress}%</p>
                        </div>
                    )}

                    {status.includes("confirm") && (
                        <p className="text-xs text-blue-600 mt-1">Check your wallet app and approve the transaction to continue.</p>
                    )}
                </div>
            )}

            {showTimeoutWarning && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                            Confirmation is taking longer than usual. This is normal during high network activity.
                        </p>
                    </div>
                </div>
            )}

            {txHash && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-green-800 font-medium">Transaction Sent Successfully!</p>
                    </div>
                    <p className="text-xs text-green-600 mt-1 font-mono">Hash: {txHash.slice(0, 20)}...</p>

                    {transactionDetails && (
                        <div className="mt-2 p-2 bg-green-100 rounded text-xs">
                            <p className="text-green-700">✅ Confirmed on blockchain</p>
                        </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                        <a
                            href={`https://testnet.tonviewer.com/transaction/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-700 underline hover:text-green-800"
                        >
                            View on TON Viewer
                        </a>
                        <Clock className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">Confirmation may take 5-300 seconds</span>
                    </div>
                </div>
            )}

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

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> TON transactions typically confirm within 5-60 seconds, but may take up to 5 minutes during high
                    network activity. Make sure you have enough TON to cover transaction fees.
                </p>
            </div>

            <Button onClick={handleSendTransaction} disabled={loading || !connected} className="w-full">
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {status.includes("confirm") ? "Waiting for wallet confirmation..." : "Processing Transaction..."}
                    </>
                ) : (
                    "Send Transaction"
                )}
            </Button>
        </div>
    );
}
