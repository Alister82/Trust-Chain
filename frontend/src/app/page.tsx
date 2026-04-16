'use client';
import { ShieldCheck, Zap, Globe, Lock } from "lucide-react";
import ConnectButton from "./components/ConnectButton";
import { useAuth } from "./components/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTrustRegistryActions } from "./lib/trustRegistry";
import { ADMIN_ADDRESS, ROLE } from "./lib/contracts";
import { useTrustRegistryReads, useTrustRegistryAdmin } from "./lib/trustRegistry";

export default function Home() {
  const { address, isConnected, appRole, rawRole, isApproved, isLoadingRole, refreshRole } = useAuth();
  const { registerCitizen, applyIssuer, applyVerifier, approveIssuer, approveVerifier, rejectIssuer, rejectVerifier, publicClient } = useTrustRegistryActions();
  const { issuerApps: adminIssuerApps, verifierApps: adminVerifierApps, refetch: refetchAdminApps } = useTrustRegistryAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('');
  const [deptName, setDeptName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'none' | 'citizen' | 'issuer' | 'verifier'>('none');
  const router = useRouter();
  const isAdmin = !!address && address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  useEffect(() => {
    setDeptName('');
  }, [selectedRole]);

  useEffect(() => {
    if (!isConnected || isLoadingRole || isAdmin) return;
    if (appRole === 'citizen') router.push('/dashboard/citizen');
    if (appRole === 'issuer') router.push('/dashboard/issuer');
    if (appRole === 'verifier') router.push('/dashboard/verifier');
  }, [isConnected, isLoadingRole, appRole, isAdmin, router]);

  const runRegistration = async (fn: () => Promise<`0x${string}`>, label: string) => {
    try {
      setIsSubmitting(true);
      setStatus(`Submitting ${label} registration...`);
      const hash = await fn();
      setStatus(`${label} request submitted. Waiting for confirmation...`);
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setStatus(`${label} registered! Redirecting...`);
      setTimeout(() => refreshRole(), 500);
    } catch (e: any) {
      setStatus(e?.shortMessage || e?.message || 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadApplications = async () => {
    if (!isAdmin) return;
    await refetchAdminApps();
  };

  useEffect(() => {
    if (isAdmin) loadApplications();
  }, [isAdmin]);

  const runApproval = async (fn: () => Promise<`0x${string}`>, label: string) => {
    try {
      setIsSubmitting(true);
      setStatus(`Submitting admin approval for ${label}...`);
      const hash = await fn();
      setStatus(`Approval transaction pending...`);
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setStatus(`${label} approved!`);
      await loadApplications();
    } catch (e: any) {
      setStatus(e?.shortMessage || e?.message || 'Approval failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const runRejection = async (fn: () => Promise<`0x${string}`>, label: string) => {
    try {
      setIsSubmitting(true);
      setStatus(`Submitting rejection for ${label}...`);
      const hash = await fn();
      setStatus(`Rejection transaction pending...`);
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setStatus(`${label} rejected.`);
      await loadApplications();
    } catch (e: any) {
      setStatus(e?.shortMessage || e?.message || 'Rejection failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-black font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Background Ambient Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tighter text-white">TRUSTCHAIN</span>
          </div>
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-white/50">
              <a href="#" className="hover:text-white transition-colors">Protocol</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 pt-20">
        <div className="max-w-4xl w-full flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 mb-10 animate-fade-in shadow-2xl">
            <Zap className="w-3 h-3 text-blue-400" />
            <span>Digital Persona v2.0 Ready</span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-8 leading-[0.95]">
            The New Core of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40">
              Digital Identity.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/40 max-w-2xl mb-16 leading-relaxed font-medium">
            Experience absolute cryptographic trust. Secure your documents, prove your identity, and interact with institutional portals using zero-knowledge technology.
          </p>

          {/* CTA Area */}
          <div className="flex flex-col items-center w-full max-w-md space-y-6">
            <div className="w-full transition-transform hover:scale-105 active:scale-95 duration-300">
              <ConnectButton />
            </div>

            {isConnected && !isLoadingRole && appRole === 'none' && rawRole === ROLE.NONE && !isAdmin && (
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-4">
                <p className="text-white font-semibold flex items-center justify-between">
                  Complete Registration
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">Step 2 of 2</span>
                </p>
                
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setSelectedRole('citizen')} 
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${selectedRole === 'citizen' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10'}`}
                  >
                    Citizen
                  </button>
                  <button 
                    onClick={() => setSelectedRole('issuer')} 
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${selectedRole === 'issuer' ? 'bg-white text-black border-white' : 'bg-white/10 text-white/60 border-white/20'}`}
                  >
                    Issuer
                  </button>
                  <button 
                    onClick={() => setSelectedRole('verifier')} 
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${selectedRole === 'verifier' ? 'bg-white text-black border-white' : 'bg-white/10 text-white/60 border-white/20'}`}
                  >
                    Verifier
                  </button>
                </div>

                {(selectedRole === 'issuer' || selectedRole === 'verifier') && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-[10px] uppercase text-white/40 mb-1.5 font-bold tracking-wider">
                      {selectedRole === 'issuer' ? 'Department Name (e.g. Goa RTO)' : 'Organization Name (e.g. HDFC Bank)'}
                    </p>
                    <input 
                      type="text" 
                      placeholder={selectedRole === 'issuer' ? "Enter department name..." : "Enter organization name..."}
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all font-medium"
                    />
                  </div>
                )}

                {selectedRole !== 'none' && (
                  <button 
                    disabled={isSubmitting || (selectedRole === 'issuer' && !deptName)} 
                    onClick={() => {
                      if (selectedRole === 'citizen') runRegistration(registerCitizen, 'Citizen');
                      if (selectedRole === 'issuer') runRegistration(() => applyIssuer(deptName), 'Issuer');
                      if (selectedRole === 'verifier') runRegistration(() => applyVerifier(deptName), 'Verifier');
                    }}
                    className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-30"
                  >
                    {isSubmitting ? 'Processing...' : `Apply as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                  </button>
                )}

                {!!status && <p className="mt-3 text-[10px] text-white/50 text-center uppercase tracking-wider font-bold animate-pulse">{status}</p>}
              </div>
            )}

            {isConnected && !isLoadingRole && rawRole === ROLE.ISSUER && !isApproved && (
              <p className="text-xs text-yellow-300">Issuer application submitted. Awaiting admin approval.</p>
            )}
            {isConnected && !isLoadingRole && rawRole === ROLE.VERIFIER && !isApproved && (
              <p className="text-xs text-yellow-300">Verifier application submitted. Awaiting admin approval.</p>
            )}

            {isConnected && !isLoadingRole && isAdmin && (
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold">Admin Approval Panel</p>
                  <button onClick={loadApplications} className="text-xs px-3 py-1 rounded bg-white/10">Refresh</button>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-2">Issuer Applications</p>
                  {!adminIssuerApps.length ? (
                    <p className="text-xs text-white/50">No pending issuer applications.</p>
                  ) : (
                    <div className="space-y-2">
                      {adminIssuerApps.map((app, i) => (
                        <div key={`${app.addr}-${i}`} className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                          <div className="flex flex-col">
                            <p className="text-xs text-white font-medium">{app.name || 'Unknown Department'}</p>
                            <p className="text-[10px] break-all text-white/40">{app.addr}</p>
                          </div>
                          <button
                            disabled={isSubmitting}
                            onClick={() => runApproval(() => approveIssuer(app.addr), `issuer ${app.name}`)}
                            className="px-3 py-1 rounded bg-white text-black text-xs font-semibold disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            disabled={isSubmitting}
                            onClick={() => runRejection(() => rejectIssuer(app.addr), `issuer ${app.name}`)}
                            className="px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-500 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-2">Verifier Applications</p>
                  {!adminVerifierApps.length ? (
                    <p className="text-xs text-white/50">No pending verifier applications.</p>
                  ) : (
                    <div className="space-y-2">
                      {adminVerifierApps.map((app, i) => (
                        <div key={`${app.addr}-${i}`} className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                          <div className="flex flex-col">
                            <p className="text-xs text-white font-medium">{app.name || 'Unknown Organization'}</p>
                            <p className="text-[10px] break-all text-white/40">{app.addr}</p>
                          </div>
                          <button
                            disabled={isSubmitting}
                            onClick={() => runApproval(() => approveVerifier(app.addr), `verifier ${app.name}`)}
                            className="px-3 py-1 rounded bg-white text-black text-xs font-semibold disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            disabled={isSubmitting}
                            onClick={() => runRejection(() => rejectVerifier(app.addr), `verifier ${app.name}`)}
                            className="px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-500 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4 text-white/30 text-[11px] font-medium uppercase tracking-widest">
              <div className="flex items-center">
                <Globe className="w-3.5 h-3.5 mr-1.5" /> Web3 Native
              </div>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <div className="flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1.5" /> End-to-End Encrypted
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Features Bar */}
      <footer className="py-12 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <FeatureItem title="Phase 1" desc="Registration" />
            <FeatureItem title="Phase 2" desc="Verification" />
            <FeatureItem title="IPFS" desc="Storage" />
          </div>
          <div className="text-[11px] font-bold text-white/20 tracking-widest uppercase">
            © 2026 TrustChain Protocol Labs.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-white uppercase tracking-wider">{title}</span>
      <span className="text-xs text-white/60 font-medium">{desc}</span>
    </div>
  );
}
