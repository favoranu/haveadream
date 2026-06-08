import { useCallback, useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { HAD_DECIMALS, HAD_MINT } from '../config';

function formatAmount(raw: bigint) {
  const base = 10n ** BigInt(HAD_DECIMALS);
  const whole = raw / base;
  const frac = raw % base;
  const fracStr = frac.toString().padStart(HAD_DECIMALS, '0').replace(/0+$/, '');
  return fracStr ? `${whole.toLocaleString()}.${fracStr}` : whole.toLocaleString();
}

export function TokenBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    setError(null);
    try {
      const mint = new PublicKey(HAD_MINT);
      const ata = await getAssociatedTokenAddress(mint, publicKey);
      const account = await getAccount(connection, ata);
      setBalance(formatAmount(account.amount));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unable to load balance';
      if (msg.includes('could not find account') || msg.includes('Account does not exist')) {
        setBalance('0');
      } else {
        setError(msg);
        setBalance(null);
      }
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <article className="card">
      <h2>Your $HAD Balance</h2>
      {loading ? <p className="balance loading">Loading…</p> : null}
      {!loading && balance !== null ? (
        <p className="balance">{balance} <span>HAD</span></p>
      ) : null}
      {error ? <p className="error">{error}</p> : null}
      <button type="button" className="ghost-btn" onClick={load} disabled={loading}>
        Refresh
      </button>
      <p className="hint">Official mint only. Legacy contract is not shown here.</p>
    </article>
  );
}