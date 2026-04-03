import Link from "next/link";
import { Wallet, Landmark, Building2, ShieldCheck, ChevronRight } from "lucide-react";
import ConnectButton from "./components/ConnectButton";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#fbfbfd] dark:bg-black items-center justify-center font-sans selection:bg-blue-500/30">
      <div className="max-w-5xl w-full px-6 flex flex-col items-center">
        <div className="flex items-center justify-center p-4 bg-blue-500/10 text-blue-500 rounded-full mb-8 shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-black dark:text-white mb-6 text-center">
          Trust, reimagined.
        </h1>
        <p className="text-xl md:text-2xl text-[#86868b] max-w-3xl text-center mb-10 leading-relaxed font-medium">
          The next-generation digital identity protocol. Experience zero-knowledge verification, absolute privacy, and instant cryptographic trust.
        </p>

        <div className="mb-16">
          <ConnectButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <Card 
            href="/wallet" 
            icon={<Wallet className="w-8 h-8" />}
            title="User Wallet"
            desc="Manage your verifiable credentials securely on-device."
            color="text-[#0066cc]"
            bg="bg-[#0066cc]/10"
          />
          <Card 
            href="/issuer" 
            icon={<Landmark className="w-8 h-8" />}
            title="Issuer Portal"
            desc="Sign and anchor document hashes to the blockchain."
            color="text-[#bf4800]"
            bg="bg-[#bf4800]/10"
          />
          <Card 
            href="/institution" 
            icon={<Building2 className="w-8 h-8" />}
            title="Verifier Portal"
            desc="Request and verify zero-knowledge proofs instantly."
            color="text-[#008a00]"
            bg="bg-[#008a00]/10"
          />
        </div>
      </div>
    </div>
  );
}

function Card({ href, icon, title, desc, color, bg }: { href: string, icon: React.ReactNode, title: string, desc: string, color: string, bg: string }) {
  return (
    <Link href={href} className="flex flex-col group p-8 bg-white dark:bg-[#1d1d1f] rounded-[2rem] border border-transparent dark:border-white/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)] transition-all duration-400 ease-out">
      <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-8 ${bg} ${color}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-semibold text-black dark:text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-[#86868b] mb-10 flex-grow leading-relaxed font-medium">{desc}</p>
      <div className="flex items-center text-sm font-semibold text-[#0066cc] dark:text-[#2997ff] group-hover:opacity-80 transition-opacity">
        Enter portal <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
