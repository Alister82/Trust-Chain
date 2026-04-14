'use client';
import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#fbfbfd] dark:bg-black p-6 font-sans">
      <div className="w-16 h-16 bg-[#ff3b30]/10 flex items-center justify-center rounded-full mb-8">
        <Lock className="w-8 h-8 text-[#ff3b30]" />
      </div>
      <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-white mb-4">Access Denied</h1>
      <p className="text-xl text-[#86868b] max-w-md text-center mb-12 font-medium">
        Your connected wallet does not have the required permissions to access this portal.
      </p>
      <Link 
        href="/"
        className="flex items-center space-x-2 px-8 py-3 bg-[#0066cc] text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Gateway</span>
      </Link>
    </div>
  );
}
