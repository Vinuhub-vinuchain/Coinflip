import { useCoinflip } from './hooks/useCoinflip';
import { Coin } from './components/Coin';
import { BetControls } from './components/BetControls';
import { ResultDisplay } from './components/ResultDisplay';
import { ShareWin } from './components/ShareWin';
import { Leaderboard } from './components/Leaderboard';

function App() {
  const {
    account,
    connectWallet,
    disconnectWallet,
    vinBalance,
    winnings,
    contractBalance,
    betAmount,
    setBetAmount,
    choice,
    setChoice,
    coinSide,
    isFlipping,
    lastResult,
    leaderboard,
    approve,
    isApproving,
    isApproved,
    flip,
    error,
    clearError,
  } = useCoinflip();

return (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
    <div className="mb-6 sm:mb-8 flex flex-col items-center">
      <img
        src="https://photos.pinksale.finance/file/pinksale-logo-upload/1759847695513-f915ce15471ce09f03d8fbf68bc0616f.png"
        alt="VinuHub Logo"
        className="logo"
      />
    </div>
    <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
      Flip fate on VinuChain – Feeless & Fair
    </p>

    {error && (
      <p className="text-red-400 text-sm sm:text-base mb-4">{error}</p>
    )}

    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl card">
      {/* Wallet Section */}
      <div className="mb-6 sm:mb-8">
        <p id="wallet-status" className="text-gray-200 text-sm sm:text-base hidden"></p>
        <p id="contract-balance" className="text-gray-200 text-sm sm:text-base mb-4 hidden">
          Contract Balance: {contractBalance} VIN
        </p>
        {!account ? (
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="btn-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg pulse w-full text-sm sm:text-base"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <div className="flex justify-between items-center">
            <p className="text-gray-200 text-sm sm:text-base">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
            <button
              onClick={disconnectWallet}
              className="btn-secondary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Balance Section */}
      {account && (
        <div id="balance-section" className="mb-6 sm:mb-8">
          <p id="balances" className="text-gray-200 text-sm sm:text-base mb-4">
            VIN Balance: {vinBalance} | Winnings: {winnings} VIN
          </p>
          {!isApproved && (
            <button
              onClick={approve}
              disabled={isApproving}
              className="btn-secondary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg w-full mb-4 text-sm sm:text-base disabled:opacity-50"
            >
              {isApproving ? "Approving..." : `Approve ${betAmount} VIN`}
            </button>
          )}
        </div>
      )}

      {/* Bet Amount */}
      <div className="mb-6 sm:mb-8">
        <label className="block text-gray-200 text-sm sm:text-base mb-2">Bet Amount (VIN)</label>
        <div className="flex gap-2 mb-2">
          <input
            id="bet-amount"
            type="number"
            min="0.1"
            max="100000"
            step="0.1"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="Enter amount"
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-white disabled:bg-gray-900 disabled:cursor-not-allowed"
            disabled={!account}
          />
          <button
            id="set-max"
            onClick={() => setBetAmount(maxBet)}
            disabled={!account}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm sm:text-base disabled:opacity-50"
          >
            Max
          </button>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm">Min: 0.1 VIN | Max: {maxBet} VIN</p>
        {betError && <p className="text-red-400 text-xs sm:text-sm mt-1">{betError}</p>}
      </div>

      {/* Choose Side */}
      <div className="mb-6 sm:mb-8">
        <label className="block text-gray-200 text-sm sm:text-base mb-2">Choose Side</label>
        <div className="flex gap-2 sm:gap-4">
          <button
            id="choose-heads"
            onClick={() => setChoice(true)}
            className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${choice ? "btn-primary" : "btn-secondary"}`}
            disabled={!account}
          >
            Heads
          </button>
          <button
            id="choose-tails"
            onClick={() => setChoice(false)}
            className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${!choice ? "btn-primary" : "btn-secondary"}`}
            disabled={!account}
          >
            Tails
          </button>
        </div>
      </div>

      {/* Coin */}
      <div className="coin-container mb-6 sm:mb-8 mx-auto">
        <Coin side={coinSide} flipping={isFlipping} />
      </div>

      {/* Flip & Withdraw Buttons */}
      <button
        id="flip-coin"
        onClick={flip}
        className="btn-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg w-full mb-4 sm:mb-6 text-sm sm:text-base disabled:opacity-50"
        disabled={isFlipping || !account || !!betError || isApproving || !isApproved}
      >
        {isFlipping ? "Flipping..." : "Flip Coin"}
      </button>

      <button
        id="withdraw"
        onClick={withdraw}
        className="btn-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg w-full text-sm sm:text-base disabled:opacity-50"
        disabled={!account || parseFloat(winnings) === 0}
      >
        Withdraw Winnings
      </button>

      {/* Share Section */}
      {lastWin && (
        <div id="share-section" className="mb-6 sm:mb-8">
          <ShareWin payout={lastWin.payout} />
        </div>
      )}

      {/* Result */}
      {lastResult && <ResultDisplay result={lastResult} />}

      {/* Recent Flips */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-100">Recent Flips</h2>
        <ul id="history" className="text-gray-200 text-sm sm:text-base">
          {history.length === 0 ? (
            <p className="text-gray-300">No flips yet.</p>
          ) : (
            history.map((flip, i) => (
              <li key={i} className="mb-1">
                {flip.heads ? "Heads" : "Tails"} - {flip.won ? "Won" : "Lost"} ({flip.bet} VIN → {flip.payout} VIN)
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Leaderboard */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-100">Leaderboard</h2>
        <Leaderboard leaderboard={leaderboard} />
      </div>
    </div>
  </div>
);
