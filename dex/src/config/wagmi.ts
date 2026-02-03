import { http, createConfig } from 'wagmi';
import { arbitrum, base, bsc, optimism, polygon } from 'wagmi/chains';

export const wagmiConfig = createConfig({
  chains: [arbitrum, optimism, base, polygon, bsc],
  transports: {
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
});
