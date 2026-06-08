import { useWallet } from '@solana/wallet-adapter-react';
import { ContractCard } from './ContractCard';
import { TokenBalance } from './TokenBalance';
import { WalletPanel } from './WalletPanel';

export function Dashboard() {
  const { connected } = useWallet();

  return (
    <div className="dashboard">
      <section className="hero-panel">
        <p className="eyebrow">Solana · SPL Token-2022</p>
        <h1>Connect. Verify. Build the dream.</h1>
        <p className="lead">
          Official $HAD app — wallet connect, on-chain balance checks,
          and the foundation for governance and haveadream.xyz utilities.
        </p>
      </section>

      <div className="grid">
        <WalletPanel />
        {connected ? <TokenBalance /> : null}
        <ContractCard />
      </div>
    </div>
  );
}