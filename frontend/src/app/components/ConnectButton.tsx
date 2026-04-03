'use client';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

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

  return (
    <button 
      onClick={() => {
        const connector = connectors[0];
        if (connector) {
          connect({ connector });
        } else {
          alert("No wallet connector found. Please install MetaMask.");
        }
      }}
      className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition"
    >
      Connect to TrustChain Portal
    </button>
  );
}
