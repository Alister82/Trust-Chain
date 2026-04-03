import { ArrowLeft, Wallet, UploadCloud, Fingerprint, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function WalletDashboard() {
  return (
    <div className="min-h-[100dvh] bg-[#fbfbfd] dark:bg-black font-sans text-black dark:text-white">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-black/5 dark:border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center text-sm font-medium text-[#86868b] hover:text-black dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Portals
        </Link>
        <div className="flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-[#0066cc]" />
          <span className="font-semibold tracking-tight">Smart Wallet</span>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight mb-3">Your Credentials</h1>
          <p className="text-[#86868b] text-lg font-medium">Manage and secure your life's critical documents. Entirely on-device.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* DocStore */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">DocStore Vault</h2>
            <div className="bg-white dark:bg-[#1d1d1f] p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)] border border-transparent dark:border-white/5">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl p-10 text-center mb-6">
                <div className="bg-[#0066cc]/10 p-4 rounded-full mb-4">
                  <UploadCloud className="w-8 h-8 text-[#0066cc]" />
                </div>
                <h3 className="font-semibold mb-2">Upload Document</h3>
                <p className="text-sm text-[#86868b] max-w-xs">PDF will be hashed and encrypted locally before storing on IPFS.</p>
                <button className="mt-6 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:scale-105 transition-transform">
                  Select File
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2">Locally Encrypted</h4>
                <DocItem name="Aadhaar Card" status="Verified" icon={<Fingerprint className="w-4 h-4" />} />
                <DocItem name="Salary Slip" status="Verified" icon={<Lock className="w-4 h-4" />} />
              </div>
            </div>
          </section>

          {/* Proof Requests */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center text-black dark:text-white">
              Pending Requests <span className="ml-3 px-2.5 py-0.5 bg-[#ff3b30] text-white rounded-full text-xs font-bold">1</span>
            </h2>
            <div className="bg-white dark:bg-[#1d1d1f] p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)] border border-transparent dark:border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066cc]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="border border-black/5 dark:border-white/10 rounded-2xl p-5 mb-4 bg-[#fbfbfd] dark:bg-black relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold flex items-center">
                      Global Bank <ShieldCheck className="w-4 h-4 ml-1.5 text-[#0066cc]" />
                    </h3>
                    <p className="text-xs text-[#86868b] mt-0.5">Account Setup • 2 mins ago</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1d1d1f] rounded-xl p-3 text-sm font-mono text-[#86868b] mb-5">
                  <div className="flex items-center text-black dark:text-white mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-[#34c759]" /> Prove: Age {">"} 18
                  </div>
                  <div className="flex items-center text-black dark:text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-[#34c759]" /> Prove: Income {">"} 50k
                  </div>
                </div>
                <button className="w-full py-3 bg-[#0066cc] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
                  Generate ZK-Proof
                </button>
                <div className="mt-3 text-center text-[11px] text-[#86868b] font-medium">
                  Zero-knowledge proof runs entirely on your device. Bank never sees the real data.
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function DocItem({ name, status, icon }: { name: string, status: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-black/5 dark:border-white/10 hover:bg-[#fbfbfd] dark:hover:bg-black/50 transition-colors cursor-default">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-[#0066cc]/10 flex items-center justify-center text-[#0066cc]">
          {icon}
        </div>
        <span className="font-medium text-sm">{name}</span>
      </div>
      <span className="text-xs font-semibold text-[#34c759] bg-[#34c759]/10 px-2.5 py-1 rounded-md">
        {status}
      </span>
    </div>
  );
}
