# TON Testnet Transaction Manager

A Next.js application for managing TON blockchain transactions on testnet with wallet connectivity.

![App Preview](https://via.placeholder.com/800x400.png?text=TON+Transaction+Manager+Preview)

## Features

-   🔐 Wallet connection via TON Connect
-   💸 Send TON transactions on testnet
-   📜 Transaction history tracking
-   🛡️ Secure transaction signing
-   ⏱️ Real-time confirmation tracking
-   🚦 Transaction validation and error handling
-   📱 Progressive Web App (PWA) support
-   🎨 Modern UI with Shadcn components

## Transaction Logic

The application implements a robust transaction pipeline with these key phases:

1. **Validation Phase**

    - Recipient address validation using TON address parser
    - Amount checks (minimum 0.001 TON)
    - Wallet connection verification

2. **Conversion Phase**

    - TON to nanoTON conversion (1 TON = 10⁹ nanoTON)
    - BigInt handling for precise value representation

3. **Transaction Execution**

    ```typescript
    // Example from TransactionForm.tsx
    const amountNano = BigInt(Math.floor(amountValue * 1000000000));
    const result = await tonConnectUI.sendTransaction({
        messages: [
            {
                address: recipientAddress.toString(),
                amount: amountNano.toString(),
            },
        ],
        validUntil: Date.now() + 5 * 60 * 1000,
    });
    ```

4. **Confirmation Tracking**

    - Real-time progress updates (0-100%)
    - Timeout warnings after 50% progress
    - Multiple confirmation sources:
        - TON Viewer API (primary)
        - TON Center API (fallback)

5. **Post-Transaction**
    - Automatic history tracking
    - Transaction hash validation (64-character hex)
    - Blockchain explorer integration (TON Viewer)

**Key Safety Features:**

-   Address format validation using TON Core parser
-   Minimum amount enforcement (0.001 TON)
-   Transaction timeout (5 minutes)
-   Error recovery fallback mechanisms

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/ton-transaction-manager.git
```

2. Install dependencies using pnpm:

```bash
pnpm install
```

2. Update manifest configuration in `app/layout.tsx`:

```typescript
export const metadata = {
    "ton:name": "Your App Name",
    "ton:icon": "https://your-domain.com/favicon.ico",
    "ton:manifest_url": "https://your-domain.com/manifest.json",
};
```

## Running the Application

```bash
pnpm dev
```

## Tech Stack

-   **Framework**: Next.js 15
-   **Blockchain**: TON Protocol
-   **UI Library**: Shadcn UI
-   **State Management**: Zustand
-   **Styling**: Tailwind CSS + Animate
-   **Form Handling**: React Hook Form + Zod
-   **Wallet Integration**: @tonconnect/ui-react
-   **Transaction Core**: @tonconnect/ui-react + ton-core
-   **Network**: TON Viewer API + TON Center API

## Acknowledgments

-   TON Foundation for blockchain infrastructure
-   Vercel for Next.js framework
-   Shadcn UI component library

> **Note**: Default testnet recipient address is `0QCCytZNNfaDihCt8CHdHslT-K4baG6zoPAd_qXyPejZOk-o` - a validated testnet wallet for demonstration purposes.
