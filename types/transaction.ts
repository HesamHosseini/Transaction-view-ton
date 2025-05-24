export interface Transaction {
    hash: string;
    amount: number;
    recipient: string;
    from: string;
    timestamp: number;
    status: "pending" | "confirmed" | "failed";
}
