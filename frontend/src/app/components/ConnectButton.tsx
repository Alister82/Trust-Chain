'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, Download, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function ConnectButton() {
  const { address, isConnected, isConnecting, connectWallet, disconnectWallet } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Authorized Wallet</span>
          <span className="text-sm font-mono text-white/90">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
        <button
          onClick={disconnectWallet}
          className="w-10 h-10 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-xl flex items-center justify-center transition-all group"
          title="Disconnect Wallet"
        >
          <LogOut className="w-5 h-5 text-white/40 group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    );
  }

  // Find the injected connector (Metamask etc)
  const hasInjected = typeof window !== 'undefined' && !!(window as any).ethereum;

  return (
    <div className="flex flex-col items-center w-full max-w-sm">
      {hasInjected ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full h-14 bg-white text-black font-bold rounded-2xl flex items-center justify-center space-x-3 hover:bg-white/90 active:scale-95 transition-all shadow-2xl shadow-white/5 disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying Connection...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>Enter TrustChain Portal</span>
            </>
          )}
        </button>
      ) : (
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-14 bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold rounded-2xl flex items-center justify-center space-x-3 hover:bg-white/10 active:scale-95 transition-all group"
        >
          <Download className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
          <span>Install MetaMask Extension</span>
        </a>
      )}

      {/* Improved Error Handling */}
      {!hasInjected && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div className="text-[11px] text-red-400 font-medium leading-relaxed">
            Wallet provider not detected. Install MetaMask and refresh.
          </div>
        </div>
      )}

      {!hasInjected && (
        <p className="mt-4 text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] text-center">
          A Web3 provider is required to interact with the blockchain.
        </p>
      )}
    </div>
  );
}

// Internal Icon for convenience
function LogOut(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}
