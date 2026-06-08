import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SITE_URL } from '../config';

export function Header() {
  return (
    <header className="app-header">
      <a href={SITE_URL} className="brand">
        <span className="brand-mark">$HAD</span>
        <span className="brand-sub">Have A Dream App</span>
      </a>
      <nav className="header-nav">
        <a href={SITE_URL}>Main Site</a>
        <a href={`${SITE_URL}/whitepaper.html`}>Whitepaper</a>
        <WalletMultiButton />
      </nav>
    </header>
  );
}