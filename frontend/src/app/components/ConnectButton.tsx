'use client';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4 bg-slate-800 p-3 rounded-lg border border-slate-600">
        <div className="text-sm font-mono text-green-400">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <button 
          onClick={() => disconnect()}
          className="text-xs bg-red-900 px-2 py-1 rounded hover:bg-red-700 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => connect({ connector: injected() })}
      className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition"
    >
      Connect to TrustChain Portal
    </button>
  );
}
