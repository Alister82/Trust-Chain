export const pinFileToIPFS = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const metadata = JSON.stringify({
            name: file.name,
        });
        formData.append('pinataMetadata', metadata);

        const options = JSON.stringify({
            cidVersion: 0,
        });
        formData.append('pinataOptions', options);

        // Conditional Authentication Headers
        const headers: Record<string, string> = {};
        const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
        const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
        const apiSecret = process.env.NEXT_PUBLIC_PINATA_SECRET;

        if (jwt) {
            headers['Authorization'] = `Bearer ${jwt}`;
        } else if (apiKey && apiSecret) {
            headers['pinata_api_key'] = apiKey;
            headers['pinata_secret_api_key'] = apiSecret;
        } else {
            throw new Error('No Pinata authentication found. Please check your .env.local file.');
        }

        const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: 'POST',
            headers: headers,
            body: formData
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Pinata raw error:", errorText);
            let errorMsg = 'Pinata upload failed';
            try {
                const err = JSON.parse(errorText);
                errorMsg = err.error?.message || err.message || errorMsg;
            } catch {
                // Not JSON
            }
            throw new Error(errorMsg);
        }

        return await res.json();
    } catch (error) {
        console.error("Pinata exception:", error);
        throw error;
    }
};

export const getIPFSUrl = (hash: string) => {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
};
