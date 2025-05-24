"use client";

import type { Transaction } from "@/types/transaction";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TransactionStore {
    transactions: Transaction[];
    addTransaction: (transaction: Transaction) => void;
    clearTransactions: () => void;
    getTransactionByHash: (hash: string) => Transaction | undefined;
}

export const useTransactionStore = create<TransactionStore>()(
    persist(
        (set, get) => ({
            transactions: [],

            addTransaction: (transaction: Transaction) => {
                set((state) => ({
                    transactions: [transaction, ...state.transactions].slice(0, 50),
                }));
            },

            clearTransactions: () => {
                set({ transactions: [] });
            },

            getTransactionByHash: (hash: string) => {
                return get().transactions.find((tx) => tx.hash === hash);
            },
        }),
        {
            name: "ton-transactions",
        }
    )
);
