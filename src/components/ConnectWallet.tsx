import { FC } from "react";

interface ConnectWalletProps {
  account: string | null;
  contractBalance: string;
  connecting: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

export const ConnectWallet: FC<ConnectWalletProps> = ({ account, contractBalance, connecting, connectWallet, disconnectWallet }) => (
  <div className="mb-6 sm:mb-8">
    {account && <p className="text-gray-200 text-sm sm:text-base">Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>}
    {account && <p className="text-gray-200 text-sm sm:text-base mb-4">Contract Balance: {contractBalance} VIN</p>}
    <button
      onClick={connectWallet}
      className="btn-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg pulse w-full text-sm sm:text-base"
      style={{ display: account ? "none" : "block" }}
      disabled={connecting}
    >
      {connecting ? "Connecting..." : "Connect Wallet"}
    </button>
    <button
      onClick={disconnectWallet}
      className="btn-secondary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg w-full text-sm sm:text-base"
      style={{ display: account ? "block" : "none" }}
    >
      Disconnect Wallet
    </button>
  </div>
);
