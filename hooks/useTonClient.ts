"use client";

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { useEffect, useState } from "react";
import { TonClient } from "ton";
import { Address, Cell } from "ton-core";

interface TonViewerTransaction {
    hash: string;
    lt: string;
    account: string;
    success: boolean;
    utime: number;
    orig_status: string;
    end_status: string;
    total_fees: string;
    in_msg?: {
        source?: string;
        destination: string;
        value: string;
        fwd_fee: string;
        ihr_fee: string;
        created_lt: string;
        body_hash: string;
    };
    out_msgs: Array<{
        source: string;
        destination: string;
        value: string;
        fwd_fee: string;
        ihr_fee: string;
        created_lt: string;
        body_hash: string;
    }>;
}

interface TonViewerApiResponse {
    ok: boolean;
    result?: TonViewerTransaction;
    error?: string;
}

export function useTonClient() {
    const [client, setClient] = useState<TonClient | null>(null);

    useEffect(() => {
        async function createClient() {
            try {
                const endpoint = await getHttpEndpoint({ network: "testnet" });
                const tonClient = new TonClient({ endpoint });
                setClient(tonClient);
                console.log("🔗 TON Client connected to:", endpoint);
            } catch (error) {
                console.error("❌ Failed to create TON client:", error);
            }
        }

        createClient();
    }, []);

    const getTransactionHash = async (boc: string): Promise<string> => {
        try {
            console.log("🔍 Computing transaction hash from BOC...");

            if (!boc || typeof boc !== "string") {
                throw new Error("Invalid BOC: BOC must be a non-empty string");
            }

            const cell = Cell.fromBase64(boc);

            const hash = cell.hash().toString("hex");
            console.log("✅ Transaction hash computed:", hash);

            return hash;
        } catch (error) {
            console.error("❌ Failed to compute transaction hash:", error);
            throw new Error(`Failed to compute transaction hash: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    const getTransactionFromTonViewer = async (hash: string): Promise<TonViewerTransaction | null> => {
        try {
            console.log(`🔍 Fetching transaction details from TON Viewer for hash: ${hash}`);

            if (!hash || typeof hash !== "string") {
                throw new Error("Invalid transaction hash");
            }

            const apiUrl = `https://testnet.tonapi.io/v2/blockchain/transactions/${hash}`;

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });

            console.log(`📡 TON Viewer API response status: ${response.status}`);

            if (!response.ok) {
                if (response.status === 404) {
                    console.log("📭 Transaction not found in TON Viewer");
                    return null;
                }
                throw new Error(`TON Viewer API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("✅ Transaction details retrieved from TON Viewer:", data);

            return data;
        } catch (error) {
            console.error("❌ Error fetching from TON Viewer:", error);
            throw error;
        }
    };

    const getTransactionFromTonCenter = async (hash: string): Promise<any> => {
        try {
            console.log(`🔍 Fallback: Fetching transaction from TON Center API for hash: ${hash}`);

            const apiUrl = `https://testnet.toncenter.com/api/v2/getTransactions?address=${hash}&limit=1`;

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`TON Center API error: ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ Fallback transaction data retrieved from TON Center");

            return data.result?.[0] || null;
        } catch (error) {
            console.error("❌ Error fetching from TON Center:", error);
            throw error;
        }
    };

    const waitForTransaction = async (
        address: string,
        hash: string,
        onStatusUpdate?: (status: string, attempt: number, maxAttempts: number) => void
    ): Promise<{ confirmed: boolean; transaction?: any }> => {
        if (!client) {
            throw new Error("TON client not initialized");
        }

        console.log(`⏳ Waiting for transaction ${hash} to be confirmed...`);

        const config = {
            maxAttempts: 60,
            baseDelay: 2000,
            maxDelay: 10000,
            backoffFactor: 1.2,
            transactionLimit: 50,
        };

        let delay = config.baseDelay;

        for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
            try {
                const progress = Math.round((attempt / config.maxAttempts) * 100);
                const statusMessage = `Checking transaction confirmation (${progress}%)`;

                console.log(`🔄 Attempt ${attempt}/${config.maxAttempts} - ${statusMessage}`);
                onStatusUpdate?.(statusMessage, attempt, config.maxAttempts);

                try {
                    const tonViewerTx = await getTransactionFromTonViewer(hash);
                    if (tonViewerTx) {
                        console.log("✅ Transaction confirmed via TON Viewer!");
                        onStatusUpdate?.("Transaction confirmed via TON Viewer!", attempt, config.maxAttempts);
                        return { confirmed: true, transaction: tonViewerTx };
                    }
                } catch (tonViewerError) {
                    console.log("⚠️ TON Viewer check failed, trying other methods...");
                }

                try {
                    const confirmationResult = await checkRecentTransactions(client, address, hash, config.transactionLimit);
                    if (confirmationResult.confirmed) {
                        console.log("✅ Transaction confirmed via TON Client!");
                        onStatusUpdate?.("Transaction confirmed via TON Client!", attempt, config.maxAttempts);
                        return confirmationResult;
                    }
                } catch (clientError) {
                    console.log("⚠️ TON Client check failed...");
                }

                if (attempt % 5 === 0) {
                    try {
                        const tonCenterTx = await getTransactionFromTonCenter(address);
                        if (tonCenterTx && tonCenterTx.transaction_id?.hash === hash) {
                            console.log("✅ Transaction confirmed via TON Center!");
                            onStatusUpdate?.("Transaction confirmed via TON Center!", attempt, config.maxAttempts);
                            return { confirmed: true, transaction: tonCenterTx };
                        }
                    } catch (tonCenterError) {
                        console.log("⚠️ TON Center check failed...");
                    }
                }

                const jitter = Math.random() * 1000;
                delay = Math.min(delay * config.backoffFactor + jitter, config.maxDelay);

                if (attempt % 10 === 0) {
                    onStatusUpdate?.(
                        `Still waiting for confirmation... (${attempt}/${config.maxAttempts} attempts)`,
                        attempt,
                        config.maxAttempts
                    );
                }

                await new Promise((resolve) => setTimeout(resolve, delay));
            } catch (error) {
                console.error(`❌ Error checking transaction (attempt ${attempt}):`, error);

                if (attempt < config.maxAttempts) {
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                }
            }
        }

        console.log("⚠️ Transaction confirmation timeout - performing final checks...");
        onStatusUpdate?.("Confirmation timeout - performing final checks...", config.maxAttempts, config.maxAttempts);

        try {
            const finalTonViewerCheck = await getTransactionFromTonViewer(hash);
            if (finalTonViewerCheck) {
                console.log("✅ Transaction found in final TON Viewer check!");
                return { confirmed: true, transaction: finalTonViewerCheck };
            }

            const finalClientCheck = await checkRecentTransactions(client, address, hash, 100);
            if (finalClientCheck.confirmed) {
                console.log("✅ Transaction found in final client check!");
                return finalClientCheck;
            }
        } catch (error) {
            console.error("❌ Final checks failed:", error);
        }

        return { confirmed: false };
    };

    const checkRecentTransactions = async (
        client: TonClient,
        address: string,
        hash: string,
        limit: number
    ): Promise<{ confirmed: boolean; transaction?: any }> => {
        try {
            console.log(`🔍 Checking recent transactions for address: ${address}`);

            const transactions = await client.getTransactions(Address.parse(address), { limit });

            for (const tx of transactions) {
                const txHash = tx.hash().toString("hex");

                if (
                    txHash === hash ||
                    txHash.toLowerCase() === hash.toLowerCase() ||
                    txHash === hash.replace(/^0x/, "") ||
                    tx.hash().toString("base64") === hash
                ) {
                    console.log(`✅ Found matching transaction: ${txHash}`);
                    return { confirmed: true, transaction: tx };
                }
            }

            console.log("📭 Transaction not found in recent transactions");
            return { confirmed: false };
        } catch (error) {
            console.error("❌ Error in checkRecentTransactions:", error);
            throw error;
        }
    };

    const getTransactionDetails = async (hash: string): Promise<any> => {
        console.log(`🔍 Getting detailed transaction information for: ${hash}`);

        try {
            const tonViewerTx = await getTransactionFromTonViewer(hash);
            if (tonViewerTx) {
                console.log("✅ Transaction details retrieved via TON Viewer");
                return {
                    source: "tonviewer",
                    data: tonViewerTx,
                    url: `https://testnet.tonviewer.com/${hash}`,
                };
            }
        } catch (error) {
            console.log("⚠️ TON Viewer failed, trying fallback methods...");
        }

        try {
            const tonCenterTx = await getTransactionFromTonCenter(hash);
            if (tonCenterTx) {
                console.log("✅ Transaction details retrieved via TON Center");
                return {
                    source: "toncenter",
                    data: tonCenterTx,
                    url: `https://testnet.tonviewer.com/${hash}`,
                };
            }
        } catch (error) {
            console.log("⚠️ TON Center also failed");
        }

        throw new Error("Unable to retrieve transaction details from any source");
    };

    const estimateConfirmationTime = (): { min: number; max: number; average: number } => {
        return {
            min: 5,
            max: 300,
            average: 30,
        };
    };

    const validateTransactionHash = (hash: string): boolean => {
        if (!hash || typeof hash !== "string") {
            return false;
        }

        const hexPattern = /^[a-fA-F0-9]{64}$/;
        return hexPattern.test(hash);
    };

    return {
        client,
        getTransactionHash,
        waitForTransaction,
        getTransactionDetails,
        getTransactionFromTonViewer,
        estimateConfirmationTime,
        validateTransactionHash,
    };
}
