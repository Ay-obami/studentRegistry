# Student Registry

A beginner-friendly React dApp for registering and reading student records on the Sepolia network.

## Features

- Connect MetaMask and display the complete wallet address.
- Check that the wallet is using Sepolia.
- Register a student's name, age, and course.
- Look up one student by wallet address.
- Load multiple students in one Multicall3 request.

## Requirements

- Node.js 20 or newer
- MetaMask
- Sepolia ETH for registration transactions

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

Useful commands:

```bash
npm test
npm run lint
npm run build
```

## Project structure

```text
src/
├── components/       Page sections and forms
├── hooks/            Wallet and student state
├── utils/            Address and error helpers
├── App.jsx           Page layout and feature flow
├── registry.js       Registry and Multicall3 contract calls
├── index.css         Application styles
└── main.jsx          React entry point
```

## How the blockchain flow works

`useWallet` connects MetaMask and provides an ethers signer. The signer is passed to the functions in `registry.js`.

`registerStudent` sends a transaction to the student registry contract. `getStudent` reads one address directly from that contract.

`getStudents` keeps the assignment-required Multicall3 flow. It:

1. Splits addresses into batches of 100.
2. Encodes one `getStudent` call for each address.
3. Sends the calls to Multicall3 through `aggregate3`.
4. Skips failed calls and decodes successful results.

## Network and contracts

- Network: Sepolia
- Chain ID: `11155111`
- Student registry: `0xa551cb621e1b7b2350049d842bf73C1c4e89a126`
- Multicall3: `0xcA11bde05977b3631167028862bE2a173976CA11`
