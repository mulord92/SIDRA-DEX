# Token verification UI

`TokenVerification.tsx` is a framework-neutral React component for displaying the on-chain status of a token against the DEX TokenRegistry.

Install ethers in the frontend package:

```bash
npm install ethers
```

Example:

```tsx
<TokenVerification
  tokenAddress={address}
  registryAddress={import.meta.env.VITE_TOKEN_REGISTRY}
  rpcUrl={import.meta.env.VITE_RPC_URL}
  chainId={Number(import.meta.env.VITE_CHAIN_ID)}
/>
```

The UI deliberately treats an unregistered address as **UNKNOWN**, regardless of its symbol, logo, or name. Only the registry contract determines whether a token is verified.
