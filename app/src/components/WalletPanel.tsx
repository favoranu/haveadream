import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function shorten(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function WalletPanel() {
  const { connected, publicKey, connecting } = useWallet();

  return (
    <article className="card">
      <h2>Wallet</h2>
      {connected && publicKey ? (
        <>
          <p className="status ok">Connected</p>
          <p className="mono">{shorten(publicKey.toBase58())}</p>
          <p className="hint">Full address available in your wallet extension.</p>
        </>
      ) : (
        <>
          <p className="status">Not connected</p>
          <p className="hint">
            Connect Phantom or Solflare to read your $HAD balance on Solana mainnet.
          </p>
        </>
      )}
      <WalletMultiButton className="wallet-btn-block" />
      {connecting ? <p className="hint">Connecting…</p> : null}
    </article>
  );
}