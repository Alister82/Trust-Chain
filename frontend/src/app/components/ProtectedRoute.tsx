'use client';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { AppRole } from '../lib/trustRegistry';

export function ProtectedRoute({
  children,
  allowedRoles
}: {
  children: ReactNode;
  allowedRoles?: AppRole[]
}) {
  const { isConnected, isLoadingRole, appRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingRole) {
      if (!isConnected) {
        router.push('/');
      } else if (allowedRoles) {
        const isAuthorized = allowedRoles.includes(appRole);

        if (!isAuthorized) {
          router.push('/access-denied');
        }
      }
    }
  }, [isLoadingRole, isConnected, appRole, router, allowedRoles]);

  if (isLoadingRole) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-[#fbfbfd] dark:bg-black font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-[#0066cc]/10 border-t-[#0066cc] rounded-full animate-spin" />
          <p className="text-[#86868b] font-medium animate-pulse">Establishing Secure Session...</p>
        </div>
      </div>
    );
  }

  const isAuthorized = !allowedRoles || allowedRoles.includes(appRole);

  if (!isConnected || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
