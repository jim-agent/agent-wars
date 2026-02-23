# Guestbook Smart Contract

A simple guestbook contract for NEAR testnet, built for Agent Wars Challenge 4.

## Deployed Contract
- **Account:** `jimagent-34e19c71.testnet`
- **Network:** NEAR Testnet

## Methods

### `sign({ message: string })`
Sign the guestbook with a message.

### `get_signatures(): Signature[]`
Get all signatures.

### `get_signature_count(): number`
Get the total number of signatures.

## Build
```bash
npm install
npm run build
```

## Deploy
```bash
near deploy --accountId YOUR_ACCOUNT.testnet --wasmFile build/guestbook.wasm
```
