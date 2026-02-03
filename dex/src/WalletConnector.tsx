import { type FC, type PropsWithChildren, useEffect, useMemo, useState } from 'react';
import {
  WalletConnectorContext,
  type WalletConnectorContextState,
} from '@orderly.network/hooks';
import { ChainNamespace } from '@orderly.network/types';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useChains,
} from 'wagmi';
const WagmiWalletConnector: FC<PropsWithChildren> = ({ children }) => {
  const chainsRaw = useChains();
  const chains = chainsRaw ?? [];
  const { address, isConnected, chain, connector, status } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync, isPending: isSwitchPending } = useSwitchChain();

  const [provider, setProvider] = useState<unknown>(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!connector || !address) {
      setProvider(null);
      setLabel('');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const p = await connector.getProvider();
        const name = (await connector.getClient?.().then((c) => c?.name)) ?? connector.name ?? '';
        if (!cancelled) {
          setProvider(p);
          setLabel(name);
        }
      } catch {
        if (!cancelled) setProvider(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connector, address]);

  const state: WalletConnectorContextState = useMemo(
    () => ({
      namespace: ChainNamespace.evm,
      connect: async () => {
        if (isConnected && address && connector) {
          return [
            {
              chains: chains.map((ch) => ({ id: ch.id, namespace: ChainNamespace.evm })),
              accounts: [{ address }],
              icon: '',
              label,
              provider,
            },
          ];
        }
        const c = connectors[0];
        if (!c) return [];
        const result = await connectAsync({ connector: c });
        if (!result) return [];
        return [
          {
            chains: chains.map((ch) => ({ id: ch.id, namespace: ChainNamespace.evm })),
            accounts: result.accounts?.map((a) => ({ address: a })) ?? [],
            icon: '',
            label: c.name ?? '',
            provider: await c.getProvider(),
          },
        ];
      },
      disconnect: async () => {
        await disconnectAsync();
        return [];
      },
      connecting: isPending,
      setChain: async (opts: { chainId: string | number }) => {
        await switchChainAsync?.({ chainId: Number(opts.chainId) });
      },
      chains: chains.map((ch) => ({ id: ch.id, namespace: ChainNamespace.evm })),
      switchChain: async (opts: { chainId: string }) => {
        await switchChainAsync?.({ chainId: Number(opts.chainId) });
      },
      wallet: isConnected
        ? {
            chains: chains.map((ch) => ({ id: ch.id, namespace: ChainNamespace.evm })),
            accounts: address ? [{ address }] : [],
            icon: '',
            label,
            provider,
          }
        : null,
      connectedChain: chain
        ? { id: String(chain.id), namespace: ChainNamespace.evm }
        : null,
      settingChain: status === 'reconnecting' || isSwitchPending,
    }),
    [
      chains,
      connectors,
      connectAsync,
      disconnectAsync,
      isPending,
      switchChainAsync,
      isSwitchPending,
      isConnected,
      address,
      chain,
      status,
      label,
      provider,
    ]
  );

  return (
    <WalletConnectorContext.Provider value={state}>
      {children}
    </WalletConnectorContext.Provider>
  );
};

export default WagmiWalletConnector;
