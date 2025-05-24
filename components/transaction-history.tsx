"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTransactionStore } from "@/hooks/useTransactionStore"
import type { Transaction } from "@/types/transaction"
import { ExternalLink, Eye, History } from "lucide-react"
import { useState } from "react"
import TransactionDetailsDialog from "./transaction-details-dialog"

export default function TransactionHistory() {
  const { transactions, clearTransactions } = useTransactionStore()
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDialogOpen(true)
  }

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(4)} TON`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <History className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg mb-2">No Transactions Yet</CardTitle>
          <CardDescription className="text-center">
            Your transaction history will appear here once you send your first transaction.
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  return (
      <>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                      <CardTitle className="flex items-center gap-2">
                          <History className="h-5 w-5" />
                          Transaction History
                      </CardTitle>
                      <CardDescription>
                          {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} found
                      </CardDescription>
                  </div>
                  {transactions.length > 0 && (
                      <Button variant="outline" size="sm" onClick={clearTransactions}>
                          Clear History
                      </Button>
                  )}
              </CardHeader>
              <CardContent>
                  <ScrollArea className="h-[400px] w-full">
                      <div className="space-y-4">
                          {transactions.map((transaction) => (
                              <div
                                  key={transaction.hash}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                  <div className="flex-1 space-y-2 sm:space-y-1">
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                          <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                                          <span className="text-sm text-muted-foreground">{formatDate(transaction.timestamp)}</span>
                                      </div>

                                      <div className="space-y-1">
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                              <span className="text-sm font-medium">Amount:</span>
                                              <span className="font-mono text-sm">{formatAmount(transaction.amount)}</span>
                                          </div>
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                              <span className="text-sm font-medium">To:</span>
                                              <span className="font-mono text-sm">{truncateAddress(transaction.recipient)}</span>
                                          </div>
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                              <span className="text-sm font-medium">Hash:</span>
                                              <span className="font-mono text-xs text-muted-foreground">
                                                  {truncateAddress(transaction.hash)}
                                              </span>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="flex gap-2 mt-3 sm:mt-0">
                                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(transaction)}>
                                          <Eye className="h-4 w-4 mr-1" />
                                          Details
                                      </Button>
                                      <Button variant="outline" size="sm" asChild>
                                          <a
                                              href={`https://testnet.tonviewer.com/transaction/${transaction.hash}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                          >
                                              <ExternalLink className="h-4 w-4 mr-1" />
                                              Explorer
                                          </a>
                                      </Button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </ScrollArea>
              </CardContent>
          </Card>

          <TransactionDetailsDialog transaction={selectedTransaction} open={dialogOpen} onOpenChange={setDialogOpen} />
      </>
  );
}
