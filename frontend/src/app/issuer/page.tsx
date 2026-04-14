'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IssuerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/issuer');
  }, [router]);

  return null;
}
