# Bhoomi

A blockchain-powered land registry and marketplace for secure ownership, transparent title transfer, and easier land transactions.

![Bhoomi](https://img.shields.io/badge/Bhoomi-Land%20Registry-4f46e5?style=for-the-badge) ![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge) ![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge) ![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge) ![Hardhat](https://img.shields.io/badge/Hardhat-2.28-fff0b3?style=for-the-badge)

## Problem

Land ownership in many regions still depends on fragmented records, manual verification, and paperwork-heavy transfers. This creates several painful problems:

- Buyers and sellers cannot easily verify who legally owns a parcel.
- Authorities and citizens rely on slow, centralized processes that are hard to audit.
- Land records are vulnerable to disputes, forged documents, and inconsistent state across offices.
- The market for buying and selling property is opaque, with limited trust and expensive middlemen.

Bhoomi targets this gap by creating a digital land registry experience where ownership is traceable, verifiable, and more transparent from the first registration to the final transfer.

## Solution

Bhoomi combines a React frontend with a Solidity smart contract to model the land registration workflow on-chain.

### How it works

- Authorities can register land parcels and mint each parcel as a unique NFT representing ownership.
- Each parcel includes metadata such as coordinates and a sale price.
- Buyers can browse a marketplace, view property details, and purchase parcels through a contract-based transfer flow.
- A wallet-connected user experience supports login, KYC, property exploration, and ownership transfer.
- Supabase is used for app data and feature metadata, while the blockchain handles authoritative ownership state.

### Core capabilities

- Land registration and NFT minting
- Marketplace listing and purchase flows
- Property detail pages and map-based exploration
- Authority, seller, and buyer dashboards
- KYC and wallet onboarding flow
- Smart contract-based ownership transfer and settlement logic

### Why this is effective

Instead of relying only on centralized records, Bhoomi puts critical ownership data on a tamper-resistant ledger. This reduces ambiguity, increases trust, and makes the sales process auditable. The front end keeps the experience accessible, while the smart contract enforces ownership rules and transfer conditions.

### Repository structure

- `client/` — React + Vite frontend application
- `client/src/pages/` — route-level screens for auth, dashboards, marketplace, property and map flows
- `client/src/components/` — reusable landing page and UI building blocks
- `client/src/supabase_schema.sql` — Supabase schema and table definitions
- `bhoomi-contracts/` — Hardhat project containing the Solidity contract and deployment scripts
- `bhoomi-contracts/contracts/bhoomi.sol` — ERC721-based land registry contract

## Setup

Bhoomi has two major parts that need to run together:

1. The front-end app in `client/`
2. The blockchain contract project in `bhoomi-contracts/`

### Prerequisites

- Node.js 18+ and npm
- Git
- A wallet such as MetaMask
- A Sepolia RPC endpoint (Alchemy, Infura, or similar)
- A Supabase project for the app data layer
- A private key for contract deployment

### 1) Clone the repository

```bash
git clone https://github.com/19-mohityadav/Bhoomi.git
cd Bhoomi
```

### 2) Install frontend dependencies

```bash
cd client
npm install
```

Create a `.env` file in `client/` with your Supabase configuration:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The app will warn at runtime if these values are missing, and the Supabase client is designed to fail gracefully until they are configured.

### 3) Install contract dependencies

```bash
cd ../bhoomi-contracts
npm install
```

Create a `.env` file in `bhoomi-contracts/` using the example provided:

```bash
cp .env.example .env
```

Then update the values:

```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/your-api-key
PRIVATE_KEY=your-wallet-private-key
```

### 4) Compile and test the smart contract

```bash
npx hardhat compile
npx hardhat test
```

### 5) Start a local blockchain (optional)

For local development you can start a Hardhat node:

```bash
npm run node
```

To deploy locally:

```bash
npm run deploy:local
```

To deploy to Sepolia:

```bash
npm run deploy:sepolia
```

### 6) Run the app locally

From the `client/` directory:

```bash
npm run dev
```

Then open the local URL shown by Vite, typically:

```text
http://localhost:5173
```

### Basic usage

A typical flow in Bhoomi looks like this:

1. Connect your wallet.
2. Register or log in to the app.
3. Complete the onboarding/KYC flow.
4. Open the map or dashboard to browse land parcels.
5. Register a land parcel as an NFT-backed asset.
6. List it for sale or buy a parcel from the marketplace.
7. Confirm the transaction and inspect the updated ownership state.

## Example of the solution in practice

The repo includes concrete implementation evidence for the core flow:

- `bhoomi-contracts/contracts/bhoomi.sol` defines the `Bhoomi` ERC721 contract with `registerLand`, `listLand`, and `buyLand` functions.
- `client/src/routes.jsx` outlines the app flow from landing page to user dashboards and marketplace pages.
- `client/src/pages/MapExplorerPage.jsx` and `client/src/pages/LandRegistrationPage.jsx` implement the geospatial and registration experience.
- `client/src/web3Config.js` wires the frontend to the Sepolia network and contract ABI.

## Notes

- This project is designed as a prototype or MVP for land ownership and marketplace workflows.
- Smart contract deployment requires a funded wallet and valid network credentials.
- To fully use the application in production, you should connect the frontend to a real Supabase backend and deploy the contract to your target network.

## License

No explicit repository license file was found in the root of this project. If you plan to distribute or commercialize this codebase, confirm the license terms before shipping it publicly.
