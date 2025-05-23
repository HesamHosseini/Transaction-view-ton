import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface TransactionResultProps {
  txHash: string | null
  error: string | null
}

export default function TransactionResult({ txHash, error }: TransactionResultProps) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (txHash) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Transaction Sent Successfully!</AlertTitle>
        <AlertDescription className="text-green-700">
          <div className="mt-2">
            <p className="font-medium">Transaction Hash:</p>
            <p className="break-all text-xs mt-1">{txHash}</p>
          </div>
          <div className="mt-2">
            <p className="text-xs">
              You can view your transaction on{" "}
              <a
                href={`https://testnet.tonscan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                TON Testnet Explorer
              </a>
            </p>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
