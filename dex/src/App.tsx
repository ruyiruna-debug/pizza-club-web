import { type FC } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { OrderlyConfigProvider } from '@orderly.network/hooks';
import { OrderlyAppProvider } from '@orderly.network/react-app';
import { TradingPage } from '@orderly.network/trading';
import { wagmiConfig } from './config/wagmi';
import WagmiWalletConnector from './WalletConnector';
import AiStrategyBanner from './AiStrategyBanner';

const queryClient = new QueryClient();

const BROKER_ID = 'orderly';
const NETWORK_ID = 'mainnet' as const;

/** TradingView 图表配置，避免库内部对 undefined 解构报错。未配置真实库路径时 K 线不显示，其余交易功能正常。 */
const tradingViewConfig = {
  library_path: '/charting_library/',
  scriptSRC: '/charting_library/charting_library.js',
};

const App: FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0809',
        color: '#fce7f3',
        fontFamily: 'sans-serif',
      }}
    >
      <header style={{ padding: '12px 20px', borderBottom: '1px solid rgba(236,72,153,0.3)' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#ec4899' }}>Pizza Club DEX</h1>
      </header>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <OrderlyConfigProvider brokerId={BROKER_ID} networkId={NETWORK_ID}>
            <WagmiWalletConnector>
              <OrderlyAppProvider
                brokerId={BROKER_ID}
                brokerName="Pizza Club"
                networkId={NETWORK_ID}
                appIcons={{}}
              >
                <div className="perp-dex-app">
                  <AiStrategyBanner />
                  <TradingPage symbol="PERP_ETH_USDC" tradingViewConfig={tradingViewConfig} />
                </div>
              </OrderlyAppProvider>
            </WagmiWalletConnector>
          </OrderlyConfigProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
};

export default App;
