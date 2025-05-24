"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { Transaction } from "@/types/transaction"
import { Copy, ExternalLink, CheckCircle2, Clock, XCircle } from "lucide-react"
import { useState } from "react"

interface TransactionDetailsDialogProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TransactionDetailsDialog({ transaction, open, onOpenChange }: TransactionDetailsDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
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

  if (!transaction) return null

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                      Transaction Details
                      <Badge className={getStatusColor(transaction.status)}>
                          {getStatusIcon(transaction.status)}
                          {transaction.status}
                      </Badge>
                  </DialogTitle>
                  <DialogDescription>Complete information about your TON transaction</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                  {/* Transaction Overview */}
                  <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Transaction Overview</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Amount</label>
                              <div className="p-3 bg-muted rounded-md">
                                  <span className="text-lg font-mono">{transaction.amount.toFixed(4)} TON</span>
                              </div>
                          </div>

                          <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
                              <div className="p-3 bg-muted rounded-md">
                                  <span className="text-sm">{formatDate(transaction.timestamp)}</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <Separator />

                  {/* Addresses */}
                  <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Addresses</h3>

                      <div className="space-y-4">
                          <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">From</label>
                              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                                  <span className="font-mono text-sm flex-1 break-all">{transaction.from}</span>
                                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(transaction.from, "from")}>
                                      {copiedField === "from" ? (
                                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                                      ) : (
                                          <Copy className="h-4 w-4" />
                                      )}
                                  </Button>
                              </div>
                          </div>

                          <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">To</label>
                              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                                  <span className="font-mono text-sm flex-1 break-all">{transaction.recipient}</span>
                                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(transaction.recipient, "recipient")}>
                                      {copiedField === "recipient" ? (
                                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                                      ) : (
                                          <Copy className="h-4 w-4" />
                                      )}
                                  </Button>
                              </div>
                          </div>
                      </div>
                  </div>

                  <Separator />

                  {/* Transaction Hash */}
                  <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Transaction Hash</h3>
                      <div className="space-y-2">
                          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                              <span className="font-mono text-sm flex-1 break-all">{transaction.hash}</span>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(transaction.hash, "hash")}>
                                  {copiedField === "hash" ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  ) : (
                                      <Copy className="h-4 w-4" />
                                  )}
                              </Button>
                          </div>
                      </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" className="flex-1" asChild>
                          <a
                              href={`https://testnet.tonviewer.com/transaction/${transaction.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                          >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View on TON Explorer
                          </a>
                      </Button>

                      <Button variant="outline" onClick={() => copyToClipboard(transaction.hash, "share")}>
                          {copiedField === "share" ? (
                              <>
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                  Copied!
                              </>
                          ) : (
                              <>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Hash
                              </>
                          )}
                      </Button>
                  </div>
              </div>
          </DialogContent>
      </Dialog>
  );
}
