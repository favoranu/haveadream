import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import '@solana/wallet-adapter-react-ui/styles.css';
import { RPC_PATH } from './config';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import './App.css';

function getRpcEndpoint() {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_RPC_URL || 'https://api.mainnet-beta.solana.com';
  }
  return `${window.location.origin}${RPC_PATH}`;
}

export default function App() {
  const endpoint = useMemo(getRpcEndpoint, []);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="app-shell">
            <Header />
            <main className="app-main">
              <Dashboard />
            </main>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}