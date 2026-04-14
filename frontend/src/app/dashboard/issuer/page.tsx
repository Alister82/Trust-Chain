'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthContext';
import { useTrustRegistryActions, useTrustRegistryReads } from '../../lib/trustRegistry';
import { getIPFSUrl } from '../../lib/pinata';

type PendingRequest = {
    id: bigint;
    citizen: `0x${string}`;
    issuer: `0x${string}`;
    documentHash: `0x${string}`;
    ipfsHash: string;
    timestamp: bigint;
    isAnchored: boolean;
    isRejected: boolean;
};

export default function IssuerDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={['issuer']}>
            <IssuerDashboard />
        </ProtectedRoute>
    );
}

function IssuerDashboard() {
    const { address, disconnectWallet } = useAuth();
    const { getIssuerPendingRequests } = useTrustRegistryReads();
    const { signAndAnchor, rejectRequest } = useTrustRegistryActions();

    const [requests, setRequests] = useState<PendingRequest[]>([]);
    const [status, setStatus] = useState('');
    const [busyId, setBusyId] = useState<string>('');

    const loadRequests = async () => {
        if (!address) return;
        const list = await getIssuerPendingRequests(address);
        setRequests(list as unknown as PendingRequest[]);
    };

    useEffect(() => {
        loadRequests();
    }, [address]);

    const approveAndSign = async (req: PendingRequest) => {
        try {
            setBusyId(req.id.toString());
            setStatus(`Request #${req.id.toString()}: asking wallet to sign hash...`);
            await signAndAnchor(req.documentHash, req.citizen);
            setStatus(`Request #${req.id.toString()} anchored on-chain.`);
            await loadRequests();
        } catch (e: any) {
            setStatus(e?.shortMessage || e?.message || 'Anchor failed');
        } finally {
            setBusyId('');
        }
    };

    const handleReject = async (req: PendingRequest) => {
        try {
            setBusyId(req.id.toString());
            setStatus(`Rejecting request #${req.id.toString()}...`);
            await rejectRequest(req.id);
            setStatus(`Request #${req.id.toString()} rejected.`);
            await loadRequests();
        } catch (e: any) {
            setStatus(e?.shortMessage || e?.message || 'Rejection failed');
        } finally {
            setBusyId('');
        }
    };

    return (
        <main className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Issuer Portal</h1>
                    <button onClick={disconnectWallet} className="px-4 py-2 rounded bg-white/10">Disconnect</button>
                </div>

                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold">Pending Verification Requests</h2>
                        <button onClick={loadRequests} className="text-xs px-3 py-1 rounded bg-white/10">Refresh</button>
                    </div>

                    {!requests.length ? (
                        <p className="text-sm text-white/70">No pending requests for this issuer.</p>
                    ) : (
                        <div className="space-y-3">
                            {requests.map((req) => (
                                <div key={req.id.toString()} className="p-4 rounded-lg border border-white/15">
                                    <p className="text-xs text-white/70">Request #{req.id.toString()}</p>
                                    <p className="text-xs break-all mt-1">Citizen: {req.citizen}</p>
                                    <p className="text-xs break-all mt-1 text-green-300">Hash: {req.documentHash}</p>
                                    
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        <a 
                                            href={getIPFSUrl(req.ipfsHash)} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 rounded bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors"
                                        >
                                            View Document
                                        </a>
                                        <button
                                            onClick={() => approveAndSign(req)}
                                            disabled={busyId === req.id.toString()}
                                            className="px-4 py-2 rounded bg-green-600 text-white text-xs font-bold disabled:opacity-50 hover:bg-green-500 transition-colors"
                                        >
                                            {busyId === req.id.toString() ? 'Signing...' : 'Approve & Sign'}
                                        </button>
                                        <button
                                            onClick={() => handleReject(req)}
                                            disabled={busyId === req.id.toString()}
                                            className="px-4 py-2 rounded bg-red-600/20 text-red-500 border border-red-500/20 text-xs font-bold disabled:opacity-50 hover:bg-red-600/30 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!!status && <p className="text-xs mt-4 text-white/80">{status}</p>}
                </div>
            </div>
        </main>
    );
}
