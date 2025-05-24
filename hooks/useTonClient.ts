"use client";

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { useEffect, useState } from "react";
import { TonClient } from "ton";

export function useTonClient() {
    const [client, setClient] = useState<TonClient | null>(null);

    useEffect(() => {
        async function createClient() {
            try {
                // Initialize TON client with testnet endpoint
                const endpoint = await getHttpEndpoint({ network: "testnet" });
                const tonClient = new TonClient({ endpoint });
                setClient(tonClient);
            } catch (error) {
                console.error("Failed to create TON client:", error);
            }
        }

        createClient();
    }, []);

    return {
        client,
    };
}
