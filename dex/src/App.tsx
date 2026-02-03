import { FC, ReactNode } from 'react';
import { OrderlyAppProvider } from '@orderly.network/react-app';
import { WalletConnectorProvider } from '@orderly.network/wallet-connector';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { TradingPage } from '@orderly.network/trading';

const App: FC = () => {
  return (
    <WalletConnectorProvider
      solanaInitial={{ network: WalletAdapterNetwork.Mainnet }}
    >
      <OrderlyAppProvider
        brokerId="orderly"
        brokerName="Pizza Club"
        networkId="mainnet"
        appIcons={{}}
      >
        <div className="perp-dex-app">
          <TradingPage />
        </div>
      </OrderlyAppProvider>
    </WalletConnectorProvider>
  );
};

export default App;
