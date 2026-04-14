'use client';

import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthContext';
import { mockZkProof, useTrustRegistryReads } from '../../lib/trustRegistry';

export default function VerifierDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={['verifier']}>
            <VerifierDashboard />
        </ProtectedRoute>
    );
}

function VerifierDashboard() {
    const { disconnectWallet } = useAuth();
    const { getCitizenRequests } = useTrustRegistryReads();

    const [citizenDid, setCitizenDid] = useState('');
    const [targetDocumentType, setTargetDocumentType] = useState('Aadhaar Card');
    const [anchoredHash, setAnchoredHash] = useState('');
    const [proof, setProof] = useState('');
    const [status, setStatus] = useState('');

    const requestProof = async () => {
        try {
            if (!citizenDid || !citizenDid.startsWith('0x')) {
                setStatus('Enter valid citizen wallet address (0x...)');
                return;
            }
            
            setStatus('Fetching citizen documents from blockchain...');
            const requests = await getCitizenRequests(citizenDid as `0x${string}`);
            
            // Filter for matching type that is anchored and NOT rejected
            const match = requests.find((req: any) => 
                req.documentType === targetDocumentType && 
                req.isAnchored === true && 
                req.isRejected === false
            );

            if (!match) {
                setStatus(`No approved document of type "${targetDocumentType}" found for this Citizen.`);
                setAnchoredHash('');
                setProof('');
                return;
            }

            const hash = match.documentHash;
            setAnchoredHash(hash);
            const zk = mockZkProof(citizenDid, hash);
            setProof(zk);
            setStatus(`Success: Verified "${targetDocumentType}" against on-chain anchor.`);
        } catch (e: any) {
            setStatus(e?.shortMessage || e?.message || 'Verification failed');
        }
    };

    return (
        <main className="min-h-screen bg-black text-white p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Verifier Portal</h1>
                    <button onClick={disconnectWallet} className="px-4 py-2 rounded bg-white/10">Disconnect</button>
                </div>

                <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm">Citizen DID / Wallet Address</label>
                            <input
                                value={citizenDid}
                                onChange={(e) => setCitizenDid(e.target.value.trim())}
                                placeholder="0x..."
                                className="w-full bg-black border border-white/20 rounded p-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm">Document Type to Verify</label>
                            <select
                                value={targetDocumentType}
                                onChange={(e) => setTargetDocumentType(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded p-2 focus:outline-none focus:border-white/40 appearance-none"
                            >
                                <option value="Aadhaar Card">Aadhaar Card</option>
                                <option value="Driving License">Driving License</option>
                                <option value="Internship Certificate">Internship Certificate</option>
                                <option value="Passport">Passport</option>
                                <option value="Academic Degree">Academic Degree</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={requestProof} className="px-4 py-2 rounded bg-white text-black font-semibold">
                        Request Proof
                    </button>

                    {!!anchoredHash && <p className="text-xs break-all text-green-300">On-chain Anchored Hash: {anchoredHash}</p>}
                    {!!proof && <p className="text-xs break-all text-blue-300">Simulated ZK Proof: {proof}</p>}
                    {!!status && <p className="text-xs text-white/80">{status}</p>}
                </div>
            </div>
        </main>
    );
}
