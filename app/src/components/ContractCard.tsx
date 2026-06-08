import { useState } from 'react';
import { HAD_MINT, HAD_MINT_LEGACY, SOLSCAN_URL } from '../config';

export function ContractCard() {
  const [msg, setMsg] = useState('');

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg('Copied!');
      setTimeout(() => setMsg(''), 2000);
    } catch {
      setMsg('Copy failed');
    }
  }

  return (
    <article className="card card-wide">
      <h2>Official Contract (v2)</h2>
      <code className="contract">{HAD_MINT}</code>
      <div className="row">
        <button type="button" className="ghost-btn" onClick={() => copy(HAD_MINT)}>Copy</button>
        <a className="link-btn" href={SOLSCAN_URL} target="_blank" rel="noopener noreferrer">Solscan ↗</a>
      </div>
      {msg ? <p className="copy-msg">{msg}</p> : null}
      <div className="legacy">
        <strong>Deprecated legacy mint:</strong>
        <code>{HAD_MINT_LEGACY}</code>
        <span>Do not buy or share the old address.</span>
      </div>
    </article>
  );
}