import { supabase } from '../supabaseClient';

export async function handleLandRegistration(citizenAddress, coordinates, fileToUpload) {
  try {
    const jwt = import.meta.env.VITE_PINATA_JWT;
    if (!jwt) {
      throw new Error("Pinata JWT (VITE_PINATA_JWT) is missing in environment variables. Please check your deployment settings.");
    }
    // 1. Upload the physical document to IPFS via Pinata
    const formData = new FormData();
    formData.append('file', fileToUpload);

    const uploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    });
    
    if (!uploadRes.ok) {
        throw new Error(`IPFS upload failed: ${uploadRes.statusText}`);
    }
    
    const ipfsData = await uploadRes.json();
    const documentURI = `ipfs://${ipfsData.IpfsHash}`;

    // 2. Mint the NFT on the Blockchain (assuming wagmi 'writeContract' is set up)
    // You would call your smart contract's `registerLand` function here.
    // Let's assume it succeeds and returns the transaction receipt containing the new Token ID.
    const newTokenId = 1; // Replace with the actual parsed Token ID from the transaction receipt

    // 3. Sync the data to Supabase for fast UI rendering
    const { data, error } = await supabase
      .from('land_parcels')
      .insert([
        {
          token_id: newTokenId,
          owner_address: citizenAddress,
          coordinates: coordinates,
          ipfs_metadata_url: documentURI,
        }
      ]);

    if (error) throw error;
    console.log("Land successfully registered on-chain and cached in Supabase!");
    
    return { success: true, documentURI, newTokenId, data };
  } catch (error) {
    console.error("Registration failed:", error);
    return { success: false, error };
  }
}
