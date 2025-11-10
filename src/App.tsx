import { useWeb3 } from "./hooks/useWeb3";
import { ConnectWallet } from "./components/ConnectWallet";
import { BetInput } from "./components/BetInput";
import { FlipButton } from "./components/FlipButton";
import { Coin } from "./components/Coin";
import { Leaderboard } from "./components/Leaderboard";

export default function App() {
  const {
    account,
    vinBalance,
    playerBalance,
    contractBalance,
    isApproved,
    connecting,
    flipping,
    approving,
    coinSide,
    choice,
    betAmount,
    history,
    leaderboard,
    lastWin,
    error,
    connectWallet,
    disconnectWallet,
    approveVin,
    flipCoin,
    withdraw,
    setBetAmount,
    setChoice,
  } = useWeb3();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-white font-sans bg-gradient-to-br from-gray-900 to-gray-700">
      <img src="/logo.png" alt="VinuHub Logo" className="logo mb-6 sm:mb-8 h-12" />
      <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6 sm:mb-8">Flip fate on VinuChain – Feeless & Fair</p>
      {error && <p className="text-red-400 text-sm sm:text-base mb-4">{error}</p>}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl card">
        <ConnectWallet
          account={account}
          contractBalance={contractBalance}
          connecting={connecting}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
        />
        {account && (
          <>
            <div className="mb-6 sm:mb-8">
              <p className="text-gray-200 text-sm sm:text-base mb-4">VIN Balance: {vinBalance} | Winnings: {playerBalance} VIN</p>
              {!isApproved && (
                <button
                  onClick={approveVin}
                  disabled={approving}
                  className="btn-secondary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg w-full mb-4 disabled:opacity-50"
                >
                  {approving ? "Approving..." : `Approve ${betAmount} VIN`}
                </button>
              )}
            </div>
            <BetInput betAmount={betAmount} setBetAmount={setBetAmount} disabled={!account} />
            <div className="mb-6 sm:mb-8">
              <label className="block text-gray-200 text-sm sm:text-base mb-2">Choose Side</label>
              <div className="flex gap-2 sm:gap-4">
                <button
                  onClick={() => setChoice(true)}
                  className={`flex-1 ${choice ? "btn-primary" : "btn-secondary"} text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base`}
                  disabled={!account}
                >
                  Heads
                </button>
                <button
                  onClick={() => setChoice(false)}
                  className={`flex-1 ${!choice ? "btn-primary" : "btn-secondary"} text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base`}
                  disabled={!account}
                >
                  Tails
                </button>
              </div>
            </div>
            <Coin coinSide={coinSide} flipping={flipping} />
            <FlipButton flipCoin={flipCoin} disabled={flipping || !account || !isApproved} flipping={flipping} />
            <button
              onClick={withdraw}
              disabled={!account || parseFloat(playerBalance) === 0}
              className="btn-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg w-full mb-4 sm:mb-6 text-sm sm:text-base disabled:opacity-50"
            >
              Withdraw Winnings
            </button>
            {lastWin && (
              <div className="mb-6 sm:mb-8">
                <button
                  onClick={() => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(`I won ${lastWin.payout} VIN on VinuHub! 🪙 #VinuChain`)}`, "_blank")}
                  className="btn-secondary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg w-full text-sm sm:text-base"
                >
                  Share to X
                </button>
              </div>
            )}
            {history.length > 0 && (
              <div className="mb-6 sm:mb-8 p-4 bg-gray-800 rounded-lg">
                {history.map((flip, i) => (
                  <p key={i} className="text-sm sm:text-base">
                    {flip.heads ? "Heads" : "Tails"} - {flip.won ? "You Won!" : "You Lost"} (Bet: {flip.bet} VIN | Payout: {flip.payout} VIN)
                  </p>
                ))}
              </div>
            )}
            <Leaderboard leaderboard={leaderboard} />
          </>
        )}
      </div>
    </div>
  );
}
