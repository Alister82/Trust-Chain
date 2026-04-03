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
    return (
      <button 
        onClick={() => disconnect()}
        className="bg-slate-800 hover:bg-slate-700 text-white font-mono py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition"
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    );
  }

  const handleConnect = () => {
    console.log("Connect button clicked, available connectors:", connectors);
    const connector = connectors.find((c) => c.id === 'injected') || connectors[0];
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
