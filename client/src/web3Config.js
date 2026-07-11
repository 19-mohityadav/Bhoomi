import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

import BhoomiArtifact from './Bhoomi.json';

export const wagmiConfig = getDefaultConfig({
  appName: 'Bhoomi - Land Registry',
  projectId: '25ffe68d7eb710b43c6ec28428579466',
  chains: [sepolia],
  ssr: false,
});

export const CONTRACT_ADDRESS = '0x88f250D2aB404c29A7273F4dCE2924bF3CaBa195';
export const CONTRACT_ABI = BhoomiArtifact.abi;
