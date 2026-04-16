'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthContext';
import { useTrustRegistryActions, useTrustRegistryReads } from '../../lib/trustRegistry';
import { getIPFSUrl, pinFileToIPFS } from '../../lib/pinata';
import { decryptAESKeyAsymmetric, decryptFile, getOrCreateKeyPair, base64ToUint8, getPublicKeyForAddress, generateAESKey, encryptFile, encryptAESKeyAsymmetric, uint8ToBase64 } from '../../lib/cryptoUtils';
import { ExternalLink, X } from 'lucide-react';

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
    const [viewingData, setViewingData] = useState<{ pdfUrl: string; photoUrl?: string } | null>(null);

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
            setStatus(`Request #${req.id.toString()}: Fetching and decrypting document for re-encryption...`);
            
            // 1. Fetch encrypted bundle
            const res = await fetch(getIPFSUrl(req.ipfsHash));
            const data = await res.json();

            // 2. Decrypt AES key with Issuer's private key
            const issuerKeys = await getOrCreateKeyPair(address!, 'issuer');
            const myEncAESB64 = data.keys[address!.toLowerCase()];
            if (!myEncAESB64) throw new Error("No issuer key found in bundle");
            
            const aesKey = await decryptAESKeyAsymmetric(base64ToUint8(myEncAESB64), issuerKeys.privateKey);

            // 3. Decrypt file
            const encryptedFile = base64ToUint8(data.encryptedFile);
            const rawBlob = await decryptFile(encryptedFile, aesKey);

            setStatus(`Request #${req.id.toString()}: Re-encrypting exclusively for Citizen to sever access...`);
            // 4. Re-encrypt with new AES key exclusively for Citizen
            const newAesKey = await generateAESKey();
            const newEncryptedFile = await encryptFile(rawBlob, newAesKey);
            const citizenPubKey = await getPublicKeyForAddress(req.citizen);
            const newCitizenEncAES = await encryptAESKeyAsymmetric(newAesKey, citizenPubKey);

            // 5. Build new bundle (NO issuer key, removing issuer access permanently)
            const newPayload = {
                metadata: data.metadata,
                encryptedFile: uint8ToBase64(newEncryptedFile),
                keys: {
                    [req.citizen.toLowerCase()]: uint8ToBase64(newCitizenEncAES)
                }
            };
            const payloadBlob = new Blob([JSON.stringify(newPayload)], { type: 'application/json' });
            const newJsonFile = new File([payloadBlob], 'secured_bundle.json', { type: 'application/json' });

            setStatus(`Request #${req.id.toString()}: Uploading secured version to IPFS...`);
            // 6. Upload new bundle to IPFS
            const pinRes = await pinFileToIPFS(newJsonFile);
            const newCid = pinRes.IpfsHash;

            setStatus(`Request #${req.id.toString()}: asking wallet to sign hash and update CID...`);
            await signAndAnchor(req.documentHash, req.citizen, newCid);
            setStatus(`Request #${req.id.toString()} anchored on-chain with severed access!`);
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

    const handleViewDecrypted = async (req: PendingRequest) => {
        try {
            setBusyId(`view-${req.id.toString()}`);
            setStatus(`Fetching and decrypting request #${req.id.toString()}...`);
            
            const res = await fetch(getIPFSUrl(req.ipfsHash));
            const data = await res.json();
            
            const issuerKeys = await getOrCreateKeyPair(address!, 'issuer');
            const myEncAESB64 = data.keys[address!.toLowerCase()];
            if (!myEncAESB64) throw new Error("No issuer key found in this bundle! Access might be severed.");
            
            const aesKey = await decryptAESKeyAsymmetric(base64ToUint8(myEncAESB64), issuerKeys.privateKey);
            
            // Decrypt PDF
            const pdfBlob = await decryptFile(base64ToUint8(data.encryptedFile), aesKey);
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            // Decrypt Photo (if it exists)
            let photoUrl = undefined;
            if (data.encryptedPhoto) {
                const photoBlob = await decryptFile(base64ToUint8(data.encryptedPhoto), aesKey);
                photoUrl = URL.createObjectURL(photoBlob);
            }
            
            setViewingData({ pdfUrl, photoUrl });
            setStatus('');
        } catch (e: any) {
            console.error(e);
            setStatus(e?.message || 'Failed to decrypt document');
        } finally {
            setBusyId('');
        }
    };

    return (
        <main className="min-h-screen bg-black text-white p-8 relative">
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
                                        <button 
                                            onClick={() => handleViewDecrypted(req)}
                                            disabled={busyId === `view-${req.id.toString()}`}
                                            className="px-4 py-2 rounded bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors flex items-center space-x-2"
                                        >
                                            <span>{busyId === `view-${req.id.toString()}` ? 'Decrypting...' : 'View Document'}</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </button>
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

            {/* Viewer Modal */}
            {viewingData && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-8">
                    <div className="w-full h-full max-w-7xl bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden relative">
                        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/50">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white/60">Secure Document & KYC Viewer</h3>
                            <button onClick={() => setViewingData(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-red-400" />
                            </button>
                        </div>
                        
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {viewingData.photoUrl && (
                                <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white/10 bg-black p-4 flex flex-col space-y-4 overflow-y-auto">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400 text-center">Live KYC Photo</h4>
                                    <div className="aspect-square bg-white/5 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center p-2">
                                        <img src={viewingData.photoUrl} alt="KYC" className="w-full h-full object-cover rounded-lg" />
                                    </div>
                                    <p className="text-[10px] text-white/50 text-center px-4">
                                        Verify that the person in this live photo matches the portrait in the identity document. 
                                        This photo is ephemeral and will be mathematically destroyed upon approval.
                                    </p>
                                </div>
                            )}
                            <div className="flex-1 bg-white">
                                <iframe src={viewingData.pdfUrl} className="w-full h-full border-none" title="Document Viewer" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
