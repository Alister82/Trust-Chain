import { useReadContract, useReadContracts, useWriteContract, useAccount, usePublicClient, useSignMessage } from 'wagmi';
import { TRUST_REGISTRY_ABI, TRUST_REGISTRY_ADDRESS, ROLE } from './contracts';
import { keccak256 } from 'viem';

export type AppRole = 'none' | 'citizen' | 'issuer' | 'verifier';

export interface VerificationRequest {
    id: bigint;
    citizen: `0x${string}`;
    issuer: `0x${string}`;
    documentHash: `0x${string}`;
    ipfsHash: string;
    documentType: string;
    timestamp: bigint;
    isAnchored: boolean;
    isRejected: boolean;
}

export function roleFromContract(role: number, isApproved: boolean): AppRole {
    if (role === ROLE.CITIZEN) return 'citizen';
    if (role === ROLE.ISSUER && isApproved) return 'issuer';
    if (role === ROLE.VERIFIER && isApproved) return 'verifier';
    return 'none';
}

export async function hashPdfToBytes32(file: File): Promise<`0x${string}`> {
    const arrayBuffer = await file.arrayBuffer();
    return keccak256(new Uint8Array(arrayBuffer));
}

export function mockZkProof(citizen: string, hash: string): string {
    // Simulated ZK Proof: Just a secondary hash of the data combined with the citizen DID
    return keccak256(new TextEncoder().encode(`zkp-${citizen}-${hash}`));
}

export function useReadUserRole(address?: string) {
    const { data: roleData, isLoading, refetch } = useReadContract({
        address: TRUST_REGISTRY_ADDRESS,
        abi: TRUST_REGISTRY_ABI,
        functionName: 'getUserRole',
        args: address ? [address as `0x${string}`] : undefined,
        query: { enabled: !!address },
    }) as { data: [number, boolean, string] | undefined, isLoading: boolean, refetch: any };

    const [role, isApproved, departmentName] = roleData || [0, false, ''];
    return { role, isApproved, departmentName, isLoading, refetch };
}

export function useTrustRegistryReads() {
    const { data: issuerData } = useReadContract({
        address: TRUST_REGISTRY_ADDRESS,
        abi: TRUST_REGISTRY_ABI,
        functionName: 'getApprovedIssuersDetails',
    }) as { data: { addr: `0x${string}`; name: string }[] | undefined };

    const issuers = issuerData || [];

    const publicClient = usePublicClient();

    return {
        issuers,
        getApprovedIssuers: async () => issuers,
        getIssuerApplications: async () => [], // Admin only
        getVerifierApplications: async () => [], // Admin only
        getIssuerPendingRequests: async (issuer: `0x${string}`) => {
            if (!publicClient) return [];
            return await publicClient.readContract({
                address: TRUST_REGISTRY_ADDRESS,
                abi: TRUST_REGISTRY_ABI,
                functionName: 'getIssuerPendingRequests',
                args: [issuer],
            });
        },
        getAnchoredDocument: async (citizen: `0x${string}`) => {
            if (!publicClient) return null;
            return await publicClient.readContract({
                address: TRUST_REGISTRY_ADDRESS,
                abi: TRUST_REGISTRY_ABI,
                functionName: 'getAnchoredDocument',
                args: [citizen],
            });
        },
        getCitizenRequests: async (citizen: `0x${string}`) => {
            if (!publicClient) return [];
            return await publicClient.readContract({
                address: TRUST_REGISTRY_ADDRESS,
                abi: TRUST_REGISTRY_ABI,
                functionName: 'getCitizenRequests',
                args: [citizen],
            }) as any[];
        }
    };
}

export function useCitizenRequests(citizenAddress?: `0x${string}`) {
    // 1. Get the total count of requests
    const { data: nextRequestId, refetch: refetchCount } = useReadContract({
        address: TRUST_REGISTRY_ADDRESS,
        abi: TRUST_REGISTRY_ABI,
        functionName: 'nextRequestId',
    }) as { data: bigint | undefined, refetch: any };

    const count = Number(nextRequestId || BigInt(0));

    // 2. Prepare batch calls for each request ID
    const calls = Array.from({ length: count }, (_, i) => ({
        address: TRUST_REGISTRY_ADDRESS,
        abi: TRUST_REGISTRY_ABI,
        functionName: 'verificationRequests',
        args: [BigInt(i)],
    }));

    // 3. Perform batch read
    const { data: requestsData, isLoading, refetch: refetchRequests } = useReadContracts({
        contracts: calls,
        query: { enabled: count > 0 },
    });

    const requests = (requestsData || [])
        .map((res: any) => {
            const data = res.result;
            if (!data) return null;
            return {
                id: data[0],
                citizen: data[1],
                issuer: data[2],
                documentHash: data[3],
                ipfsHash: data[4],
                documentType: data[5],
                timestamp: data[6],
                isAnchored: data[7],
                isRejected: data[8],
            } as VerificationRequest;
        })
        .filter((req): req is VerificationRequest => req !== null && req.citizen.toLowerCase() === citizenAddress?.toLowerCase())
        .sort((a, b) => Number(b.timestamp - a.timestamp));

    return { 
        requests, 
        isLoading, 
        refetch: () => {
            refetchCount();
            refetchRequests();
        } 
    };
}

export function useAuth() {
    const { address, isConnected } = useAccount();
    const { role, isApproved, departmentName, isLoading, refetch } = useReadUserRole(address);
    const appRole = roleFromContract(role, isApproved);

    return { 
        address, 
        isConnected, 
        appRole, 
        rawRole: role, 
        isApproved, 
        departmentName, 
        isLoadingRole: isLoading, 
        refreshRole: refetch 
    };
}

export function useTrustRegistryActions() {
    const { writeContractAsync } = useWriteContract();
    const { signMessageAsync } = useSignMessage();
    const publicClient = usePublicClient();

    return {
        publicClient,
        registerCitizen: () =>
            writeContractAsync({
                address: TRUST_REGISTRY_ADDRESS,
                abi: TRUST_REGISTRY_ABI,
                functionName: 'registerCitizen',
            }),
        applyIssuer: (name: string) =>
            writeContractAsync({
                address: TRUST_REGISTRY_ADDRESS,
                abi: TRUST_REGISTRY_ABI,
                functionName: 'applyIssuer',
                args: [name],
            }),
        applyVerifier: (name: string) =>
            writeContractAsync({
                address: TRUST_REGISTRY_ADDRESS,
                abi: TRUST_REGISTRY_ABI,
                functionName: 'applyVerifier',
                args: [name],
            }),
        requestVerification: (issuer: `0x${string}`, documentHash: `0x${string}`, ipfsHash: string, documentType: string) =>
            writeContractAsync({
                address: TRUST_REGISTRY_ADDRESS,
                abi: TRUST_REGISTRY_ABI,
                functionName: 'requestVerification',
                args: [issuer, documentHash, ipfsHash, documentType],
            }),
        rejectRequest: (requestId: bigint) =>
            writeContractAsync({
                address: TRUST_REGISTRY_ADDRESS,
                abi: TRUST_REGISTRY_ABI,
                functionName: 'rejectRequest',
                args: [requestId],
            }),
        approveIssuer: (applicant: `0x${string}`) =>
            writeContractAsync({
                address: TRUST_REGISTRY_ADDRESS,
                abi: TRUST_REGISTRY_ABI,
                functionName: 'approveIssuer',
                args: [applicant],
            }),
        approveVerifier: (applicant: `0x${string}`) =>
            writeContractAsync({
                address: TRUST_REGISTRY_ADDRESS,
                abi: TRUST_REGISTRY_ABI,
                functionName: 'approveVerifier',
                args: [applicant],
            }),
        rejectIssuer: (applicant: `0x${string}`) =>
            writeContractAsync({
                address: TRUST_REGISTRY_ADDRESS,
                abi: TRUST_REGISTRY_ABI,
                functionName: 'rejectIssuer',
                args: [applicant],
            }),
        rejectVerifier: (applicant: `0x${string}`) =>
            writeContractAsync({
                address: TRUST_REGISTRY_ADDRESS,
                abi: TRUST_REGISTRY_ABI,
                functionName: 'rejectVerifier',
                args: [applicant],
            }),
        anchorDocument: (documentHash: `0x${string}`, citizenDid: `0x${string}`, newIPFSCID: string, signature: `0x${string}`) =>
            writeContractAsync({
                address: TRUST_REGISTRY_ADDRESS,
                abi: TRUST_REGISTRY_ABI,
                functionName: 'anchorDocument',
                args: [documentHash, citizenDid, newIPFSCID, signature],
            }),
        signAndAnchor: async (documentHash: `0x${string}`, citizenDid: `0x${string}`, newIPFSCID: string) => {
            const signature = await signMessageAsync({
                message: { raw: documentHash },
            });
            return writeContractAsync({
                address: TRUST_REGISTRY_ADDRESS,
                abi: TRUST_REGISTRY_ABI,
                functionName: 'anchorDocument',
                args: [documentHash, citizenDid, newIPFSCID, signature],
            });
        }
    };
}

export function useTrustRegistryAdmin() {
    const { data: issuerApps, refetch: refetchIssuers } = useReadContract({
        address: TRUST_REGISTRY_ADDRESS,
        abi: TRUST_REGISTRY_ABI,
        functionName: 'getIssuerApplicationDetails',
    }) as { data: { addr: `0x${string}`; name: string }[] | undefined, refetch: any };

    const { data: verifierApps, refetch: refetchVerifiers } = useReadContract({
        address: TRUST_REGISTRY_ADDRESS,
        abi: TRUST_REGISTRY_ABI,
        functionName: 'getVerifierApplicationDetails',
    }) as { data: { addr: `0x${string}`; name: string }[] | undefined, refetch: any };

    return { 
        issuerApps: issuerApps || [], 
        verifierApps: verifierApps || [],
        refetch: () => {
            refetchIssuers();
            refetchVerifiers();
        }
    };
}
