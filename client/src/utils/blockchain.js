// ─── Bhoomi Smart Contract Config ────────────────────────────────────────────
// Contract deployed on Sepolia Testnet
export const BHOOMI_CONTRACT_ADDRESS = '0xB89f8932Ab035641dCD22C28529Aa9cad5a35Fc3';

export const BHOOMI_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "address", "name": "owner", "type": "address" }],
    "name": "ERC721IncorrectOwner", "type": "error"
  },
  {
    "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ERC721InsufficientApproval", "type": "error"
  },
  { "inputs": [{ "internalType": "address", "name": "approver", "type": "address" }], "name": "ERC721InvalidApprover", "type": "error" },
  { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }], "name": "ERC721InvalidOperator", "type": "error" },
  { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "ERC721InvalidOwner", "type": "error" },
  { "inputs": [{ "internalType": "address", "name": "receiver", "type": "address" }], "name": "ERC721InvalidReceiver", "type": "error" },
  { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }], "name": "ERC721InvalidSender", "type": "error" },
  { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "ERC721NonexistentToken", "type": "error" },
  { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "OwnableInvalidOwner", "type": "error" },
  { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "OwnableUnauthorizedAccount", "type": "error" },
  {
    "anonymous": false,
    "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "approved", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "Approval", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }],
    "name": "ApprovalForAll", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "uint256", "name": "_fromTokenId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_toTokenId", "type": "uint256" }],
    "name": "BatchMetadataUpdate", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "uint256", "name": "_tokenId", "type": "uint256" }],
    "name": "MetadataUpdate", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }],
    "name": "OwnershipTransferred", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "Transfer", "type": "event"
  },
  {
    "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "buyLand", "outputs": [], "stateMutability": "payable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getApproved", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" }],
    "name": "isApprovedForAll", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "uint256", "name": "price", "type": "uint256" }],
    "name": "listLand", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "parcels",
    "outputs": [
      { "internalType": "string", "name": "coordinates", "type": "string" },
      { "internalType": "uint256", "name": "price", "type": "uint256" },
      { "internalType": "bool", "name": "isForSale", "type": "bool" }
    ],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "citizen", "type": "address" },
      { "internalType": "string", "name": "tokenURI", "type": "string" },
      { "internalType": "string", "name": "coords", "type": "string" }
    ],
    "name": "registerLand",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }],
    "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }],
    "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }],
    "name": "supportsInterface", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
    "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  }
];

// ─── Sepolia Chain ID ─────────────────────────────────────────────────────────
export const SEPOLIA_CHAIN_ID = 11155111;

// ─── Get MetaMask Provider & Signer ──────────────────────────────────────────
export const getMetaMaskSigner = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  // Request account access
  await window.ethereum.request({ method: 'eth_requestAccounts' });

  // Check network — force Sepolia
  const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
  const chainId = parseInt(chainIdHex, 16);

  if (chainId !== SEPOLIA_CHAIN_ID) {
    // Try to switch to Sepolia automatically
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia hex
      });
    } catch (switchError) {
      // If chain not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            rpcUrls: ['https://rpc.sepolia.org'],
            nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      } else {
        throw new Error('Please switch MetaMask to the Sepolia Testnet.');
      }
    }
  }

  // Use viem to create a wallet client from MetaMask
  const { createWalletClient, custom, createPublicClient, http } = await import('viem');
  const { sepolia } = await import('viem/chains');

  const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  });

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  const [address] = await walletClient.getAddresses();
  return { walletClient, publicClient, address };
};

// ─── Mint NFT via Smart Contract ─────────────────────────────────────────────
// Called by Authority when approving a land submission.
// The Authority wallet MUST be the contract owner on-chain.
export const mintLandNFT = async ({ citizenAddress, ipfsMetadataUrl, coordinates }) => {
  const { walletClient, publicClient, address } = await getMetaMaskSigner();

  console.log(`[Blockchain] Minting NFT for ${citizenAddress}...`);
  console.log(`[Blockchain] Authority wallet: ${address}`);
  console.log(`[Blockchain] Token URI: ${ipfsMetadataUrl}`);

  // Simulate first to catch errors before spending gas
  const { request } = await publicClient.simulateContract({
    address: BHOOMI_CONTRACT_ADDRESS,
    abi: BHOOMI_ABI,
    functionName: 'registerLand',
    args: [citizenAddress, ipfsMetadataUrl, coordinates],
    account: address,
  });

  // Send the transaction
  const txHash = await walletClient.writeContract(request);
  console.log(`[Blockchain] Tx sent: ${txHash}`);

  // Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log(`[Blockchain] Confirmed in block ${receipt.blockNumber}`);

  // Extract tokenId from Transfer event (from 0x0 address = mint)
  const transferEvent = receipt.logs.find(log =>
    log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  );
  const tokenId = transferEvent
    ? parseInt(transferEvent.topics[3], 16)
    : null;

  return {
    txHash,
    tokenId,
    blockNumber: Number(receipt.blockNumber),
  };
};

// ─── Buy Land via Smart Contract ──────────────────────────────────────────────
// Called by Buyer when purchasing an NFT from marketplace.
export const buyLandNFT = async ({ tokenId, priceEth }) => {
  const { walletClient, publicClient, address } = await getMetaMaskSigner();

  const { parseEther } = await import('viem');
  const priceWei = parseEther(String(priceEth));

  console.log(`[Blockchain] Buying NFT #${tokenId} for ${priceEth} ETH...`);

  const { request } = await publicClient.simulateContract({
    address: BHOOMI_CONTRACT_ADDRESS,
    abi: BHOOMI_ABI,
    functionName: 'buyLand',
    args: [BigInt(tokenId)],
    value: priceWei,
    account: address,
  });

  const txHash = await walletClient.writeContract(request);
  console.log(`[Blockchain] Buy Tx sent: ${txHash}`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log(`[Blockchain] Buy confirmed in block ${receipt.blockNumber}`);

  return {
    txHash,
    blockNumber: Number(receipt.blockNumber),
  };
};

// ─── Get ETH Balance ──────────────────────────────────────────────────────────
export const getWalletBalance = async (address) => {
  try {
    const { createPublicClient, http, formatEther } = await import('viem');
    const { sepolia } = await import('viem/chains');
    const client = createPublicClient({ chain: sepolia, transport: http() });
    const balance = await client.getBalance({ address });
    return parseFloat(formatEther(balance)).toFixed(4);
  } catch {
    return '0.0000';
  }
};
