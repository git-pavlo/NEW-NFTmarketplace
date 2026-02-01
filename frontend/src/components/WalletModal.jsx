import WalletConnect from './Wallet/WalletConnect';
import WalletGuard from './Wallet/WalletGuard';

export default function WalletModal() {
  return (
      <>
      <WalletGuard />
      <WalletConnect />
      </>
  );
}
