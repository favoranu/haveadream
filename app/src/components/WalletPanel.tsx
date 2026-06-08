import { useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TurnstileWidget } from './TurnstileWidget';

function shorten(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

const turnstileEnabled = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim());

export function WalletPanel() {
  const { connected, publicKey, connecting } = useWallet();
  const [verified, setVerified] = useState(!turnstileEnabled);

  const handleVerify = useCallback((token: string) => {
    setVerified(Boolean(token));
  }, []);

  const handleExpire = useCallback(() => {
    setVerified(false);
  }, []);

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
            Connect Phantom to read your $HAD balance on Solana mainnet.
          </p>
        </>
      )}
      <TurnstileWidget onVerify={handleVerify} onExpire={handleExpire} />
      {turnstileEnabled && !verified ? (
        <p className="hint">Complete verification above to connect your wallet.</p>
      ) : null}
      <div className={verified ? undefined : 'wallet-gated'}>
        <WalletMultiButton className="wallet-btn-block" />
      </div>
      {connecting ? <p className="hint">Connecting…</p> : null}
    </article>
  );
}