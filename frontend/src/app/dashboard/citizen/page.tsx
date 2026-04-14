'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthContext';
import { hashPdfToBytes32, useTrustRegistryActions, useTrustRegistryReads, useCitizenRequests } from '../../lib/trustRegistry';
import { pinFileToIPFS, getIPFSUrl } from '../../lib/pinata';
import { ExternalLink, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

export default function CitizenDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={['citizen']}>
            <CitizenDashboard />
        </ProtectedRoute>
    );
}

function CitizenDashboard() {
    const { address, disconnectWallet } = useAuth();
    const { requestVerification, publicClient } = useTrustRegistryActions();
    const { issuers } = useTrustRegistryReads();
    const { requests, isLoading: isLoadingRequests, refetch: refetchRequests } = useCitizenRequests(address);
    
    const [selectedIssuer, setSelectedIssuer] = useState<`0x${string}` | ''>('');
    const [documentType, setDocumentType] = useState('Aadhaar Card');
    const [documentHash, setDocumentHash] = useState<`0x${string}` | ''>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [status, setStatus] = useState('');
    const [busy, setBusy] = useState(false);

    const shortAddress = useMemo(() => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''), [address]);

    useEffect(() => {
        if (!selectedIssuer && issuers.length) {
            setSelectedIssuer(issuers[0].addr);
        }
    }, [issuers, selectedIssuer]);

    const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setStatus('Please upload a PDF file only.');
            return;
        }
        const hash = await hashPdfToBytes32(file);
        setDocumentHash(hash);
        setSelectedFile(file);
        setFileName(file.name);
        setStatus('SHA-256 hash generated locally in browser.');
    };

    const submitVerification = async () => {
        if (!documentHash || !selectedIssuer || !selectedFile) {
            setStatus('Select a PDF and an issuer first.');
            return;
        }
        try {
            setBusy(true);
            setStatus('Step 1/2: Uploading document to IPFS (Pinata)...');
            const pinRes = await pinFileToIPFS(selectedFile);
            const ipfsCid = pinRes.IpfsHash;

            setStatus('Step 2/2: Submitting transaction on-chain...');
            const hash = await requestVerification(selectedIssuer, documentHash, ipfsCid, documentType);
            
            setStatus('Waiting for block confirmation...');
            if (publicClient) {
                await publicClient.waitForTransactionReceipt({ hash });
            }
            
            setStatus('Verification request submitted successfully!');
            setSelectedFile(null);
            setFileName('');
            setDocumentHash('');
            setTimeout(() => {
                refetchRequests();
                setStatus('');
            }, 2000);
        } catch (e: any) {
            setStatus(e?.shortMessage || e?.message || 'Transaction failed');
        } finally {
            setBusy(false);
        }
    };

    const getIssuerName = (addr: string) => {
        const issuer = issuers.find(i => i.addr.toLowerCase() === addr.toLowerCase());
        return issuer ? issuer.name : `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <main className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-bold">C</div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Citizen Portal</h1>
                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none mt-1">Status: Registered</p>
                        </div>
                    </div>
                    <button onClick={disconnectWallet} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">
                        Disconnect {shortAddress}
                    </button>
                </div>

                {/* Upload Section */}
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40">Upload Document</h2>
                    
                    <div className="space-y-4">
                        <div className="relative group/file">
                            <input 
                                type="file" 
                                accept="application/pdf" 
                                onChange={onFileUpload} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            />
                            <div className="border-2 border-dashed border-white/10 group-hover/file:border-white/30 transition-all rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 bg-white/[0.02]">
                                <FileText className="w-8 h-8 text-white/20 group-hover/file:text-white/40 transition-all" />
                                <span className="text-sm text-white/40 font-medium">Click to upload or drag & drop PDF</span>
                            </div>
                        </div>

                        {fileName && (
                            <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs text-blue-300 font-mono truncate max-w-[200px]">{fileName}</span>
                                </div>
                                <span className="text-[10px] text-blue-400 font-bold uppercase">Ready</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40">Document Type</label>
                            <div className="relative">
                                <select
                                    value={documentType}
                                    onChange={(e) => setDocumentType(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-white/30 transition-all cursor-pointer appearance-none hover:bg-white/10"
                                >
                                    <option value="Aadhaar Card" className="bg-black">Aadhaar Card</option>
                                    <option value="Driving License" className="bg-black">Driving License</option>
                                    <option value="Internship Certificate" className="bg-black">Internship Certificate</option>
                                    <option value="Passport" className="bg-black">Passport</option>
                                    <option value="Academic Degree" className="bg-black">Academic Degree</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-[10px]">
                                    ▼
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40">Select Approved Authority</label>
                            <div className="relative">
                                <select
                                    value={selectedIssuer}
                                    onChange={(e) => setSelectedIssuer(e.target.value as `0x${string}`)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-white/30 transition-all cursor-pointer appearance-none hover:bg-white/10"
                                >
                                    {!issuers.length && <option value="" className="bg-black">No approved issuers found</option>}
                                    {issuers.map((issuer) => (
                                        <option key={issuer.addr} value={issuer.addr} className="bg-black">
                                            {issuer.name} ({issuer.addr.slice(0, 6)}...{issuer.addr.slice(-4)})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-[10px]">
                                    ▼
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            disabled={busy || !documentHash || !selectedIssuer} 
                            onClick={submitVerification} 
                            className="w-full px-6 py-4 rounded-2xl bg-white text-black font-bold text-sm tracking-[0.2em] uppercase hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-20 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            {busy ? 'Processing...' : 'Request Verification'}
                        </button>
                        {!!status && (
                            <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 animate-pulse">{status}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* My Requests Table */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40">My Requests</h2>
                        <span className="text-[10px] font-bold text-white/20">{requests?.length || 0} Total</span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
                        {isLoadingRequests ? (
                            <div className="p-20 text-center space-y-4">
                                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                                <p className="text-xs text-white/40 font-medium">Synchronizing with Protocol...</p>
                            </div>
                        ) : requests.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Authority</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Type</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Document</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Date</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.05]">
                                        {requests.map((req) => {
                                            const isApproved = req.isAnchored && !req.isRejected;
                                            const isRejected = req.isAnchored && req.isRejected;
                                            const isPending = !req.isAnchored;

                                            return (
                                                <tr key={req.id.toString()} className="hover:bg-white/[0.02] transition-all group">
                                                    <td className="px-6 py-5">
                                                        <span className="text-xs font-semibold text-white/80">{getIssuerName(req.issuer)}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 tracking-wider inline-block">
                                                            {req.documentType}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <a 
                                                            href={getIPFSUrl(req.ipfsHash)} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center space-x-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-all border-b border-blue-400/20"
                                                        >
                                                            <span>View IPFS</span>
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-xs text-white/40 font-medium">
                                                            {new Date(Number(req.timestamp) * 1000).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        {isPending && (
                                                            <div className="flex items-center space-x-2 text-amber-400/80">
                                                                <Clock className="w-3 h-3" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
                                                            </div>
                                                        )}
                                                        {isApproved && (
                                                            <div className="flex items-center space-x-2 text-green-400/80">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">Approved</span>
                                                            </div>
                                                        )}
                                                        {isRejected && (
                                                            <div className="flex items-center space-x-2 text-red-400/80">
                                                                <XCircle className="w-3 h-3" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">Rejected</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-20 text-center space-y-2">
                                <p className="text-sm font-medium text-white/30">No requests found</p>
                                <p className="text-[10px] uppercase font-bold text-white/10 tracking-widest">Submit your first document above</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
