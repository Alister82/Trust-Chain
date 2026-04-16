export async function generateAESKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

export async function encryptFile(file: File | Blob, aesKey: CryptoKey): Promise<Uint8Array> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const buffer = await file.arrayBuffer();
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        buffer
    );
    // Combine IV and Encrypted content
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.length);
    return result;
}

export async function decryptFile(encryptedFile: Uint8Array, aesKey: CryptoKey): Promise<Blob> {
    const iv = encryptedFile.slice(0, 12);
    const data = encryptedFile.slice(12);
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        data
    );
    return new Blob([decrypted], { type: 'application/pdf' });
}

export async function generateRSAKeyPair(): Promise<CryptoKeyPair> {
    return await crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
    );
}

export async function encryptAESKeyAsymmetric(aesKey: CryptoKey, publicKey: CryptoKey): Promise<Uint8Array> {
    const exportedAES = await crypto.subtle.exportKey('raw', aesKey);
    const encryptedKey = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        exportedAES
    );
    return new Uint8Array(encryptedKey);
}

export async function decryptAESKeyAsymmetric(encryptedAesKey: Uint8Array, privateKey: CryptoKey): Promise<CryptoKey> {
    const decryptedRaw = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encryptedAesKey
    );
    return await crypto.subtle.importKey(
        'raw',
        decryptedRaw,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
    );
}

// Helpers for localStorage mock storage
export async function getOrCreateKeyPair(address: string, role: string): Promise<CryptoKeyPair> {
    const priKeyStr = localStorage.getItem(`${role}_priv_${address}`);
    const pubKeyStr = localStorage.getItem(`${role}_pub_${address}`);
    
    if (priKeyStr && pubKeyStr) {
        const priv = await crypto.subtle.importKey('jwk', JSON.parse(priKeyStr), { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['decrypt']);
        const pub = await crypto.subtle.importKey('jwk', JSON.parse(pubKeyStr), { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']);
        return { publicKey: pub, privateKey: priv };
    }

    const keypair = await generateRSAKeyPair();
    const expPriv = await crypto.subtle.exportKey('jwk', keypair.privateKey);
    const expPub = await crypto.subtle.exportKey('jwk', keypair.publicKey);
    
    localStorage.setItem(`${role}_priv_${address}`, JSON.stringify(expPriv));
    localStorage.setItem(`${role}_pub_${address}`, JSON.stringify(expPub));
    
    // Also save public key globally without role for easy access by others
    localStorage.setItem(`pub_${address}`, JSON.stringify(expPub));

    return keypair;
}

export async function getPublicKeyForAddress(address: string): Promise<CryptoKey> {
    const pubKeyStr = localStorage.getItem(`pub_${address}`);
    if (!pubKeyStr) {
        // For MVP simulation: if user hasn't logged in to generate keys, we mock it by generating the entire keypair
        const keypair = await generateRSAKeyPair();
        const expPriv = await crypto.subtle.exportKey('jwk', keypair.privateKey);
        const expPub = await crypto.subtle.exportKey('jwk', keypair.publicKey);
        
        // Save it so the issuer can pick it up when they "log in" later in this same browser
        localStorage.setItem(`issuer_priv_${address}`, JSON.stringify(expPriv));
        localStorage.setItem(`issuer_pub_${address}`, JSON.stringify(expPub));
        localStorage.setItem(`verifier_priv_${address}`, JSON.stringify(expPriv)); // Just in case
        localStorage.setItem(`verifier_pub_${address}`, JSON.stringify(expPub));
        
        localStorage.setItem(`pub_${address}`, JSON.stringify(expPub));
        return keypair.publicKey;
    }
    return await crypto.subtle.importKey('jwk', JSON.parse(pubKeyStr), { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']);
}

// Helper to convert Uint8Array to base64
export function uint8ToBase64(u8Array: Uint8Array): string {
    const binString = Array.from(u8Array, (x) => String.fromCodePoint(x)).join("");
    return btoa(binString);
}

export function base64ToUint8(b64: string): Uint8Array {
    const binString = atob(b64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}
