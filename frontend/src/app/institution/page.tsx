import { ArrowLeft, Building2, Search, Check, Send } from "lucide-react";
import Link from "next/link";

export default function InstitutionDashboard() {
  return (
    <div className="min-h-[100dvh] bg-[#fbfbfd] dark:bg-black font-sans text-black dark:text-white">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-black/5 dark:border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center text-sm font-medium text-[#86868b] hover:text-black dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Portals
        </Link>
        <div className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-[#008a00]" />
          <span className="font-semibold tracking-tight">Global Bank Portal</span>
        </div>
        <div className="w-20" />
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight mb-3">Onboarding System</h1>
            <p className="text-[#86868b] text-lg font-medium">Verify zero-knowledge cryptographic proofs instantly.</p>
          </div>
          <button className="flex items-center px-6 py-3 bg-[#008a00] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
            <Send className="w-4 h-4 mr-2" /> New Request
          </button>
        </div>

        <div className="bg-white dark:bg-[#1d1d1f] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)] overflow-hidden border border-transparent dark:border-white/5">
          <div className="px-8 py-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-[#fbfbfd] dark:bg-black/40">
            <h3 className="font-semibold">Recent Applicants</h3>
            <div className="flex items-center text-[#86868b] text-sm bg-white dark:bg-[#1d1d1f] px-4 py-2 rounded-full border border-black/5 dark:border-white/10 shadow-sm">
              <Search className="w-4 h-4 mr-2" /> <span className="opacity-70">Search DID...</span>
            </div>
          </div>
          
          <div className="divide-y divide-black/5 dark:divide-white/5">
            <ApplicantRow did="did:dtp:8x...39a" time="2 mins ago" status="verified" reqs="Age, Income" />
            <ApplicantRow did="did:dtp:2c...11f" time="1 hour ago" status="pending" reqs="Identity" />
            <ApplicantRow did="did:dtp:9b...74e" time="3 hours ago" status="verified" reqs="Age, Income, Credit" />
          </div>
        </div>
      </main>
    </div>
  );
}

function ApplicantRow({ did, time, status, reqs }: { did: string, time: string, status: 'verified' | 'pending', reqs: string }) {
  return (
    <div className="px-8 py-6 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group cursor-pointer">
      <div className="flex items-center">
        <div className={`w-2.5 h-2.5 rounded-full mr-5 ${status === 'verified' ? 'bg-[#34c759]' : 'bg-[#ff9500]'}`} />
        <div>
          <div className="font-mono text-sm font-medium">{did}</div>
          <div className="text-xs text-[#86868b] mt-1.5 font-medium">{time}</div>
        </div>
      </div>
      <div className="hidden md:flex items-center px-4 py-2 bg-black/[0.03] dark:bg-white/[0.03] rounded-lg text-[13px] text-[#86868b] font-medium font-mono">
        {reqs}
      </div>
      <div>
        {status === 'verified' ? (
          <span className="flex items-center text-[#34c759] font-semibold text-sm bg-[#34c759]/10 px-3.5 py-1.5 rounded-full">
            <Check className="w-4 h-4 mr-1.5" /> Onboarded
          </span>
        ) : (
          <span className="text-[#ff9500] font-semibold text-sm bg-[#ff9500]/10 px-3.5 py-1.5 rounded-full">
            Awaiting Proof
          </span>
        )}
      </div>
    </div>
  );
}
