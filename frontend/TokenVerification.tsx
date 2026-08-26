import React, { useEffect, useState } from "react";

export type VerificationStatus = "UNKNOWN" | "PENDING" | "VERIFIED" | "PAUSED" | "BLACKLISTED";

export interface TokenVerificationProps {
  tokenAddress: string;
  registryAddress: string;
  rpcUrl: string;
  chainId?: number;
}

const ABI = [
  "function getToken(address) view returns (uint8 status,uint8 decimals,string symbol)",
  "function isSupported(address) view returns (bool)"
];

const STATUS: VerificationStatus[] = ["UNKNOWN", "PENDING", "VERIFIED", "PAUSED", "BLACKLISTED"];

export default function TokenVerification({ tokenAddress, registryAddress, rpcUrl, chainId }: TokenVerificationProps) {
  const [status, setStatus] = useState<VerificationStatus>("UNKNOWN");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function verify() {
      setError(""); setStatus("UNKNOWN"); setSymbol(""); setDecimals(null);
      if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) return;
      try {
        const { ethers } = await import("ethers");
        const provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
        const registry = new ethers.Contract(registryAddress, ABI, provider);
        const info = await registry.getToken(tokenAddress);
        if (cancelled) return;
        setStatus(STATUS[Number(info[0])] ?? "UNKNOWN");
        setDecimals(Number(info[1]));
        setSymbol(info[2]);
      } catch (e) {
        if (!cancelled) { setStatus("UNKNOWN"); setError(e instanceof Error ? e.message : "Unable to verify token"); }
      }
    }
    verify();
    return () => { cancelled = true; };
  }, [tokenAddress, registryAddress, rpcUrl, chainId]);

  const styles: Record<string, React.CSSProperties> = {
    card: { border: "1px solid #27272a", borderRadius: 14, padding: 16, background: "#09090b", color: "#fafafa", maxWidth: 520 },
    badge: { display: "inline-flex", padding: "5px 10px", borderRadius: 999, fontWeight: 700, fontSize: 12, background: status === "VERIFIED" ? "#14532d" : status === "PAUSED" ? "#713f12" : "#3f3f46" },
    address: { fontFamily: "monospace", wordBreak: "break-all", opacity: .75, fontSize: 12, marginTop: 10 },
  };

  return <div style={styles.card} aria-label="Token verification">
    <div style={{display:"flex", justifyContent:"space-between", gap:12, alignItems:"center"}}>
      <strong>Token Verification</strong><span style={styles.badge}>{status}</span>
    </div>
    <div style={styles.address}>{tokenAddress || "Enter a token contract address"}</div>
    {symbol && <div style={{marginTop:12}}><b>{symbol}</b>{decimals !== null && <span style={{opacity:.65}}> · {decimals} decimals</span>}</div>}
    {status === "VERIFIED" && <p style={{marginBottom:0, color:"#86efac"}}>✓ Officially supported by this DEX registry.</p>}
    {status === "PAUSED" && <p style={{marginBottom:0}}>⚠ Token is registered but currently paused.</p>}
    {status === "BLACKLISTED" && <p style={{marginBottom:0}}>⛔ Token is explicitly blocked.</p>}
    {(status === "UNKNOWN" || status === "PENDING") && !error && <p style={{marginBottom:0, opacity:.7}}>This token is not verified for official DEX use.</p>}
    {error && <p style={{marginBottom:0}}>{error}</p>}
  </div>;
}
