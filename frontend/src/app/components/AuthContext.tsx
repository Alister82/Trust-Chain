'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { ContractRole, ROLE } from '../lib/contracts';
import { AppRole, roleFromContract, useReadUserRole } from '../lib/trustRegistry';

interface AuthContextType {
    address?: `0x${string}`;
    isConnected: boolean;
    isConnecting: boolean;
    appRole: AppRole;
    rawRole: ContractRole;
    isApproved: boolean;
    isLoadingRole: boolean;
    connectWallet: () => void;
    disconnectWallet: () => void;
    refreshRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { address, isConnected } = useAccount();
    const { connect, isPending } = useConnect();
    const { disconnect } = useDisconnect();

    const { role, isApproved, isLoading, refetch } = useReadUserRole(address);
    const appRole = roleFromContract(role, isApproved);

    const connectWallet = () => {
        connect({ connector: injected() });
    };

    const disconnectWallet = () => disconnect();

    const refreshRole = () => {
        refetch();
    };

    return (
        <AuthContext.Provider
            value={{
                address,
                isConnected,
                isConnecting: isPending,
                appRole,
                rawRole: role as ContractRole,
                isApproved,
                isLoadingRole: isLoading,
                connectWallet,
                disconnectWallet,
                refreshRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}

export const RAW_ROLE = ROLE;
