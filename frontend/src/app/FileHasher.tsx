'use client';
import React, { useState } from 'react';

export default function FileHasher() {
  const [hash, setHash] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // 2. Use the Browser's Native Crypto API to hash it (SHA-256)
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);

    // 3. Convert the buffer to a Hex string for the Blockchain
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    setHash(hashHex);
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-lg border border-slate-700">
      <h2 className="text-xl font-bold mb-4">Step 1: Generate Document Fingerprint</h2>
      <input 
        type="file" 
        onChange={handleFileChange}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
      />
      {hash && (
        <div className="mt-4 p-3 bg-black rounded border border-green-500">
          <p className="text-xs text-green-400 font-mono break-all">
            <strong>Document Hash:</strong> {hash}
          </p>
        </div>
      )}
    </div>
  );
}
