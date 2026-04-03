'use client';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useState, useEffect } from 'react';

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isConnected) {
    const did = `did:dtp:${address?.slice(2)}`;
    return (
      <button 
        onClick={() => {
          const did = `did:dtp:${address?.slice(2)}`;
          navigator.clipboard.writeText(did);
          // Optional: use a toast instead of alert for better UI
        }}
        onDoubleClick={() => disconnect()}
        className="bg-slate-800 hover:bg-slate-700 text-white font-mono py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition group relative"
        title="Click to copy DID"
      >
        <span className="opacity-70 text-xs block mb-1">Your DID</span>
        {did.slice(0, 12)}...{did.slice(-4)}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Click to copy / Double click to disconnect
        </div>
      </button>
    );
  }

  const handleConnect = () => {
    console.log("Connect button clicked, available connectors:", connectors);
    const connector = connectors.find((c) => c.id === 'metaMask') || 
                      connectors.find((c) => c.id === 'injected') || 
                      connectors[0];
    if (connector) {
      connect({ connector });
    } else {
      console.error("No connector found");
      alert("No wallet connector found. Please install MetaMask.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button 
        onClick={handleConnect}
        className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition"
      >
        Connect to TrustChain Portal
      </button>
      {error && <p className="text-red-500 text-xs mt-2">{error.message}</p>}
    </div>
  );
}
