import { ArrowLeft, Landmark, FileText, Anchor, Shield } from "lucide-react";
import Link from "next/link";

export default function IssuerDashboard() {
  return (
    <div className="min-h-[100dvh] bg-[#fbfbfd] dark:bg-black font-sans text-black dark:text-white">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-black/5 dark:border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center text-sm font-medium text-[#86868b] hover:text-black dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Portals
        </Link>
        <div className="flex items-center space-x-2">
          <Landmark className="w-5 h-5 text-[#bf4800]" />
          <span className="font-semibold tracking-tight">Issuer Command</span>
        </div>
        <div className="w-20" />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight mb-3">Verification Queue</h1>
          <p className="text-[#86868b] text-lg font-medium">Review documents and anchor cryptographic trust.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1d1d1f] p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)] border border-transparent dark:border-white/5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold tracking-widest text-[#bf4800] uppercase mb-1 block">Pending Verification</span>
                <h2 className="text-2xl font-semibold tracking-tight">User Hash Submission</h2>
              </div>
              <span className="text-xs font-mono bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-md text-[#86868b] font-medium">Id: ux_9982</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-[#fbfbfd] dark:bg-black rounded-2xl border border-black/5 dark:border-white/10">
                <div className="flex items-center text-sm text-[#86868b] mb-2 font-medium">
                  <FileText className="w-4 h-4 mr-2" /> Original Document
                </div>
                <div className="font-medium">Salary Slip (Sep 2025).pdf</div>
              </div>
              <div className="p-4 bg-[#fbfbfd] dark:bg-black rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">
                <div className="flex items-center text-sm text-[#86868b] mb-2 font-medium">
                  <Shield className="w-4 h-4 mr-2 text-black dark:text-white" /> SHA-256 Hash
                </div>
                <div className="font-mono text-sm truncate text-[#86868b]">0x9d7a...4b1f8e2c</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button className="flex-1 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-semibold hover:opacity-80 transition-opacity flex items-center justify-center">
                <Anchor className="w-4 h-4 mr-2" /> Sign & Anchor to Blockchain
              </button>
              <button className="px-8 py-3.5 border border-black/10 dark:border-white/20 rounded-full text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                Reject
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
